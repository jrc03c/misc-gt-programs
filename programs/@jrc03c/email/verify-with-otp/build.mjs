import { GTBuilder } from "@jrc03c/gt-builder"
import { watch } from "@jrc03c/watch"
import path from "node:path"
import process from "node:process"

const DIST_DIR = path.join(import.meta.dirname, "dist")
const SRC_DIR = path.join(import.meta.dirname, "src")

function rebuild() {
  try {
    console.log("Rebuilding...")

    const builder = new GTBuilder({
      distDir: DIST_DIR,
      srcDir: SRC_DIR,
    })

    builder.build()

    console.log("Rebuilt! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.includes("--watch") || process.argv.includes("-w")) {
  watch({
    target: srcDir,
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
