export function lineAt(text: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++
  }
  return line
}

export function dedupeNotes<T extends { line: number; message: string }>(notes: T[]): T[] {
  const seen = new Set<string>()
  return notes
    .filter((n) => {
      const key = `${n.line}:${n.message}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.line - b.line)
}
