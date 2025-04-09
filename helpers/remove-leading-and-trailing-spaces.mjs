function removeLeadingAndTrailingSpaces(x) {
  return x
    .split("\n")
    .filter(
      (line, i, lines) =>
        (i > 0 && i < lines.length - 1) || line.trim().length > 0,
    )
    .join("\n")
}

export { removeLeadingAndTrailingSpaces }
