export interface DiffColors {
  file: (s: string) => string
  hunk: (s: string) => string
  removed: (s: string) => string
  added: (s: string) => string
}

const plain = (s: string) => s

export const noColors: DiffColors = { file: plain, hunk: plain, removed: plain, added: plain }

const ansi = (code: number) => (s: string) => `\x1b[${code}m${s}\x1b[0m`

export const ansiColors: DiffColors = { file: ansi(1), hunk: ansi(36), removed: ansi(31), added: ansi(32) }

type Op = { type: " " | "-" | "+"; text: string; line: number }

const MAX_CELLS = 4_000_000
const CONTEXT = 2

function diffLines(a: string[], b: string[]): Op[] {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  const ops: Op[] = []
  for (let i = 0; i < start; i++) ops.push({ type: " ", text: a[i], line: i + 1 })

  const m = endA - start
  const n = endB - start
  if (m * n > MAX_CELLS) {
    for (let i = start; i < endA; i++) ops.push({ type: "-", text: a[i], line: i + 1 })
    for (let j = start; j < endB; j++) ops.push({ type: "+", text: b[j], line: j + 1 })
  } else {
    // longest common subsequence of the changed middle
    const lcs = new Uint32Array((m + 1) * (n + 1))
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        lcs[i * (n + 1) + j] =
          a[start + i] === b[start + j]
            ? lcs[(i + 1) * (n + 1) + j + 1] + 1
            : Math.max(lcs[(i + 1) * (n + 1) + j], lcs[i * (n + 1) + j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < m || j < n) {
      if (i < m && j < n && a[start + i] === b[start + j]) {
        ops.push({ type: " ", text: a[start + i], line: start + i + 1 })
        i++
        j++
      } else if (j < n && (i === m || lcs[i * (n + 1) + j + 1] > lcs[(i + 1) * (n + 1) + j])) {
        ops.push({ type: "+", text: b[start + j], line: start + j + 1 })
        j++
      } else {
        ops.push({ type: "-", text: a[start + i], line: start + i + 1 })
        i++
      }
    }
  }

  for (let i = endA; i < a.length; i++) ops.push({ type: " ", text: a[i], line: i + 1 })
  return ops
}

/** A unified-style diff of `before` → `after`, with a little context around each change */
export function formatDiff(file: string, before: string, after: string, colors: DiffColors = noColors): string {
  const ops = diffLines(before.split("\n"), after.split("\n"))
  const out = [colors.file(file)]

  let i = 0
  while (i < ops.length) {
    if (ops[i].type === " ") {
      i++
      continue
    }
    // grow the hunk while changes are close together
    let end = i
    let lastChange = i
    while (end < ops.length && end - lastChange <= CONTEXT * 2) {
      if (ops[end].type !== " ") lastChange = end
      end++
    }
    const from = Math.max(0, i - CONTEXT)
    const to = Math.min(ops.length, lastChange + CONTEXT + 1)
    const firstOld = ops.slice(from, to).find((op) => op.type !== "+")
    out.push(colors.hunk(`@@ line ${firstOld?.line ?? ops[from].line} @@`))
    for (const op of ops.slice(from, to)) {
      const line = `${op.type} ${op.text}`
      out.push(op.type === "-" ? colors.removed(line) : op.type === "+" ? colors.added(line) : line)
    }
    i = to
  }
  return out.join("\n")
}
