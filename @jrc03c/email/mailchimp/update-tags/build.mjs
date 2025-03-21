import { render } from "../../../../_build_helpers/render.mjs"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

function rebuild() {
  console.log("-----")
  console.log(`Rebuilding... (${new Date().toLocaleString()})`)

  try {
    const dir = import.meta.dirname

    // main program
    const programTemplate = fs.readFileSync(
      path.join(dir, "program-template.gt"),
      "utf8",
    )

    const programData = {}
    const program = render(programTemplate, programData)
    fs.writeFileSync(path.join(dir, "program.gt"), program, "utf8")

    // tests
    const testsTemplate = fs.readFileSync(
      path.join(dir, "tests-template.gt"),
      "utf8",
    )

    const testsData = {}
    const tests = render(testsTemplate, testsData)
    fs.writeFileSync(path.join(dir, "tests.gt"), tests, "utf8")

    console.log("Done! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.indexOf("-w") > -1 || process.argv.indexOf("--watch") > -1) {
  const dir = import.meta.dirname

  watch({
    target: dir,
    include: ["program-template.gt", "tests-template.gt"],
    modified: rebuild,
  })
}

rebuild()
