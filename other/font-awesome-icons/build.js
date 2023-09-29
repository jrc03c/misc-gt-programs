const { execSync } = require("child_process")
const fs = require("fs")
const gt = require("@jrc03c/gt-helpers")
const watch = require("@jrc03c/watch")

async function build() {
  const bootstrapCss = fs.readFileSync("gt-bootstrap.css", "utf8")
  const guidedtrackCss = fs.readFileSync("gt-guidedtrack.css", "utf8")

  const icons = fs
    .readFileSync("fa-v5-free.txt", "utf8")
    .split("\n")
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => "fa-" + v)
    .filter(v => bootstrapCss.match(v) || guidedtrackCss.match(v))

  const data = { icons }
  const template = fs.readFileSync("template.gt", "utf8")
  const built = await gt.template.liquidBuild(template, data)
  fs.writeFileSync("program.gt", built, "utf8")
  execSync(`cat program.gt | xsel -b`, { encoding: "utf8" })
}

if (process.argv.indexOf("--watch") > -1 || process.argv.indexOf("-w") > -1) {
  watch({
    target: ".",
    exclude: ["build.js", "node_modules"],
    created: build,
    modified: build,
    deleted: build,
  })
}

build()
