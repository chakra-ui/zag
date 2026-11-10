import MagicString from "magic-string"
import type { Note, TransformResult } from "../types"
import { dedupeNotes, lineAt } from "../utils"
import { MEMBER_RULES, REMOVED_MEMBERS } from "./rules"
import { transformScript } from "./script"
import { transformSelectors } from "./selectors"

const SCRIPT_EXT = /\.(?:[cm]?[jt]sx?)$/
const SFC_EXT = /\.(?:vue|svelte|astro)$/
const TEXT_EXT = /\.(?:css|scss|sass|less|pcss|postcss|styl|html?)$/

export const V2_EXTENSIONS = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|css|scss|sass|less|pcss|postcss|styl|html?)$/

export function isSupportedFile(filename: string): boolean {
  return V2_EXTENSIONS.test(filename)
}

interface Block {
  start: number
  end: number
  typescript: boolean
  jsx: boolean
}

function scriptBlocks(text: string, filename: string): Block[] {
  const blocks: Block[] = []
  if (filename.endsWith(".astro")) {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
    if (fm) {
      const start = fm[0].indexOf("\n") + 1
      blocks.push({ start, end: start + fm[1].length, typescript: true, jsx: false })
    }
  }
  for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1]
    const lang = /\blang\s*=\s*["']?(\w+)/.exec(attrs)?.[1] ?? "js"
    const start = m.index! + m[0].indexOf(">") + 1
    blocks.push({
      start,
      end: start + m[2].length,
      typescript: lang.startsWith("ts") || filename.endsWith(".astro"),
      jsx: lang === "tsx" || lang === "jsx",
    })
  }
  return blocks
}

/**
 * Member renames inside Vue/Svelte/Astro templates. Only distinctive names are
 * renamed here; generic ones need the receiver to be an `api`.
 */
function transformTemplate(text: string, s: MagicString, blocks: Block[], pkgs: Set<string>, notes: Note[]): number {
  let changes = 0
  const inScript = (i: number) => blocks.some((b) => i >= b.start && i < b.end)
  const onlyMachine = pkgs.size === 1 ? [...pkgs][0] : null

  // popover always portals in v2; leave the change to the user
  if (pkgs.has("popover")) {
    const message = REMOVED_MEMBERS.find((r) => r.name === "portalled")!.message
    for (const m of text.matchAll(/\b[\w$]*api(?:\(\))?(?:\.value)?\.portalled\b/gi)) {
      if (inScript(m.index!)) continue
      notes.push({ line: lineAt(text, m.index!), message })
    }
  }

  for (const rule of MEMBER_RULES) {
    const inFile = rule.pkgs.some((p) => pkgs.has(p))
    if (!inFile && !rule.unique) continue
    const re = new RegExp(`(\\b[\\w$]+(?:\\.value)?\\s*\\.\\s*)${rule.from}\\b(\\s*\\(\\s*\\))?`, "g")
    for (const m of text.matchAll(re)) {
      const at = m.index!
      if (inScript(at)) continue
      const receiver = m[1].replace(/\.value\s*\.\s*$|\s*\.\s*$/, "")
      const apiLike = /api$/i.test(receiver)
      const allowed = !rule.generic || (apiLike && onlyMachine !== null && rule.pkgs.includes(onlyMachine))
      if (!allowed) {
        if (inFile) {
          notes.push({
            line: lineAt(text, at),
            message: `\`${rule.from}\` may be the ${rule.pkgs.join("/")} api member renamed to \`${rule.to}\` in v2.`,
          })
        }
        continue
      }
      const nameStart = at + m[1].length
      if (rule.special === "clear-highlight" && m[2]) {
        s.overwrite(nameStart, at + m[0].length, `${rule.to}(null)`)
      } else {
        s.overwrite(nameStart, nameStart + rule.from.length, rule.to)
      }
      if (rule.special === "indicator-expanded" || rule.special === "indicator-selected") {
        const type = rule.special === "indicator-expanded" ? "expanded" : "selected"
        const callStart = at + m[0].length
        const rest = text.slice(callStart)
        const arg = /^\s*\(\s*([\w$.]+)\s*\)/.exec(rest)
        const literal = /^\s*\(\s*\{([^{}]*?)[\s,]*\}\s*\)/.exec(rest)
        if (arg) {
          s.overwrite(callStart, callStart + arg[0].length, `({ ...${arg[1]}, type: "${type}" })`)
        } else if (literal && literal[1].trim()) {
          s.overwrite(callStart, callStart + literal[0].length, `({ ${literal[1].trim()}, type: "${type}" })`)
        } else {
          notes.push({ line: lineAt(text, at), message: `tree-view: pass \`type: "${type}"\` to \`${rule.to}\`.` })
        }
      }
      changes++
    }
  }
  return changes
}

