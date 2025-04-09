// This is a sample build script. You should create a copy of it in the
// directory of the GT program you're planning to build and then modify it to
// suit the program's context.

import { createDocs } from "#helpers/create-docs.mjs"
import { fg } from "@jrc03c/bash-colors"
import { Liquid } from "liquidjs"
import { makeKey } from "@jrc03c/make-key"
import { removeExtraWhitespace } from "#helpers/remove-extra-whitespace.mjs"
import { removeLeadingAndTrailingSpaces } from "#helpers/remove-leading-and-trailing-spaces.mjs"
import { unindent, wrap } from "@jrc03c/js-text-tools"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const GT_PROGRAM_TEMPLATE_FILENAME_PATTERN = /-template\.gt/

const PROGRAM_NAME = "@jrc03c/misc/slice"
const PROGRAM_EDIT_URL = "https://www.guidedtrack.com/programs/32625/edit"
const PROGRAM_TESTS_EDIT_URL = "https://www.guidedtrack.com/programs/32626/edit"

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
      {
        name: "x",
        isRequired: true,
        description:
          "a string or collection from which the slice will be taken",
      },
      {
        name: "start",
        isRequired: false,
        description:
          "a positive integer representing the index in `x` from which the slice will start; must be in the range [1, `x.size`]; if not defined, it will be assigned a value of 1",
      },
      {
        name: "end",
        isRequired: false,
        description:
          "a positive integer representing the index in `x` at which the slice will end; must be in the range [`1`, `x.size`]; if not defined, it will be assigned a value of `x.size`",
      },
    ]

    const outputVariables = [
      {
        name: "x_slice",
        description:
          "the slice of `x`; will be a string if `x` was a string, or will be a collection if `x` was a collection",
      },
    ]

    const notes = wrap(
      unindent(
        removeLeadingAndTrailingSpaces(`
          -- NOTE: Because collection (array) indices in GuidedTrack start at 1, the slices created by this program include the value at index \`end\`! This differs from the convention used by many common programming languages wherein slices represent the values of \`x\` starting from \`start\` and going up to *but not including* the value at \`end\`; i.e., the range [start, end), exclusive on the right side.
          --
          -- For example, after running this program:
          --
          -- >> x = [1, 3, 5, 7, 9]
          -- >> start = 2
          -- >> end = 4
          -- *program: @jrc03c/slice
          --
          -- ...the value of \`x_slice\` would be [3, 5, 7].
        `),
      ),
      80,
      "-- ",
    )

    const docsString = createDocs({
      name: PROGRAM_NAME,
      editUrl: PROGRAM_EDIT_URL,
      testsEditUrl: PROGRAM_TESTS_EDIT_URL,
      inputVariables,
      outputVariables,
      notes,
    })
      .split("\n")
      .map(v => (v.trim().length === 0 ? "--" : v))
      .join("\n")

    const data = {
      cleanupLabelName: "CleanUpLabel" + makeKey(8).toUpperCase(),
      docsString,
      nonexistentTriggerName: "nonexistent-trigger-" + makeKey(8),
      programName: PROGRAM_NAME,
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

        // render the template with the liquid engine using the data defined above
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
