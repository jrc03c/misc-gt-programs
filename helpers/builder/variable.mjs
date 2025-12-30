import { Data } from "@jrc03c/data-class"

class Variable extends Data {
  defaultValue = ""
  description = ""
  name = ""
  shouldCleanUp = true
  type = ""

  toObject() {
    const description = (() => {
      if (this.description) {
        return this.description
      } else {
        if (typeof this.defaultValue !== "undefined") {
          return [
            this.type,
            this.isRequired ? `required` : "",
            `default=${JSON.stringify(this.defaultValue)}`,
          ]
            .filter(v => !!v)
            .join("; ")
        } else {
          return this.type
        }
      }
    })()

    return {
      defaultValue: this.defaultValue,
      description,
      name: this.name,
      shouldCleanUp: this.shouldCleanUp,
      type: this.type,
    }
  }
}

class InputVariable extends Variable {
  isRequired = false

  toObject() {
    return {
      ...super.toObject(...arguments),
      isRequired: this.isRequired,
    }
  }
}

class OutputVariable extends Variable {}

export { InputVariable, OutputVariable, Variable }
