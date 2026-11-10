import type { Note } from "../types"
import { lineAt } from "../utils"
import { PART_RENAMES } from "./rules"

export interface TextPassResult {
  code: string
  changes: number
  notes: Note[]
}

interface Bracket {
  raw: string
  name: string
  op?: string
  value?: string
}

/** Consecutive attribute selectors, e.g. `[data-scope="menu"][data-part="item"]`. */
const ATTR_RUN = /(?:\[[^[\]\n]*\])+/g
const BRACKET = /\[[^[\]\n]*\]/g
// The case-sensitivity flag (`[a=b i]`) needs whitespace before it, otherwise an
// unquoted value like `tabs` would lose its trailing `s`.
const BRACKET_PARTS = /^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*(\\?["']?)(.*?)\3(?:\s+[is])?\s*)?\]$/

function parseBracket(raw: string): Bracket {
  const m = BRACKET_PARTS.exec(raw)
  if (!m) return { raw, name: "" }
  return { raw, name: m[1], op: m[2], value: m[4] }
}

const TAILWIND_PAIR = /(?<![\w-])data-\[(scope|part)=(['"]?)([\w-]+)\2\]:data-\[(scope|part)=(['"]?)([\w-]+)\5\]:/g
const TAILWIND_LONE = /(?<![\w-])(?:group-|peer-)?data-\[(scope|part)=/g

const TOGGLE_ATTR = /\[(?:\\?["']?)?data-(?:toggle|toggle-group)-[\w-]+/
const INDICATOR_SCOPE_ATTR = /\[data-(?:tabs|radio-group)-[\w-]+/

/**
 * Rewrites v1 `data-scope` / `data-part` selectors to v2 `data-{scope}-{part}`
 * attributes. Works on any text: CSS, JS strings, templates, Tailwind classes.
 */
export function transformSelectors(input: string): TextPassResult {
  const notes: Note[] = []
  let changes = 0
  let code = input

  const note = (offset: number, text: string, message: string) => {
    notes.push({ line: lineAt(text, offset), message })
  }

  // 1. attribute selector runs
  code = code.replace(ATTR_RUN, (run, offset: number, whole: string) => {
    if (!run.includes("data-scope") && !run.includes("data-part")) return run
    const brackets = (run.match(BRACKET) ?? []).map(parseBracket)
    const scope = brackets.find((b) => b.name === "data-scope" && b.op === "=" && b.value)
    const part = brackets.find((b) => b.name === "data-part" && b.op === "=" && b.value)

    if (scope && part) {
      changes++
      const attr = `[data-${scope.value}-${part.value}]`
      if (`${scope.value}${part.value}`.includes("${")) {
        note(
          offset,
          whole,
          `Rewrote a dynamic selector to \`${attr}\`. Check that the values passed in are v2 part names (some parts were renamed).`,
        )
      }
      return brackets
        .filter((b) => b !== part)
        .map((b) => (b === scope ? attr : b.raw))
        .join("")
    }

    const lone = brackets.find((b) => b.name === "data-scope" || b.name === "data-part")
    if (lone) {
      note(
        offset,
        whole,
        `\`${lone.raw}\` has no matching ${lone.name === "data-part" ? "data-scope" : "data-part"}. ` +
          "v2 renders one `data-{scope}-{part}` attribute per part; rewrite this selector by hand.",
      )
    }
    return run
  })

  // 2. Tailwind arbitrary variants: data-[scope=x]:data-[part=y]:
  code = code.replace(TAILWIND_PAIR, (match, k1: string, _q1, v1: string, k2: string, _q2, v2: string) => {
    if (k1 === k2) return match
    changes++
    const scope = k1 === "scope" ? v1 : v2
    const part = k1 === "part" ? v1 : v2
    return `data-[${scope}-${part}]:`
  })
  for (const m of code.matchAll(TAILWIND_LONE)) {
    note(
      m.index!,
      code,
      `Tailwind variant \`${m[0]}…]\` targets v1 \`data-${m[1]}\`. Use the v2 \`data-[{scope}-{part}]\` variant instead.`,
    )
  }

  // 3. part renames on the v2 attribute names
  for (const { scope, from, to } of PART_RENAMES) {
    const re = new RegExp(`(data-\\[?)${scope}-${from}(?![\\w-])`, "g")
    code = code.replace(re, (_m, prefix: string) => {
      changes++
      return `${prefix}${scope}-${to}`
    })
  }

  // 4. state attributes that changed for specific parts
  code = code.replace(ATTR_RUN, (run) => {
    let next = run
    if (TOGGLE_ATTR.test(run)) {
      next = next
        .replace(/\[data-state=(\\?["']?)on\1\]/g, "[data-pressed]")
        .replace(/\[data-state=(\\?["']?)off\1\]/g, ":not([data-pressed])")
    }
    if (INDICATOR_SCOPE_ATTR.test(run)) {
      next = next.replace(/\[data-ssr\]/g, "[data-indicator-pending]")
    }
    if (/\[data-floating-panel-resize-trigger\]/.test(run)) {
      next = next.replace(/\[data-axis(?=[\]=])/g, "[data-placement")
    }
    if (/\[data-image-cropper-handle\]/.test(run)) {
      next = next.replace(/\[data-position(?=[\]=])/g, "[data-placement")
    }
    if (next !== run) changes++
    return next
  })

  if (/data-steps-/.test(code)) {
    code = code.replace(/var\(\s*--percent\s*([,)])/g, (_m, end: string) => {
      changes++
      return `var(--steps-percent${end}`
    })
  }

  // 5. things that need a person
  const scan = (re: RegExp, message: string) => {
    for (const m of code.matchAll(re)) note(m.index!, code, message)
  }
  scan(/\bdata-ownedby\b/g, "`data-ownedby` is removed. The part attribute's value is now the machine id.")
  scan(/\bdata-ssr\b/g, "`data-ssr` on tab triggers and radio items is now `data-indicator-pending`.")
  scan(
    /\bdataset\.(?:part|scope)\b|getAttribute\(\s*["']data-(?:part|scope)["']\s*\)/g,
    "Reads v1 `data-part`/`data-scope`. v2 parts render one `data-{scope}-{part}` attribute instead.",
  )
  if (/data-(?:toggle|toggle-group)-|@zag-js\/toggle/.test(code)) {
    scan(
      /data-\[state=(?:on|off)\]|\[data-state=(\\?["']?)(?:on|off)\1\]/g,
      'toggle: `data-state="on|off"` is removed. Use `data-pressed`.',
    )
    scan(
      /\[data-toggle-group-[\w-]+\][^\s,{]*\[data-focus\]/g,
      "toggle-group: `data-focus` is removed. Use `:focus-visible` or `:focus-within`.",
    )
    scan(
      /getByRole\(\s*["']radio["']/g,
      'toggle-group: items are buttons with `aria-pressed` now, not radios. Query `getByRole("button", { pressed: true })`.',
    )
  }
  if (/data-(?:tabs|radio-group)-indicator/.test(code)) {
    scan(
      /--transition-(?:property|duration|timing-function)\b/g,
      "Indicator transition variables are removed. Set the transition in CSS and skip it while `data-instant` is set.",
    )
  }
  return { code, changes, notes }
}
