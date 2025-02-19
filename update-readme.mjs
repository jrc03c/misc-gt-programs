import fs from "node:fs"
import * as fsx from "@jrc03c/fs-extras"
import path from "node:path"

const cwd = path.resolve(import.meta.dirname)
const dir = path.join(cwd, "@jrc03c")
const programs = fsx.findSync(dir, f => f.endsWith("/program.gt"))

const out = programs
  .map(file => {
    const raw = fs.readFileSync(file, "utf8")
    const lines = raw.split("\n")

    const title = file
      .split(cwd + "/")
      .at(-1)
      .split("/program.gt")[0]
      .trim()

    const url = (lines.find(line => line.match(/url\s*?:/g)) || "")
      .split(/url\s*?:/g)
      .at(-1)
      .trim()

    if (title && url) {
      return `- [${title}](${url})`
    }
  })
  .filter(v => !!v)
  .toSorted((a, b) => (a < b ? -1 : 1))

const template = fs.readFileSync(path.join(cwd, "readme-template.md"), "utf8")

fs.writeFileSync(
  path.join(cwd, "readme.md"),
  template.replace(/\{\{\s*?programs\s*?\}\}/g, out.join("\n")),
  "utf8",
)
