import { createDocs } from "#helpers/create-docs.mjs"
import { fg } from "@jrc03c/bash-colors"
import { getVariableNamesInGTProgram } from "#helpers/get-variable-names-in-gt-program.mjs"
import { Liquid } from "liquidjs"
import { removeExtraWhitespace } from "#helpers/remove-extra-whitespace.mjs"
import { typePhrase } from "#helpers/type-phrase.mjs"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const GT_PROGRAM_TEMPLATE_FILENAME_PATTERN = /-template\.gt/

async function rebuild() {
  try {
    console.log("---")
    console.log("Rebuilding...")

    // define the source directory
    const dir = import.meta.dirname

    // create a liquidjs renderer
    const engine = new Liquid()

    // define any liquid filters
    engine.registerFilter("stringify", v => JSON.stringify(v))

    // define the data to use at render time
    const inputVariables = [
      { name: "a", isRequired: true, description: "a string", type: "text" },
      { name: "b", isRequired: true, description: "a string", type: "text" },
    ]

    const outputVariables = [
      {
        name: "levenshtein_distance",
        description:
          "an integer representing the Levenshtein distance between `a` and `b`",
      },
    ]

    const docsString = createDocs({
      name: "@jrc03c/string/levenshtein-distance",
      editUrl: "https://www.guidedtrack.com/programs/34164/edit",
      testsEditUrl: "https://www.guidedtrack.com/programs/34165/edit",
      author: "",
      inputVariables,
      outputVariables,
      notes: `Levenshtein distance (LD) is a measure of the "edit distance" between two strings. In other words, it represents the minimum number of edits (insertions, deletions, and substitutions) required to convert one string into another. Therefore, the LD can be thought of as a measure of the similarity of two strings, where lower LDs mean fewer edits and therefore greater similarity, and higher LDs mean more edits and therefore less similarity. Learn more about the Levenshtein distance here: https://en.wikipedia.org/wiki/Levenshtein_distance`,
    })

    const cleanUpLabel = "CleanUpLabel09942ae978a753812a947c8504cba7c5"

    const variableChecks = inputVariables
      .map(v => {
        return [
          `*if: not ${v.name}`,
          `\t>> error_message = "You must define a variable called \`${v.name}\` that has ${typePhrase(v.type)} value!"`,
          `\t*program: @jrc03c/show-error`,
          `\t*goto: ${cleanUpLabel}`,
          "",
          `*if: not (${v.name}.type = "${v.type}")`,
          `\t>> error_message = "You must define a variable called \`${v.name}\` that has ${typePhrase(v.type)} value!"`,
          `\t*program: @jrc03c/show-error`,
          `\t*goto: ${cleanUpLabel}`,
        ].join("\n")
      })
      .join("\n\n")

    const cleanUp = [
      `*label: ${cleanUpLabel}`,
      "<< cleanUpAssignments >>",
    ].join("\n")

    const data = {
      docsString,
      variableChecks,
      cleanUp,
    }

    // get all gt template files
    const templateFiles = fs
      .readdirSync(dir)
      .filter(f => f.match(GT_PROGRAM_TEMPLATE_FILENAME_PATTERN))
      .map(f => path.join(dir, f))

    // for each gt template file...
    if (templateFiles.length > 0) {
      for (const templateFile of templateFiles) {
        // read in the template source code
        const template = fs.readFileSync(templateFile, "utf8")

        // render the template with the liquid engine using the data defined
        // above
        let out = removeExtraWhitespace(
          engine.parseAndRenderSync(template, data),
        )

        const vars = getVariableNamesInGTProgram(out).filter(
          v => !outputVariables.some(u => u.name === v),
        )

        const cleanUpAssignments = []

        for (let i = 0; i < vars.length; i++) {
          cleanUpAssignments.push(`>> ${vars[i]} = ""`)
        }

        out = out.replace(
          "<< cleanUpAssignments >>",
          cleanUpAssignments.join("\n"),
        )

        // write the rendered program out to disk
        const outFile = templateFile.replace("-template", "")
        fs.writeFileSync(outFile, out, "utf8")
      }
    } else {
      console.log(docsString)
      console.log("No template files found!")
    }

    console.log("Rebuilt! 🎉")
  } catch (e) {
    console.error(fg.red(e))
  }
}

if (process.argv.includes("--watch") || process.argv.includes("-w")) {
  // by default, watch only the gt template files
  watch({
    target: import.meta.dirname,
    include: [GT_PROGRAM_TEMPLATE_FILENAME_PATTERN],
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
