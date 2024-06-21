const { dot, isArray, shape } = require("@jrc03c/js-math-tools")
const { containsOnlyNumbers } = require("@jrc03c/js-data-science-helpers")

module.exports = (request, response) => {
  if (request.method !== "POST") {
    return response
      .status(405)
      .send({ error: "This endpoint only accepts POST requests!" })
  }

  const { a, b } = request.body

  if (!a || !isArray(a) || shape(a).length === 0 || shape(a).length > 2) {
    return response.status(400).send({
      error:
        "The request body must have a property called 'a' whose value is a vector or matrix!",
    })
  }

  if (!b || !isArray(b) || shape(b).length === 0 || shape(b).length > 2) {
    return response.status(400).send({
      error:
        "The request body must have a property called 'b' whose value is a vector or matrix!",
    })
  }

  if (!containsOnlyNumbers(a)) {
    return response.status(400).send({
      error:
        "The 'a' vector or matrix you provided contains values that are not numbers!",
    })
  }

  if (!containsOnlyNumbers(b)) {
    return response.status(400).send({
      error:
        "The 'b' vector or matrix you provided contains values that are not numbers!",
    })
  }

  try {
    return response.send({ c: dot(a, b) })
  } catch (e) {
    return response.status(500).send({ error: e.toString() })
  }
}
