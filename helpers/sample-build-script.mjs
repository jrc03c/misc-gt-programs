// This is a sample build script. You should create a copy of it in the
// directory of the GT program you're planning to build and then modify it to
// suit the program's context.

import { createDocs } from "#helpers/create-docs.mjs"
import { fg } from "@jrc03c/bash-colors"
import { Liquid } from "liquidjs"
import { removeExtraWhitespace } from "#helpers/remove-extra-whitespace.mjs"
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
      { name: "x", isRequired: true, description: "a collection of numbers" },
    ]

    const outputVariables = [
      { name: "y", description: "a modified version of `x`" },
    ]

    const docsString = createDocs({
      inputVariables,
      outputVariables,
    })

    const data = {
      docsString,
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
        const out = removeExtraWhitespace(
          engine.parseAndRenderSync(template, data),
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
