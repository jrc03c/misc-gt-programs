const {
  dot,
  flatten,
  isArray,
  isNumber,
  shape,
} = require("@jrc03c/js-math-tools")

module.exports = (request, response) => {
  console.log("Checking if method is POST...")
  
  if (request.method !== "POST") {
    return response.status(405).send({
      error: `This endpoint only accepts POST requests (but you send a ${request.method} request)!`,
    })
  }

  console.log("Parsing body...")
  
  let body

  try {
    if (typeof request.body === "string"){
  	  body = JSON.parse(request.body)
    } else {
      body = request.body
    }
  } catch (e) {
    return response.status(500).send({ error: e.toString() })
  }

  console.log("Checking 'a' and 'b'...")

  const { a, b } = body

  if (!a || !isArray(a) || shape(a).length === 0 || shape(a).length > 2) {
    const type =
      typeof a === "object" ? (a === null ? "null" : a.prototype) : typeof a

    return response.status(400).send({
      error: `The request body must have a property called 'a' whose value is a vector or matrix! The 'a' property on your request's body has a value of \`${JSON.stringify(a)}\` and is of type \`${type}\`.`,
    })
  }

  if (!b || !isArray(b) || shape(b).length === 0 || shape(b).length > 2) {
    const type =
      typeof b === "object" ? (b === null ? "null" : b.prototype) : typeof b

    return response.status(400).send({
      error: `The request body must have a property called 'b' whose value is a vector or matrix! The 'b' property on your request's body has a value of \`${JSON.stringify(b)}\` and is of type \`${type}\`.`,
    })
  }

  const aflat = flatten(a)
  const bflat = flatten(b)

  const aflatNaNs = aflat.filter(v => !isNumber(v))
  const bflatNaNs = bflat.filter(v => !isNumber(v))

  if (aflatNaNs.length > 0) {
    return response.status(400).send({
      error: `The 'a' vector or matrix you provided contains values that are not numbers! The non-numerical values included in 'a' are these: ${JSON.stringify(aflatNaNs)}`,
    })
  }

  if (bflatNaNs.length > 0) {
    return response.status(400).send({
      error: `The 'b' vector or matrix you provided contains values that are not numbers! The non-numerical values included in 'b' are these: ${JSON.stringify(bflatNaNs)}`,
    })
  }

  console.log("Computing dot product...")

  try {
    return response.send(JSON.stringify(dot(a, b)))
  } catch (e) {
    return response.status(500).send({ error: e.toString() })
  }
}
