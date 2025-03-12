import fs from "node:fs"
import gt from "@jrc03c/gt-helpers"
import path from "node:path"

async function build() {
  const response = await fetch(
    "http://data.iana.org/TLD/tlds-alpha-by-domain.txt",
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

  const dir = import.meta.filename.split(path.sep).slice(0, -1).join(path.sep)

  const template = fs.readFileSync(
    path.join(dir, "src/program-template.gt"),
    "utf8",
  )

  const out = await gt.template.liquidBuild(template, data)
  fs.writeFileSync(path.join(dir, "dist/program.gt"), out, "utf8")

  const testsTemplate = fs.readFileSync(
    path.join(dir, "src/tests-template.gt"),
    "utf8",
  )

  const testsOut = await gt.template.liquidBuild(testsTemplate, data)
  fs.writeFileSync(path.join(dir, "dist/tests.gt"), testsOut, "utf8")
}

build()
