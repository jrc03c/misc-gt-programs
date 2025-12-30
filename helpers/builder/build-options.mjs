import { Data } from "@jrc03c/data-class"
import { Docs } from "./docs/index.mjs"
import { makeKey } from "@jrc03c/make-key"

class BuildOptions extends Data {
  cleanUpLabel = `CleanUpLabel${makeKey(32).toUpperCase()}`
  docs = Docs.new()
  inputVariables = []
  outputVariables = []
  shouldCleanUp = true

  toObject() {
    const out = {
      cleanUpLabel: this.cleanUpLabel,
      docs: this.docs.toObject(),
      inputVariables: this.inputVariables.map(v => v.toObject()),
      outputVariables: this.outputVariables.map(v => v.toObject()),
      shouldCleanUp: this.shouldCleanUp,
    }

    Object.keys(this).forEach(key => {
      if (typeof out[key] === "undefined") {
        out[key] = this[key]
      }
    })

    return out
  }
}

export { BuildOptions }
