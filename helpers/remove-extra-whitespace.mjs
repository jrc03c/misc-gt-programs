function removeExtraWhitespace(x) {
  return x
    .split("\n")
    .filter((line, i, lines) => {
      if (line.trim().length === 0 && i < lines.length - 1) {
        const nextLine = lines[i + 1]
        return nextLine.trim().length > 0
      }

      return true
    })
    .map(line => (line.trim().length === 0 ? line.trim() : line))
    .join("\n")
}

export { removeExtraWhitespace }
