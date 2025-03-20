import { wrap } from "@jrc03c/js-text-tools"

const MAX_LENGTH = 77

const HORIZ = "─"
const VERT = "│"

const TOP_LEFT = "┌"
const TOP_CENTER = "┬"
const TOP_RIGHT = "┐"
const MIDDLE_LEFT = "├"
const MIDDLE_CENTER = "┼"
const MIDDLE_RIGHT = "┤"
const BOTTOM_LEFT = "└"
const BOTTOM_CENTER = "┴"
const BOTTOM_RIGHT = "┘"

const padding = 1

const border = {
  horiz: HORIZ,
  vert: VERT,
  top: {
    left: TOP_LEFT,
    center: TOP_CENTER,
    right: TOP_RIGHT,
  },
  middle: {
    left: MIDDLE_LEFT,
    center: MIDDLE_CENTER,
    right: MIDDLE_RIGHT,
  },
  bottom: {
    left: BOTTOM_LEFT,
    center: BOTTOM_CENTER,
    right: BOTTOM_RIGHT,
  },
}

function createDocsTable(df, nameColumnLabel, nameColumnWidth) {
  nameColumnLabel = nameColumnLabel || "NAME"

  const maxNameLength =
    nameColumnWidth ||
    Math.max(
      ...df.get("name").values.map(v => v.toString().length),
      "name".length,
    )

  const maxDescLength = MAX_LENGTH - maxNameLength - 7
  const out = []

  // top border
  out.push(
    [
      border.top.left,
      border.horiz.repeat(maxNameLength + padding * 2),
      border.top.center,
    ]
      .join("")
      .padEnd(MAX_LENGTH - 1, border.horiz) + border.top.right,
  )

  // column names
  out.push(
    [
      border.vert,
      (" " + nameColumnLabel + " ").padEnd(maxNameLength + 2, " "),
      border.vert,
      " DESCRIPTION ".padEnd(maxDescLength + 2, " "),
    ].join("") + border.vert,
  )

  // rows
  for (let i = 0; i < df.shape[0]; i++) {
    const row = df.get(i, null)
    const name = row.get("name")
    const descLines = wrap(row.get("description"), maxDescLength).split("\n")

    // row divider (border)
    out.push(
      [
        border.middle.left,
        border.horiz.repeat(maxNameLength + padding * 2),
        border.middle.center,
      ]
        .join("")
        .padEnd(MAX_LENGTH - 1, border.horiz) + border.middle.right,
    )

    // values
    descLines.forEach((line, j) => {
      if (j === 0) {
        out.push(
          [
            border.vert,
            " ",
            name.padEnd(maxNameLength, " "),
            " ",
            border.vert,
            " ",
            line,
            " ",
          ]
            .join("")
            .padEnd(MAX_LENGTH - 1, " ") + border.vert,
        )
      } else {
        out.push(
          [
            border.vert,
            " ".repeat(maxNameLength + 2),
            border.vert,
            " ",
            line,
            " ",
          ]
            .join("")
            .padEnd(MAX_LENGTH - 1, " ") + border.vert,
        )
      }
    })
  }

  // bottom border
  out.push(
    [
      border.bottom.left,
      border.horiz.repeat(maxNameLength + padding * 2),
      border.bottom.center,
    ]
      .join("")
      .padEnd(MAX_LENGTH - 1, border.horiz) + border.bottom.right,
  )

  return out.map(v => "-- " + v).join("\n")
}

export { createDocsTable }
