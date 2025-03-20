function typePhrase(t) {
  return "aeiou".split("").some(v => t.startsWith(v)) ? "an " + t : "a " + t
}

export { typePhrase }
