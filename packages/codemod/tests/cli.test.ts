import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { formatDiff } from "../src/diff"
import { main, type Io } from "../src/main"

const V1 = `.a [data-scope="dialog"][data-part="trigger"] { color: red }\n`
const V2 = `.a [data-dialog-trigger] { color: red }\n`

let dir: string

function git(...args: string[]) {
  execFileSync("git", args, { cwd: dir, stdio: "ignore" })
}

function setup(opts: { repo?: boolean } = {}) {
  dir = mkdtempSync(join(tmpdir(), "zag-codemod-"))
  writeFileSync(join(dir, "a.css"), V1)
  writeFileSync(join(dir, "b.css"), V1)
  writeFileSync(join(dir, "plain.css"), `.x { color: red }\n`)
  if (opts.repo !== false) {
    git("init", "-q")
    git("add", ".")
    git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "init")
  }
}

function io(opts: Partial<Io> = {}) {
  const out: string[] = []
  const err: string[] = []
  const value: Io = {
    cwd: dir,
    log: (l) => out.push(l),
    error: (l) => err.push(l),
    interactive: false,
    confirm: async () => false,
    ...opts,
  }
  return { io: value, out: () => out.join("\n"), err: () => err.join("\n") }
}

const read = (file: string) => readFileSync(join(dir, file), "utf8")
const cli = (args: string[], ctx = io()) => main(["v2", dir, ...args], ctx.io)

describe("cli", () => {
  beforeEach(() => setup())
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  test("writes changes on a clean tree", async () => {
    const ctx = io()
    expect(await cli([], ctx)).toBe(0)
    expect(read("a.css")).toBe(V2)
    expect(ctx.out()).toContain("2 files changed.")
  })

  test("--dry-run prints a diff and writes nothing", async () => {
    const ctx = io()
    expect(await cli(["--dry-run"], ctx)).toBe(0)
    expect(read("a.css")).toBe(V1)
    expect(ctx.out()).toContain(`- ${V1.trim()}`)
    expect(ctx.out()).toContain(`+ ${V2.trim()}`)
    expect(ctx.out()).toContain("2 files would change.")
  })

  test("--dry and -d are aliases, --no-diff lists files only", async () => {
    for (const flag of ["--dry", "-d"]) {
      const ctx = io()
      expect(await cli([flag, "--no-diff"], ctx)).toBe(0)
      expect(ctx.out()).toContain("would update")
      expect(ctx.out()).not.toContain("+ ")
    }
    expect(read("a.css")).toBe(V1)
  })

  test("refuses to overwrite uncommitted changes and writes nothing", async () => {
    writeFileSync(join(dir, "a.css"), `${V1}/* local edit */\n`)
    const ctx = io()
    expect(await cli([], ctx)).toBe(1)
    expect(ctx.err()).toContain("a.css")
    expect(ctx.err()).not.toContain("b.css")
    expect(read("a.css")).toContain("local edit")
    expect(read("b.css")).toBe(V1)
  })

  test("treats untracked files as uncommitted", async () => {
    writeFileSync(join(dir, "new.css"), V1)
    const ctx = io()
    expect(await cli([], ctx)).toBe(1)
    expect(ctx.err()).toContain("new.css")
    expect(read("new.css")).toBe(V1)
  })

  test("ignores uncommitted files it wouldn't change", async () => {
    writeFileSync(join(dir, "plain.css"), `.x { color: blue }\n`)
    expect(await cli([])).toBe(0)
    expect(read("a.css")).toBe(V2)
  })

  test("--force writes over uncommitted changes", async () => {
    writeFileSync(join(dir, "a.css"), `${V1}/* local edit */\n`)
    expect(await cli(["--force"])).toBe(0)
    expect(read("a.css")).toBe(`${V2}/* local edit */\n`)
  })

  test("asks before overwriting when run in a terminal", async () => {
    writeFileSync(join(dir, "a.css"), `${V1}/* local edit */\n`)
    const questions: string[] = []
    const no = io({ interactive: true, confirm: async (q) => (questions.push(q), false) })
    expect(await cli([], no)).toBe(1)
    expect(questions).toHaveLength(1)
    expect(read("b.css")).toBe(V1)

    const yes = io({ interactive: true, confirm: async () => true })
    expect(await cli([], yes)).toBe(0)
    expect(read("b.css")).toBe(V2)
  })

  test("rejects unknown options", async () => {
    const ctx = io()
    expect(await cli(["--dryrun"], ctx)).toBe(1)
    expect(ctx.err()).toContain("Unknown option: --dryrun")
    expect(read("a.css")).toBe(V1)
  })
})

describe("cli outside git", () => {
  beforeEach(() => setup({ repo: false }))
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  test("warns and writes", async () => {
    const ctx = io()
    expect(await cli([], ctx)).toBe(0)
    expect(ctx.out()).toContain("Not in a git repository")
    expect(read("a.css")).toBe(V2)
  })
})

describe("formatDiff", () => {
  test("shows only changed lines with context", () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`)
    const after = [...before]
    after[2] = "changed 3"
    after[15] = "changed 16"
    const diff = formatDiff("f.ts", before.join("\n"), after.join("\n"))
    expect(diff.split("\n")).toEqual([
      "f.ts",
      "@@ line 1 @@",
      "  line 1",
      "  line 2",
      "- line 3",
      "+ changed 3",
      "  line 4",
      "  line 5",
      "@@ line 14 @@",
      "  line 14",
      "  line 15",
      "- line 16",
      "+ changed 16",
      "  line 17",
      "  line 18",
    ])
  })
})
