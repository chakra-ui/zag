#!/usr/bin/env node
import { existsSync } from "node:fs"
import { formatNotes, run, transforms, type TransformName } from "./index"

const HELP = `Usage: zag-codemod <transform> [paths...] [options]

Transforms:
  v2        Upgrade zag.js v1 code, styles and tests to v2

Options:
  --dry     Report what would change without writing files
  --help    Show this message

Examples:
  npx @zag-js/codemod v2 src
  npx @zag-js/codemod v2 src styles --dry
`

function main(argv: string[]): number {
  const args = argv.filter((a) => !a.startsWith("--"))
  const flags = new Set(argv.filter((a) => a.startsWith("--")))

  if (flags.has("--help") || args.length === 0) {
    console.log(HELP)
    return args.length === 0 && !flags.has("--help") ? 1 : 0
  }

  const [name, ...rest] = args
  if (!(name in transforms)) {
    console.error(`Unknown transform "${name}". Available: ${Object.keys(transforms).join(", ")}`)
    return 1
  }

  const paths = rest.length ? rest : ["."]
  const missing = paths.filter((p) => !existsSync(p))
  if (missing.length) {
    console.error(`Path not found: ${missing.join(", ")}`)
    return 1
  }

  const dry = flags.has("--dry")
  const reports = run({ transform: name as TransformName, paths, dry })

  const changed = reports.filter((r) => r.changed)
  const notes = reports.flatMap((r) => formatNotes(r.file, r.notes))

  for (const r of changed) {
    console.log(`${dry ? "would update" : "updated"}  ${r.file}  (${r.changes} change${r.changes === 1 ? "" : "s"})`)
  }
  console.log(`\n${changed.length} file${changed.length === 1 ? "" : "s"} ${dry ? "would change" : "changed"}.`)

  if (notes.length) {
    console.log(`\nReview by hand (${notes.length}):`)
    for (const line of notes) console.log(line)
  }
  console.log("\nMigration guide: https://zagjs.com/guides/migration")
  return 0
}

process.exitCode = main(process.argv.slice(2))
