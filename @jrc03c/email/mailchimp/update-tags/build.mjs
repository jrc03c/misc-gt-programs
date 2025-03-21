import { createDocsTable } from "../../../../_build_helpers/create-docs-table.mjs"
import { DataFrame } from "@jrc03c/js-math-tools"
import { indent, unindent } from "@jrc03c/js-text-tools"
import { removeLeadingAndTrailingSpaces } from "../../../../_build_helpers/remove-leading-and-trailing-spaces.mjs"
import { render } from "../../../../_build_helpers/render.mjs"
import { typePhrase } from "../../../../_build_helpers/type-phrase.mjs"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

function rebuild() {
  console.log("-----")
  console.log(`Rebuilding... (${new Date().toLocaleString()})`)

  try {
    const dir = import.meta.dirname

    // main program
    const programTemplate = fs.readFileSync(
      path.join(dir, "program-template.gt"),
      "utf8",
    )

    const inputVariables = [
      {
        name: "mailchimp_service_name",
        type: "string",
        description:
          "the name assigned to the Mailchimp service in the program's 'Service' settings",
        required: false,
        default: "Mailchimp",
        shouldBeCleanedUp: true,
      },
      {
        name: "email_address",
        type: "string",
        description: "the email address for which the tags will be updated",
        required: true,
        shouldBeCleanedUp: false,
      },
      {
        name: "mailchimp_list_id",
        type: "string",
        description:
          "the ID of the list to which the email address is subscribed",
        required: true,
        shouldBeCleanedUp: true,
      },
      {
        name: "tags",
        type: "collection",
        description: `the tags to be updated; can include strings or association values (where each assocation has (1) a "name" key pointing to a string value representing the name of the tag to be updated, and (2) a "status" key pointing to a string value of "active" or "inactive")`,
        required: true,
        shouldBeCleanedUp: true,
        customCheck:
          "---\n\n" +
          unindent(
            removeLeadingAndTrailingSpaces(`
						*if: not tags
							>> error_message = "You must define a variable called \`tags\` that has a collection value representing the tags to be updated! See the program documentation for more information about what can be included in the \`tags\` collection."
							*program: @jrc03c/show-error
							*return

						*if: not (tags.type = "collection")
							>> error_message = "You must define a variable called \`tags\` that has a collection value representing the tags to be updated! See the program documentation for more information about what can be included in the \`tags\` collection. (The value you provided was a(n) {tags.type}.)"
							*program: @jrc03c/show-error
							*return

						*for: tag in tags
							*if: (not tag.type = "string") and (not tag.type = "assocation")
								>> error_message = ""
								*program: @jrc03c/show-error
								*return

							*if: tag.type = "association"
								*if: not tag["name"]
									>> error_message = "Each assocation included in the \`tags\` collection must have a 'name' key pointing to a string value representing the name of the tag to be updated!"
									*program: @jrc03c/show-error
									*return

								*if: not (tag["name"].type = "string")
									>> error_message = "Each assocation included in the \`tags\` collection must have a 'name' key pointing to a string value representing the name of the tag to be updated! (The value you provided was a(n) {tag["name"].type}.)"
									*program: @jrc03c/show-error
									*return

								*if: not tag["status"]
									>> error_message = "Each assocation included in the \`tags\` collection must have a 'status' key pointing to a string value of either 'active' or 'inactive'!"
									*program: @jrc03c/show-error
									*return

								*if: not (tag["status"].type = "string")
									>> error_message = "Each assocation included in the \`tags\` collection must have a 'status' key pointing to a string value of either 'active' or 'inactive'! (The value you provided as a(n) {tag["status"].type}.)"
									*program: @jrc03c/show-error
									*return
					`),
          ),
      },
    ].toSorted((a, b) => (a.name < b.name ? -1 : 1))

    const outputVariables = [
      {
        name: "was_updated",
        type: "string",
        description: `a string value of "yes" or "no" indicating whether or not the user's tags were successfully updated`,
      },
      {
        name: "mailchimp_tags_update_error",
        type: "association",
        description: `an association with response data from Mailchimp; will be an empty association if the tag update request succeeds`,
      },
    ].toSorted((a, b) => (a.name < b.name ? -1 : 1))

    const inputVariableChecks = inputVariables
      .map(v => {
        if (v.customCheck) {
          return v.customCheck
        }

        const undefinedRequiredBlock = unindent(
          removeLeadingAndTrailingSpaces(`
					*if: not ${v.name}
						>> error_message = "You must define a variable called \`${v.name}\` that has ${typePhrase(v.type)} value representing ${v.description}!"
						*program: @jrc03c/show-error
						*return
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
						*return
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

    const nameColumnWidth = Math.max(
      ...inputVariables.concat(outputVariables).map(v => v.name.length),
    )

    const docsInputsTable = createDocsTable(
      new DataFrame({
        name: inputVariables.map(v => v.name + (v.required ? "*" : "")),
        description: inputVariables.map(v => v.description),
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
        description: outputVariables.map(v => v.description),
      }),
      {
        nameColumnLabel: "OUTPUT 👈",
        nameColumnWidth,
        descriptionColumnLabel: "DESCRIPTION ℹ️",
      },
    ).replace("-- ", "")

    const cleanup = inputVariables
      .filter(
        v => typeof v.shouldBeCleanedUp === "undefined" || v.shouldBeCleanedUp,
      )
      .map(v => `>> ${v.name} = ""`)
      .join("\n")

    const testQuestions = inputVariables
      .map(v => {
        return indent(
          unindent(
            removeLeadingAndTrailingSpaces(`
              *question: ${v.name}
                *tip: ${v.required ? "(required)" : ""} ${v.type} representing ${v.description}
                *save: ${v.name}
                *default: ${v.defaultForTests || v.default || '" "'}
            `),
          ),
          "\t",
        )
      })
      .join("\n\n")

    const programData = {
      docsInputsTable,
      docsOutputsTable,
      inputVariableChecks,
      cleanup,
      testQuestions,
    }

    const program = render(programTemplate, programData)
    fs.writeFileSync(path.join(dir, "program.gt"), program, "utf8")

    // tests
    const testsTemplate = fs.readFileSync(
      path.join(dir, "tests-template.gt"),
      "utf8",
    )

    const testsData = {}
    const tests = render(testsTemplate, testsData)
    fs.writeFileSync(path.join(dir, "tests.gt"), tests, "utf8")

    console.log("Done! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.indexOf("-w") > -1 || process.argv.indexOf("--watch") > -1) {
  const dir = import.meta.dirname

  watch({
    target: dir,
    include: ["program-template.gt", "tests-template.gt"],
    modified: rebuild,
  })
}

rebuild()
