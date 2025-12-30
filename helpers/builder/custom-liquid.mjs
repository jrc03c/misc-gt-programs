import { Liquid } from "liquidjs"

class CustomLiquid extends Liquid {
  constructor(data) {
    data = data || {}
    data.strictVariables = data.strictVariables ?? true
    super(data)
    this.registerFilter("stringify", v => JSON.stringify(v))
  }
}

export { CustomLiquid }
