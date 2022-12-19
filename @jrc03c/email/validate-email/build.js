const fetch = require("node-fetch")
const fs = require("fs")
const gt = require("gt-helpers")

async function build() {
  const response = await fetch(
    "http://data.iana.org/TLD/tlds-alpha-by-domain.txt"
  )

  const raw = await response.text()

  const extensions =
    "[" +
    raw
      .split("\n")
      .filter(line => !line.startsWith("#") && line.trim().length > 0)
      .map(line => '"' + line.trim().toLowerCase() + '"')
      .join(", ") +
    "]"

  const data = {
    extensions,
  }

  const template = fs.readFileSync("src/program-template.gt", "utf8")
  const out = await gt.template.liquidBuild(template, data)
  fs.writeFileSync("dist/program.gt", out, "utf8")

  const testsTemplate = fs.readFileSync("src/tests-template.gt", "utf8")
  const testsOut = await gt.template.liquidBuild(testsTemplate, data)
  fs.writeFileSync("dist/tests.gt", testsOut, "utf8")
}

build()
