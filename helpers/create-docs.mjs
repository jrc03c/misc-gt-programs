import { createDocsTable } from "#helpers/create-docs-table.mjs"
import { DataFrame, flatten } from "@jrc03c/js-math-tools"

const COMMENT_PREFIX = "-- "
const DIVIDER = "-".repeat(80)

function createDocs(data) {
  const name = data.name || "@jrc03c/untitled"
  const editUrl = data.editUrl || "https://programs.guidedtrack.com"
  const testsEditUrl = data.testsEditUrl || "https://programs.guidedtrack.com"
  const author = data.author || "Josh Castle (joshrcastle@gmail.com)"

  const otherMetadata = data.otherMetadata || [
    { "all programs": "https://github.com/jrc03c/misc-gt-programs" },
  ]

  const inputVariables = data.inputVariables || []
  const outputVariables = data.outputVariables || []

  const notes = data.notes
    ? data.notes instanceof Array
      ? data.notes
      : typeof data.notes === "string"
        ? [data.notes]
        : [data.notes.toString()]
    : []

  const maxKeyLength = Math.max(
    ...flatten(
      ["editUrl", "tests", "author"].concat(
        otherMetadata.map(v => Object.keys(v)),
      ),
    ).map(v => v.length),
  )

  const inputDocs = new DataFrame({
    name: inputVariables.map(v => (v.isRequired ? v.name + "*" : v.name)),
    description: inputVariables.map(v => v.description),
  })

  const outputDocs = new DataFrame({
    name: outputVariables.map(v => v.name),
    description: outputVariables.map(v => v.description),
  })

  const inputNameColumnLabel = "INPUT 👉"
  const outputNameColumnLabel = "OUTPUT 👈"

  const nameColumnWidth = Math.max(
    ...flatten([inputDocs.get("name")])
      .concat(flatten([outputDocs.get("name")]))
      .concat([inputNameColumnLabel, outputNameColumnLabel])
      .map(v => v.length),
  )

  const inputDocsTableString = createDocsTable(inputDocs, {
    nameColumnLabel: inputNameColumnLabel,
    nameColumnWidth,
  })

  const outputDocsTableString = createDocsTable(outputDocs, {
    nameColumnLabel: outputNameColumnLabel,
    nameColumnWidth,
  })

  const out = [
    DIVIDER,
    name,
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
    ...(notes.length > 0 ? notes.concat([DIVIDER]) : []),
  ]
    .filter(v => !!v)
    .map(line => (line.startsWith("--") ? line : COMMENT_PREFIX + line))
    .join("\n")

  return out
}

export { createDocs }
