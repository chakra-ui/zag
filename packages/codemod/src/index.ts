import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import type { Note, TransformResult } from "./types"
import { isSupportedFile, transformV2 } from "./v2"

export type { Note, TransformResult } from "./types"
export { transformV2 } from "./v2"
export { transformSelectors } from "./v2/selectors"
export { formatDiff } from "./diff"
export { uncommittedFiles } from "./git"

export const transforms = {
  v2: { transform: transformV2, isSupportedFile },
}

export type TransformName = keyof typeof transforms

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".output",
  "coverage",
])

export function collectFiles(paths: string[], isSupported: (file: string) => boolean): string[] {
  const files: string[] = []
  const visit = (path: string) => {
    const stat = statSync(path)
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        if (IGNORED_DIRS.has(entry) || entry.startsWith(".")) continue
        visit(join(path, entry))
      }
    } else if (isSupported(path)) {
      files.push(path)
    }
  }
  for (const path of paths) visit(path)
  return files.sort()
}

export interface FileReport extends TransformResult {
  /** Path relative to `cwd`, or absolute when outside it */
  file: string
  /** Absolute path */
  path: string
  /** The file's contents before the transform */
  source: string
  changed: boolean
}

export interface RunOptions {
  transform: TransformName
  paths: string[]
  dry?: boolean
  cwd?: string
}

export function run(options: RunOptions): FileReport[] {
  const { transform, isSupportedFile: isSupported } = transforms[options.transform]
  const cwd = options.cwd ?? process.cwd()
  const reports: FileReport[] = []

  for (const path of collectFiles(options.paths, isSupported)) {
    const text = readFileSync(path, "utf8")
    const result = transform(text, path)
    const changed = result.code !== text
    if (changed && !options.dry) writeFileSync(path, result.code)
    if (changed || result.notes.length) {
      const rel = relative(cwd, path)
      const abs = resolve(path)
      reports.push({ ...result, file: !rel || rel.startsWith("..") ? abs : rel, path: abs, source: text, changed })
    }
  }
  return reports
}

export function formatNotes(file: string, notes: Note[]): string[] {
  return notes.map((n) => `  ${file}:${n.line}  ${n.message}`)
}
