const { set, sort } = require("@jrc03c/js-math-tools")
const { snakeify } = require("@jrc03c/js-text-tools")
const fs = require("node:fs")
const gt = require("@jrc03c/gt-helpers")
const path = require("node:path")
const process = require("node:process")
const watch = require("@jrc03c/watch")

async function rebuild() {
  console.log("-----")
  console.log(`Rebuilding... (${new Date().toLocaleString()})`)

  try {
    const template = fs.readFileSync(
      path.join(__dirname, "template.gt"),
      "utf8",
    )

    const strong = JSON.parse(
      fs.readFileSync(path.join(__dirname, "strong.json"), "utf8"),
    )

    const categories = set(
      sort(Object.keys(strong).map(key => snakeify(key.split(":")[0]))),
    ).map(cat => ({ name: cat, itemCount: 0 }))

    const questions = sort(
      set(
        Object.keys(strong).map(key => {
          const category = snakeify(key.split(":")[0])

          return strong[key].items.map(text => {
            categories.find(c => c.name === category).itemCount++

            return {
              text,
              category,
            }
          })
        }),
      ),
      (a, b) => (a.text < b.text ? -1 : 1),
    )

    const categories_scores_dict = `{ ${categories.map(c => `"strong_${c.name}_score" -> strong_${c.name}_score`).join(", ")} }`

    const data = { categories, questions, categories_scores_dict }
    let rendered = await gt.template.liquidBuild(template, data)

    rendered = rendered
      .split("\n")
      .filter(
        (line, i, arr) =>
          i === 0 || !arr[i - 1].trim().match(/^>>\s*strong.*?=\s*0/g),
      )
      .join("\n")

    while (rendered.match(/\n\n\n/g)) {
      rendered = rendered.replaceAll(/\n\n\n/g, "\n\n")
    }

    fs.writeFileSync(path.join(__dirname, "program.gt"), rendered, "utf8")
    console.log("Done! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.indexOf("-w") > -1 || process.argv.indexOf("--watch") > -1) {
  watch({
    target: __dirname,
    exclude: ["program.gt"],
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
