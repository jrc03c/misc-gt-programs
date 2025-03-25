import { render } from "../../../_build_helpers/render.mjs"
import fs from "node:fs"
import path from "node:path"

!(async () => {
  const dir = import.meta.dirname

  const glyphs = JSON.parse(
    fs.readFileSync(path.join(dir, "glyphs.json"), "utf8"),
  )

  const encodings = {}
  const excluded = [`"`]

  glyphs.forEach(glyph => {
    const encoded = encodeURIComponent(glyph)

    if (glyph !== encoded && !excluded.includes(glyph)) {
      encodings[glyph] = encoded
    }
  })

  const programTemplate = fs.readFileSync(
    path.join(dir, "program-template.gt"),
    "utf8",
  )

  const dictAssignments = Object.keys(encodings)
    .map(char => {
      return `>> dict["${char}"] = "${encodings[char]}"`
    })
    .concat([`>> dict["%22".decode("URL")] = "%22"`])
    .join("\n")

  const programData = {
    dictAssignments,
    docsInputsTable: "",
    docsOutputsTable: "",
  }

  const program = render(programTemplate, programData)
  fs.writeFileSync(path.join(dir, "program.gt"), program, "utf8")
})()
