import { DataFrame, flatten } from "@jrc03c/js-math-tools"
import { tableToString } from "./table-to-string.mjs"
import { wrap } from "@jrc03c/js-text-tools"

const COMMENT_PREFIX = "-- "
const DIVIDER = "-".repeat(80)

function toString(docs) {
  const title = docs.title || "@jrc03c/untitled"
  const editUrl = docs.editUrl || "https://programs.guidedtrack.com"
  const testsEditUrl = docs.testsEditUrl || "https://programs.guidedtrack.com"
  const author = docs.author || "Josh Castle (joshrcastle@gmail.com)"

  const otherMetadata = docs.otherMetadata || [
    { "all programs": "https://github.com/jrc03c/misc-gt-programs" },
  ]

  const inputVariables = (docs.inputVariables || []).map(v => v.toObject())
  const outputVariables = (docs.outputVariables || []).map(v => v.toObject())

  const notes = docs.notes
    ? docs.notes instanceof Array
      ? docs.notes
      : typeof docs.notes === "string"
        ? [docs.notes]
        : [docs.notes.toString()]
    : []

  const maxKeyLength = Math.max(
    ...flatten(
      ["editUrl", "tests", "author"].concat(
        otherMetadata.map(v => Object.keys(v)),
      ),
    ).map(v => v.length),
  )

  const inputVariableNames = inputVariables.map(v =>
    v.isRequired ? v.name + "*" : v.name,
  )

  const outputVariableNames = outputVariables.map(v => v.name)

  const inputDocs = new DataFrame({
    name: inputVariableNames,
    description: inputVariables.map(v => v.description),
  })

  const outputDocs = new DataFrame({
    name: outputVariableNames,
    description: outputVariables.map(v => v.description),
  })

  const inputNameColumnLabel = "INPUT 👉"
  const outputNameColumnLabel = "OUTPUT 👈"

  const nameColumnWidth = Math.max(
    ...inputVariableNames
      .concat(outputVariableNames)
      .concat([inputNameColumnLabel, outputNameColumnLabel])
      .map(v => v.length),
  )

  const inputDocsTableString = tableToString(inputDocs, {
    nameColumnLabel: inputNameColumnLabel,
    nameColumnWidth,
  })

  const outputDocsTableString = tableToString(outputDocs, {
    nameColumnLabel: outputNameColumnLabel,
    nameColumnWidth,
  })

  const out = [
    DIVIDER,
    title,
    DIVIDER,
    "url".padEnd(maxKeyLength, " ") + " : " + editUrl,
    "tests".padEnd(maxKeyLength, " ") + " : " + testsEditUrl,
    "author".padEnd(maxKeyLength, " ") + " : " + author,
    ...flatten(
      otherMetadata.map(v =>
        Object.keys(v).map(
          key => key.padEnd(maxKeyLength, " ") + " : " + v[key],
        ),
      ),
    ),
    DIVIDER,
    inputDocsTableString,
    "-- * indicates a required input",
    DIVIDER,
    outputDocsTableString,
    DIVIDER,
    ...(notes.length > 0
      ? notes.map(v => wrap(v, 80, "-- ")).concat([DIVIDER])
      : []),
  ]
    .filter(v => !!v)
    .map(line => (line.startsWith("--") ? line : COMMENT_PREFIX + line))
    .join("\n")

  return out
}

export { toString }
