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

  const dir = import.meta.dirname
  const template = path.join(dir, "program-template.gt")
  const raw = fs.readFileSync(template, "utf8")

  const inputVariables = [
    {
      name: "email_address",
      type: "string",
      description: "the email address to be subscribed",
      required: true,
      shouldBeCleanedUp: false,
    },
    {
      name: "mailchimp_list_id",
      type: "string",
      description:
        "the ID of the list to which the email address will be subscribed",
      required: true,
      shouldBeCleanedUp: true,
    },
    {
      name: "options",
      type: "association",
      description: `data to be injected into to the payload object sent in the request to Mailchimp`,
      required: false,
      default: "{}",
      shouldBeCleanedUp: true,
    },
  ]

  const outputVariables = [
    {
      name: "was_subscribed",
      type: "string",
      description: `a string value of "yes" or "no" indicating whether or not the email address was successfully subscribed to the mailing list`,
    },
    {
      name: "mailchimp_subscribe_error",
      type: "association",
      description: `an association with response data from Mailchimp; will be an empty association (\`{}\`) if the subscription request succeeds`,
    },
  ]

  const nameColumnWidth = Math.max(
    ...inputVariables.concat(outputVariables).map(v => v.name.length),
  )

  const docsInputsTable = createDocsTable(
    new DataFrame({
      name: inputVariables.map(v => v.name + (v.required ? "*" : "")),
      description: inputVariables.map(
        v => typePhrase(v.type) + " representing " + v.description,
      ),
    }),
    {
      nameColumnLabel: "INPUT 👉",
      nameColumnWidth,
      descriptionColumnLabel: "DESCRIPTION ℹ️",
    },
  ).replace("-- ", "")

  const docsOutputsTable = createDocsTable(
    new DataFrame({
      name: outputVariables.map(v => v.name),
      description: outputVariables.map(
        v => typePhrase(v.type) + " representing " + v.description,
      ),
    }),
    {
      nameColumnLabel: "OUTPUT 👈",
      nameColumnWidth,
      descriptionColumnLabel: "DESCRIPTION ℹ️",
    },
  ).replace("-- ", "")

  const variableChecks = inputVariables
    .map(v => {
      const undefinedRequiredBlock = unindent(
        removeLeadingAndTrailingSpaces(`
					*if: not ${v.name}
						>> error_message = "You must define a variable called \`${v.name}\` that has ${typePhrase(v.type)} value representing ${v.description}!"
						*program: @jrc03c/show-error
				`),
      )

      const undefinedOptionalBlock = unindent(
        removeLeadingAndTrailingSpaces(`
					*if: not ${v.name}
						>> ${v.name} = ${v.type === "string" ? JSON.stringify(v.default) : v.default}
				`),
      )

      const dataTypeBlock = unindent(
        removeLeadingAndTrailingSpaces(`
					*if: not (${v.name}.type = "${v.type}")
						>> error_message = "The variable \`${v.name}\` must have ${typePhrase(v.type)} value representing ${v.description}. (The value you provided was a(n) {${v.name}.type}.)"
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

  const cleanup = inputVariables
    .filter(v => !!v.shouldBeCleanedUp)
    .map(v => `>> ${v.name} = ""`)
    .join("\n")

  const out = removeExtraWhitespace(
    raw
      .replace("{{ docsInputsTable }}", docsInputsTable)
      .replace("{{ docsOutputsTable }}", docsOutputsTable)
      .replace("{{ variableChecks }}", variableChecks)
      .replace("{{ cleanup }}", cleanup),
  )

  fs.writeFileSync(path.join(dir, "program.gt"), out, "utf8")
  console.log("\nDone! 🎉\n")
}

if (process.argv.includes("--watch") || process.argv.includes("-w")) {
  const dir = import.meta.dirname
  const target = path.join(dir, "program-template.gt")

  watch({
    target,
    modified: rebuild,
  })
}

rebuild()
