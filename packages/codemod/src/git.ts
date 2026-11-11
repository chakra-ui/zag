import { execFileSync } from "node:child_process"

/**
 * Files among `files` that have uncommitted changes, including untracked ones.
 * Returns `null` when `cwd` isn't inside a git repository.
 */
export function uncommittedFiles(files: string[], cwd: string): string[] | null {
  if (files.length === 0) return []
  try {
    const out = execFileSync("git", ["status", "--porcelain", "-z", "--untracked-files=all", "--", ...files], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    const entries = out.split("\0").filter(Boolean)
    const dirty: string[] = []
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      dirty.push(entry.slice(3))
      // a rename is followed by its source path
      if (entry[0] === "R" || entry[0] === "C") i++
    }
    return dirty
  } catch {
    return null
  }
}