/** Notes about structural changes that can't be rewritten mechanically. */
function structuralNotes(code: string, pkgs: Set<string>): Note[] {
  const notes: Note[] = []
  const at = (re: RegExp) => {
    const m = re.exec(code)
    return m ? lineAt(code, m.index) : 1
  }
  const has = (re: RegExp) => re.test(code)

  for (const pkg of ["combobox", "select", "listbox"]) {
    if (pkgs.has(pkg) && has(/\bgetContentProps\b/) && !has(/\bgetListProps\b/)) {
      notes.push({
        line: at(/\bgetContentProps\b/),
        message: `${pkg}: \`role="listbox"\` moved to a new \`list\` part. Wrap the items in \`api.getListProps()\`.`,
      })
    }
  }
  if (pkgs.has("toast") && has(/\bgetRootProps\b/) && !has(/\bgetContentProps\b/)) {
    notes.push({
      line: at(/\bgetRootProps\b/),
      message: "toast: render the new `content` part around the title and description, or the height stops updating.",
    })
  }
  if (pkgs.has("number-input")) {
    if (has(/\bgetScrubberProps\b/) && !has(/\bgetScrubberCursorProps\b/)) {
      notes.push({
        line: at(/\bgetScrubberProps\b/),
        message: "number-input: the scrubber no longer creates its cursor. Render `api.getScrubberCursorProps()`.",
      })
    }
    notes.push({
      line: at(/@zag-js\/number-input/),
      message: "number-input: `value` is now `number | null` (was a string). Read the text from `formattedValue`.",
    })
  }
  if (pkgs.has("tree-view")) {
    notes.push({
      line: at(/@zag-js\/tree-view/),
      message:
        "tree-view: branches and items are one node model now. Each node renders `getNodeGroupProps` > `getNodeProps` > `getNodeCellProps`; check the markup against the v2 docs.",
    })
  }
  if (pkgs.has("steps")) {
    notes.push({
      line: at(/@zag-js\/steps/),
      message:
        "steps: steps are an `items` array addressed by `value` instead of index (`count`, `step`, `onStepChange` and more changed). Follow the Steps table in the migration guide.",
    })
  }
  if (pkgs.has("scheduler") && has(/\b(?:parseZonedDateTime|toZoned|parseDate)\s*\(/)) {
    notes.push({
      line: at(/\b(?:parseZonedDateTime|toZoned|parseDate)\s*\(/),
      message: "scheduler: dates are `CalendarDateTime` now. Convert zoned or date-only values first.",
    })
  }
  if (pkgs.has("async-list") && has(/\bMachine<[^<>,]+,[^<>,]+>/)) {
    notes.push({
      line: at(/\bMachine<[^<>,]+,[^<>,]+>/),
      message: "async-list: `Machine` takes four type parameters now: `Item, Filter, Sorting, Cursor`.",
    })
  }
  return notes
}

export function transformV2(text: string, filename: string): TransformResult {
  const notes: Note[] = []
  let changes = 0
  let code = text
  const pkgs = new Set<string>()

  const isScript = SCRIPT_EXT.test(filename)
  const isSfc = SFC_EXT.test(filename)

  if (isScript || isSfc) {
    const s = new MagicString(text)
    const blocks: Block[] = isScript
      ? [
          {
            start: 0,
            end: text.length,
            typescript: /\.[cm]?tsx?$/.test(filename),
            jsx: !/\.[cm]?ts$/.test(filename),
          },
        ]
      : scriptBlocks(text, filename)

    for (const block of blocks) {
      const result = transformScript(text.slice(block.start, block.end), s, {
        base: block.start,
        fullText: text,
        typescript: block.typescript,
        jsx: block.jsx,
      })
      changes += result.changes
      notes.push(...result.notes)
      for (const pkg of result.pkgs) pkgs.add(pkg)
    }

    if (isSfc) changes += transformTemplate(text, s, blocks, pkgs, notes)
    code = s.toString()
  } else if (!TEXT_EXT.test(filename)) {
    return { code: text, changes: 0, notes: [] }
  }

  const selectors = transformSelectors(code)
  code = selectors.code
  changes += selectors.changes
  notes.push(...selectors.notes)
  notes.push(...structuralNotes(code, pkgs))

  return { code, changes, notes: dedupeNotes(notes) }
}
