import { set, sort } from "@jrc03c/js-math-tools"
import fs from "node:fs"
import process from "node:process"

function getVariableNames(x) {
  const dotNotationPattern = /\.[a-z].*?\b/g
  const indexerPattern = /\[.*?\]/g
  const keywordPattern = /\*[a-z_-]+:?/g
  const numberPattern = /\b-?\d+(\.\d+)?\b/g
  const operatorPattern = /[=><]|\+|-|\*|\\|\band\b|\bor\b|\bnot\b|\bin\b/g
  const quotePattern = /".*?"/g

  return x
    .replaceAll(dotNotationPattern, " ")
    .replaceAll(indexerPattern, " ")
    .replaceAll(keywordPattern, "")
    .replaceAll(numberPattern, " ")
    .replaceAll(operatorPattern, " ")
    .replaceAll(quotePattern, " ")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .split(" ")
    .map(v => v.trim())
    .filter(v => v.length > 0)
}

function getVariableNamesInGTProgram(raw) {
  return sort(
    set(
      raw
        .split("\n")
        .map(line => line.trim())
        .filter(
          line =>
            line.length > 0 &&
            (line.includes("*for:") ||
              line.includes("*if:") ||
              line.includes("*save:") ||
              line.includes("*while:") ||
              line.match(/>>.*?=/g)),
        )
        .map(line => {
          if (line.includes("*save:")) {
            return line.split("*save:")[1].trim()
          }

          if (
            line.includes("*if:") ||
            line.includes("*while:") ||
            line.includes("*for:")
          ) {
            return getVariableNames(line)
          }

          if (line.match(/>>.*?=/g)) {
            return line.split("=")[0].split(">>")[1].trim().split("[")[0]
          }
        })
        .filter(v => !!v),
    ),
  )
}

export { getVariableNamesInGTProgram }

if (import.meta.url.includes(process.argv[1])) {
  if (process.argv.length < 3) {
    console.log("SYNTAX: node get-variable-names-in-gt-program.mjs [file]")
    process.exit()
  }

  const file = process.argv.at(-1)
  const raw = fs.readFileSync(file, "utf8")
  console.log(getVariableNamesInGTProgram(raw))
}
