import { Builder } from "#helpers/builder/index.mjs"
import { BuildOptions } from "#helpers/builder/build-options.mjs"
import { Docs } from "#helpers/builder/docs/index.mjs"
import { fg } from "@jrc03c/bash-colors"
import { InputVariable, OutputVariable } from "#helpers/builder/variable.mjs"
import { YamlData } from "@jrc03c/data-file-helpers"
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

    // define the data to use at render time
    const data = YamlData.fromFile(path.join(dir, "program.yml"))
    const inputVariables = data.inputVariables.map(v => InputVariable.new(v))
    const outputVariables = data.outputVariables.map(v => OutputVariable.new(v))
    const otherVariablesToCleanUp = ["output"]

    const docs = Docs.new({
      ...data.toObject(),
      inputVariables,
      outputVariables,
    })

    // get all gt template files
    const builder = new Builder()

    const options = BuildOptions.new(
      {
        ...data.toObject(),
        docs,
        inputVariables,
        otherVariablesToCleanUp,
        outputVariables,
      },
      true,
    )

    const templateFile = path.join(import.meta.dirname, data.template)
    const template = fs.readFileSync(templateFile, "utf8")
    const out = await builder.build(template, options)
    const outFile = templateFile.replace("-template", "")
    fs.writeFileSync(outFile, out, "utf8")

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
