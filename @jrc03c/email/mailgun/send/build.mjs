import { createDocsTable } from "../../../../_build_helpers/create-docs-table.mjs"
import { DataFrame } from "@jrc03c/js-math-tools"
import { removeExtraWhitespace } from "../../../../_build_helpers/remove-extra-whitespace.mjs"
import { removeLeadingAndTrailingSpaces } from "../../../../_build_helpers/remove-leading-and-trailing-spaces.mjs"
import { typePhrase } from "../../../../_build_helpers/type-phrase.mjs"
import { unindent } from "@jrc03c/js-text-tools"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"

function rebuild() {
  console.log("-----")
  console.log(`\nRebuilding... (${new Date().toLocaleString()})`)

  try {
    const template = fs.readFileSync(TEMPLATE_FILE, "utf8")
    const testsTemplate = fs.readFileSync(TESTS_TEMPLATE_FILE, "utf8")

    const variables = [
      {
        name: "domain_name",
        urlParamName: "domain_name",
        inputOrOutput: "input",
        type: "string",
        required: true,
        description: "the domain name from which the email will be sent",
        default: "clearerthinking.net",
        shouldStringifyDefaultValue: true,
      },
      {
        name: "from_address",
        urlParamName: "from",
        inputOrOutput: "input",
        type: "string",
        required: true,
        description: "the email address from which the email will be sent",
        default: "info@clearerthinking.net",
        shouldStringifyDefaultValue: true,
      },
      {
        name: "to_address",
        urlParamName: "to",
        inputOrOutput: "input",
        type: "string",
        required: true,
        description: "the email address to which the email will be sent",
        default: "joshrcastle@gmail.com",
        shouldStringifyDefaultValue: true,
      },
      {
        name: "subject",
        urlParamName: "subject",
        inputOrOutput: "input",
        type: "string",
        required: true,
        description: "the subject line of the email to be sent",
        default: "GuidedTrack + Mailgun",
        shouldStringifyDefaultValue: true,
      },
      {
        name: "body_text",
        urlParamName: "text",
        inputOrOutput: "input",
        type: "string",
        required: false,
        description: "the plaintext body of the email to be sent",
        default: "body_html",
        defaultForTests:
          "Hey! This is a test email from GuidedTrack via Mailgun!",
        shouldStringifyDefaultValue: false,
      },
      {
        name: "body_html",
        urlParamName: "html",
        inputOrOutput: "input",
        type: "string",
        required: true,
        description: "the HTML body of the email to be sent",
        default:
          "Hey! This is a test email from <b>GuidedTrack</b> via <b>Mailgun</b>!",
        shouldStringifyDefaultValue: true,
      },
      {
        name: "was_sent",
        inputOrOutput: "output",
        type: "string",
        description:
          "a string with a value of 'yes' or 'no' indicating whether or not the email was sent",
        default: "no",
      },
      {
        name: "mailgun_send_error",
        inputOrOutput: "output",
        type: "string",
        description:
          "a string containing error information from Mailgun after a failed send attempt",
        default: "",
      },
    ].toSorted((a, b) => (a.name < b.name ? -1 : 1))

    const variableChecks = variables
      .filter(v => v.inputOrOutput === "input")
      .map(v => {
        const undefinedRequiredBlock = unindent(
          removeLeadingAndTrailingSpaces(`
						*if: not ${v.name}
							>> error_message = "You must define a variable called <code>${v.name}</code> that is ${typePhrase(v.type)} representing ${v.description}!"
							*program: @jrc03c/show-error
					`),
        )

        const undefinedOptionalBlock = unindent(
          removeLeadingAndTrailingSpaces(`
						*if: not ${v.name}
							>> ${v.name} = ${v.type === "string" && v.shouldStringifyDefaultValue ? JSON.stringify(v.default) : v.default}
					`),
        )

        const dataTypeBlock = unindent(
          removeLeadingAndTrailingSpaces(`
					*if: not (${v.name}.type = "${v.type}")
						>> error_message = "The variable called <code>${v.name}</code> must have ${typePhrase(v.type)} value representing ${v.description}! (The value you provided is a(n) {${v.name}.type}.)"
						*program: @jrc03c/show-error  
				`),
        )

        return unindent(
          removeLeadingAndTrailingSpaces(
            "---\n\n" +
              (v.required ? undefinedRequiredBlock : undefinedOptionalBlock) +
              "\n\n" +
              dataTypeBlock,
          ),
        )
      })
      .join("\n\n")

    const nameColumnLength = Math.max(...variables.map(v => v.name.length))

    const docsInputsTable = createDocsTable(
      new DataFrame({
        name: variables
          .filter(v => v.inputOrOutput === "input")
          .map(v => v.name + (v.required ? "*" : "")),
        description: variables
          .filter(v => v.inputOrOutput === "input")
          .map(v => v.description),
      }),
      {
        nameColumnLabel: "INPUT 👉",
        nameColumnLength,
        descriptionColumnLabel: "DESCRIPTION ℹ️",
      },
    )

    const docsOutputsTable = createDocsTable(
      new DataFrame({
        name: variables
          .filter(v => v.inputOrOutput === "output")
          .map(v => v.name),
        description: variables
          .filter(v => v.inputOrOutput === "output")
          .map(v => v.description),
      }),
      {
        nameColumnLabel: "OUTPUT 👈",
        nameColumnLength,
        descriptionColumnLabel: "DESCRIPTION ℹ️",
      },
    )

    const variableEncodings = variables
      .filter(v => v.type === "string")
      .map(v => `>> ${v.name} = ${v.name}.encode("URL")`)
      .join("\n")

    const pathConcatenations = variables
      .filter(v => !!v.urlParamName)
      .map(
        (v, i) =>
          `>> path = "{path}${i === 0 ? "" : "&"}${v.urlParamName}={${v.name}}"`,
      )
      .join("\n")

    const cleanup = variables
      .map(v => `>> ${v.name} = ""`)
      .concat([`>> path = ""`, `>> it = ""`])
      .toSorted((a, b) => (a < b ? -1 : 1))
      .join("\n")

    const variableQuestions = variables
      .map(v => {
        return unindent(
          removeLeadingAndTrailingSpaces(`
						*question: ${v.name}
							*tip: ${v.description}
							*default: "${v.defaultForTests || v.default}"
							*save: ${v.name}
					`),
        )
      })
      .join("\n\n")
      .split("\n")
      .map((line, i) => (i > 0 ? "\t" + line : line))
      .join("\n")

    const program = removeExtraWhitespace(
      template.replaceAll("{{ variableChecks }}", variableChecks),
    )
      .split("\n")
      .map(line =>
        line.includes("{{ docsInputsTable }}")
          ? docsInputsTable
          : line.includes("{{ docsOutputsTable }}")
            ? docsOutputsTable
            : line,
      )
      .join("\n")
      .replace("{{ variableEncodings }}", variableEncodings)
      .replace("{{ pathConcatenations }}", pathConcatenations)
      .replace("{{ cleanup }}", cleanup)

    const tests = testsTemplate.replace(
      "{{ variableQuestions }}",
      variableQuestions,
    )

    fs.writeFileSync(PROGRAM_FILE, program, "utf8")
    fs.writeFileSync(TESTS_FILE, tests, "utf8")

    console.log("\nDone! 🎉\n")
  } catch (e) {
    console.error(e)
  }
}

const DIR = import.meta.dirname
const TEMPLATE_FILE = path.join(DIR, "program-template.gt")
const TESTS_TEMPLATE_FILE = path.join(DIR, "tests-template.gt")
const PROGRAM_FILE = path.join(DIR, "program.gt")
const TESTS_FILE = path.join(DIR, "tests.gt")

if (process.argv.includes("-w") || process.argv.includes("--watch")) {
  watch({
    target: DIR,
    include: [TEMPLATE_FILE, TESTS_TEMPLATE_FILE],
    modified: rebuild,
  })
}

rebuild()
