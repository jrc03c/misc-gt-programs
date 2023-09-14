const fs = require("fs")
const gt = require("@jrc03c/gt-helpers")
const process = require("process")
const watch = require("@jrc03c/watch")

async function rebuild() {
  console.log("-----")
  console.log(`Rebuilding... (${new Date().toLocaleString()})`)

  try {
    const dates = JSON.parse(fs.readFileSync("dates.json", "utf8"))

    const testsData = {
      dates: `[${dates.strings.map((s, i) => {
        return gt.object.toAssociation({
          string: s,
          object: dates.objects[i],
        })
      })}]`,
    }

    const testsTemplate = fs.readFileSync("tests-template.gt", "utf8")
    const testsFinal = await gt.template.liquidBuild(testsTemplate, testsData)
    fs.writeFileSync("tests.gt", testsFinal, "utf8")

    console.log("Done! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.indexOf("-w") > -1 || process.argv.indexOf("--watch") > -1) {
  watch({
    target: ".",
    include: ["dates.json", "tests-template.gt"],
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
