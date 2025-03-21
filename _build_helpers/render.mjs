function render(template, data) {
  let out = template.slice()

  Object.keys(data).forEach(key => {
    const pattern = new RegExp(`\\{\\{\\s*?${key}\\s*?\\}\\}`)
    out = out.replaceAll(pattern, data[key])
  })

  return out
}

export { render }
