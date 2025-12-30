import { Data } from "@jrc03c/data-class"
import { toString } from "./to-string.mjs"

class Docs extends Data {
  author = "@jrc03c"
  editUrl = "https://guidedtrack.com"
  inputVariables = []
  notes = ""
  outputVariables = []
  testsEditUrl = "https://guidedtrack.com"
  title = "Untitled Program"

  get string() {
    return this.toString()
  }

  set string(v) {
    throw new Error(
      `The \`${this.constructor.name}.string\` property is read-only!`,
    )
  }

  toObject() {
    return {
      author: this.author,
      editUrl: this.editUrl,
      inputVariables: this.inputVariables.map(v => v.toObject()),
      notes: this.notes,
      outputVariables: this.outputVariables.map(v => v.toObject()),
      string: this.toString(),
      testsEditUrl: this.testsEditUrl,
      title: this.title,
    }
  }

  toString() {
    return toString(this)
  }
}

export { Docs }
