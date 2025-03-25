import { createDocsTable } from "../../../_build_helpers/create-docs-table.mjs"
import { DataFrame } from "@jrc03c/js-math-tools"
import { makeKey } from "@jrc03c/make-key"
import { range } from "@jrc03c/js-math-tools"
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

  encodings[" "] = "%20"

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

  const nameColumnWidth = "OUTPUT 👈".length

  const docsInputsTable = createDocsTable(
    new DataFrame({
      name: ["input*"],
      description: ["the string to be encoded"],
    }),
    {
      nameColumnLabel: "INPUT 👉",
      nameColumnWidth,
      descriptionColumnLabel: "DESCRIPTION ℹ️",
    },
  )

  const docsOutputsTable = createDocsTable(
    new DataFrame({
      name: ["output"],
      description: ["the encoded string"],
    }),
    {
      nameColumnLabel: "OUTPUT 👈",
      nameColumnWidth,
      descriptionColumnLabel: "DESCRIPTION ℹ️",
    },
  )

  const programData = {
    dictAssignments,
    docsInputsTable,
    docsOutputsTable,
  }

  const program = render(programTemplate, programData)
  fs.writeFileSync(path.join(dir, "program.gt"), program, "utf8")

  const testsTemplate = fs.readFileSync(
    path.join(dir, "tests-template.gt"),
    "utf8",
  )

  const usedGlyphs = Object.keys(encodings).join("")

  const pairsAssignments = range(0, 100)
    .map(() => {
      const value = makeKey(
        Math.floor(Math.random() * 224) + 32,
        null,
        usedGlyphs,
      )

      return `>> pairs.add(["${value}", "${encodeURIComponent(value)}"])`
    })
    .join("\n")

  const testsData = {
    pairsAssignments,
  }

  const tests = render(testsTemplate, testsData)
  fs.writeFileSync(path.join(dir, "tests.gt"), tests, "utf8")
})()
