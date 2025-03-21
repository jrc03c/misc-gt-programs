function render(template, data) {
  let out = template.slice()

  Object.keys(data).forEach(key => {
    out = out.replaceAll(`{{ ${key} }}`, data[key])
  })

  const unrenderedVariables = out.match(
    /\{\{\s*[a-zA-Z_]+[a-zA-Z0-9_]*\s*\}\}/g,
  )

  if (unrenderedVariables && unrenderedVariables.length > 0) {
    throw new Error(
      `These variables were present in the \`template\` but not in the \`data\` object passed into the \`render\` function:\n\n${unrenderedVariables.map(v => "→ " + v).join("\n")}\n`,
    )
  }

  return out
}

export { render }
