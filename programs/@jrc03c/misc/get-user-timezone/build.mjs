import { GTBuilder } from "@jrc03c/gt-builder"
import { watch } from "@jrc03c/watch"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const srcDir = path.join(import.meta.dirname, "src")
const distDir = path.join(import.meta.dirname, "dist")
const outfile = path.join(distDir, "program.gt")
const builder = new GTBuilder({ distDir, srcDir })

const rebuild = () => {
  try {
    console.log("---")
    console.log(`Rebuilding... (${new Date().toLocaleTimeString()})`)
    builder.build()
    fs.renameSync(path.join(distDir, "src.gt"), outfile)
    const raw = fs.readFileSync(outfile, "utf8")
    const lines = raw.split("\n")
    const startIndex = lines.findIndex(v => v.includes("Sample response:")) + 2

    const endIndex =
      startIndex + lines.slice(startIndex).findIndex(v => v.includes("-- │ }"))

    const temp = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (i >= startIndex && i <= endIndex) {
        if (line.match(/│.*?\S+.*?│/)) {
          temp.push(line)
        }
      } else {
        temp.push(line)
      }
    }

    fs.writeFileSync(outfile, temp.join("\n"), "utf8")
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
