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
      { name: "a", isRequired: true, description: "a string", type: "string" },
      { name: "b", isRequired: true, description: "a string", type: "string" },
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
      notes: `Levenshtein distance (LD) is a measure of the "edit distance" between two strings. In other words, it represents the minimum number of edits (insertions, deletions, and substitutions) required to convert one string into another. Therefore, the LD can be thought of as a measure of the similarity of two strings, where lower LDs mean fewer edits and therefore greater similarity, and higher LDs mean more edits and therefore less similarity. Learn more about the Levenshtein distance here: https://en.wikipedia.org/wiki/Levenshtein_distance NOTE: This program is not fast, so please only use it for relatively short strings (e.g., a few dozen characters or shorter)!`,
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

    const testTrios = [
      ["a", "a", 0],
      ["a", "b", 1],
      ["ab", "ab", 0],
      ["ab", "ac", 1],
      ["ab", "db", 1],
      ["ab", "cd", 2],
      ["37e9351f75a2152a", "", 16],
      [
        "355d8fea29123697b896eb2a844396de",
        "70f8daa0c909036db3181a8211c6708d",
        27,
      ],
      [
        "70c5e7b4aa2f95c18253b15fe3fcdd8b4af40692aa143a9ddca9a5c1fb1f331aebb09f243b5e716b0ded2bbcad8063c4517c7e1a404a8869c617de6ebb336f6bec38910f27f62a2571213b5a01fd5a4c1436aceed00b9dd708f4951abb2d075483c11c5a648992a5155957883a8ed6582ca8d053c77191eb53d0d3f461d41eb2",
        "d35caeae6b80b9d8f72f58fb92c50ce40fd9bbae97f762cff5148098e139f9431fbe3cfa1e1ba024e0ce0dffede0c2be9d5d850ce4e69c6431ab2694556eeff29a57609c34cf4d1eca3edc5e84a94493979db084faae174b5e478bb3496b5e67f145bd5c02237204b9a4f59a3aed7ccd9666e6e6d0c8f21508127c7e1fcafe72",
        207,
      ],
    ]

    const data = {
      docsString,
      variableChecks,
      cleanUp,
      cleanUpLabel,
      testTrios,
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
