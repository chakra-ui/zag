import { existsSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { ansiColors, formatDiff, noColors } from "./diff"
import { uncommittedFiles } from "./git"
import { formatNotes, run, transforms, type TransformName } from "./index"

const HELP = `Usage: zag-codemod <transform> [paths...] [options]

Transforms:
  v2              Upgrade zag.js v1 code, styles and tests to v2

Options:
  -d, --dry-run   Show the changes as a diff without writing files
  --no-diff       With --dry-run, print only the list of files
  --force         Write even when files it would change have uncommitted changes
  -h, --help      Show this message

Examples:
  npx @zag-js/codemod v2 src --dry-run
  npx @zag-js/codemod v2 src styles
`

const FLAGS = new Set(["-d", "--dry", "--dry-run", "--no-diff", "--force", "-h", "--help"])

export interface Io {
  cwd: string
  log: (line: string) => void
  error: (line: string) => void
  /** Whether a person is at the terminal, so we can ask and use colors */
  interactive: boolean
  confirm: (question: string) => Promise<boolean>
}

async function ask(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await rl.question(`${question} (y/N) `)
    return /^y(es)?$/i.test(answer.trim())
  } finally {
    rl.close()
  }
}

export function defaultIo(): Io {
  return {
    cwd: process.cwd(),
    log: (line) => console.log(line),
    error: (line) => console.error(line),
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    confirm: ask,
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export async function main(argv: string[], io: Io = defaultIo()): Promise<number> {
  const args = argv.filter((a) => !a.startsWith("-"))
  const flags = new Set(argv.filter((a) => a.startsWith("-")))

  const unknown = [...flags].filter((f) => !FLAGS.has(f))
  if (unknown.length) {
    io.error(`Unknown option: ${unknown.join(", ")}\n`)
    io.error(HELP)
    return 1
  }

  if (flags.has("--help") || flags.has("-h") || args.length === 0) {
    io.log(HELP)
    return args.length === 0 && !flags.has("--help") && !flags.has("-h") ? 1 : 0
  }

  const [name, ...rest] = args
  if (!(name in transforms)) {
    io.error(`Unknown transform "${name}". Available: ${Object.keys(transforms).join(", ")}`)
    return 1
  }

  const paths = rest.length ? rest : ["."]
  const missing = paths.filter((p) => !existsSync(p))
  if (missing.length) {
    io.error(`Path not found: ${missing.join(", ")}`)
    return 1
  }

  const dry = flags.has("--dry-run") || flags.has("--dry") || flags.has("-d")
  const showDiff = dry && !flags.has("--no-diff")
  const force = flags.has("--force")
  const colors = io.interactive && !process.env.NO_COLOR ? ansiColors : noColors

  // Work out every change first, so nothing is written if we stop below
  const reports = run({ transform: name as TransformName, paths, dry: true, cwd: io.cwd })
  const changed = reports.filter((r) => r.changed)

  if (!dry && !force && changed.length) {
    const dirty = uncommittedFiles(
      changed.map((r) => r.path),
      io.cwd,
    )
    if (dirty === null) {
      io.log("Not in a git repository, so these changes can't be undone with git. Back up the files first.\n")
    } else if (dirty.length) {
      io.error(
        `${plural(dirty.length, "file")} it would change ${dirty.length === 1 ? "has" : "have"} uncommitted changes:`,
      )
      for (const file of dirty) io.error(`  ${file}`)
      const proceed = io.interactive && (await io.confirm("\nOverwrite them anyway?"))
      if (!proceed) {
        io.error(
          "\nNothing was written. Commit or stash those changes first, so the codemod can be undone with git, or pass --force.",
        )
        return 1
      }
    }
  }

  if (!dry) {
    for (const r of changed) writeFileSync(r.path, r.code)
  }

  for (const r of changed) {
    if (showDiff) {
      io.log(`${formatDiff(r.file, r.source, r.code, colors)}\n`)
    } else {
      io.log(`${dry ? "would update" : "updated"}  ${r.file}  (${plural(r.changes, "change")})`)
    }
  }
  io.log(`\n${plural(changed.length, "file")} ${dry ? "would change" : "changed"}.`)

  const notes = reports.flatMap((r) => formatNotes(r.file, r.notes))
  if (notes.length) {
    io.log(`\nReview by hand (${notes.length}):`)
    for (const line of notes) io.log(line)
  }
  if (dry && changed.length) io.log("\nDry run, nothing was written. Run again without --dry-run to apply.")
  io.log("\nMigration guide: https://zagjs.com/guides/migration")
  return 0
}
