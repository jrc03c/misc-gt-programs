import { BuildOptions } from "./build-options.mjs"
import { CustomLiquid } from "./custom-liquid.mjs"
import { getVariableNamesInGTProgram } from "../get-variable-names-in-gt-program.mjs"
import { removeExtraWhitespace } from "../remove-extra-whitespace.mjs"

class Builder {
  liquid = new CustomLiquid()

  constructor(data) {
    data = data || {}
    this.liquid = data.liquid || this.liquid
  }

  async build(template, options) {
    const shouldIncludeAllProperties = true
    template = template || ""
    options = BuildOptions.new(options, shouldIncludeAllProperties).toObject()

    let out = await this.liquid.parseAndRender(template, options)
    out = out.trim()

    if (options.shouldCleanUp) {
      const sortedVariables = Array.from(
        new Set(
          options.inputVariables
            .filter(v => v.shouldCleanUp)
            .map(v => v.name)
            .concat(
              getVariableNamesInGTProgram(out)
                .filter(v => !options.outputVariables.find(w => w.name === v))
                .filter(v => {
                  const inputVariable = options.inputVariables.find(
                    w => w.name === v,
                  )

                  return !inputVariable || inputVariable.shouldCleanUp
                }),
            )
            .toSorted((a, b) => (a < b ? -1 : 1)),
        ),
      )

      if (sortedVariables.length > 0) {
        out += "\n\n"
        out += "-".repeat(80)
        out += "\n\n"
        out += `*label: ${options.cleanUpLabel}`
        out += "\n"

        for (const v of sortedVariables) {
          out += "\n"
          out += `>> ${v} = ""`
        }
      }
    }

    return removeExtraWhitespace(out)
  }
}

export { Builder }
