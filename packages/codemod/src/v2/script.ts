import { parse } from "@babel/parser"
import type MagicString from "magic-string"
import type { Note } from "../types"
import { lineAt } from "../utils"
import {
  CHANGED_DEFAULTS,
  EXPORT_RENAMES,
  MEMBER_RULES,
  NESTED_RENAMES,
  NON_MACHINE_PACKAGES,
  PROP_RENAMES,
  REMOVED_MEMBERS,
  REMOVED_PROPS,
  type MemberRule,
} from "./rules"

// Babel's AST types are loose for our purposes; nodes are walked generically.
type Node = any

export interface ScriptOptions {
  /** Offset of this script inside the full file (for SFC script blocks). */
  base: number
  /** The full file text, used for line numbers. */
  fullText: string
  typescript: boolean
  jsx: boolean
}

export interface ScriptResult {
  changes: number
  notes: Note[]
  /** Machine packages imported by this script. */
  pkgs: Set<string>
  /** All `@zag-js/*` packages imported by this script. */
  imports: Set<string>
  parsed: boolean
}

const MEMBER_BY_NAME = new Map<string, MemberRule[]>()
for (const rule of MEMBER_RULES) {
  const list = MEMBER_BY_NAME.get(rule.from) ?? []
  list.push(rule)
  MEMBER_BY_NAME.set(rule.from, list)
}

const REMOVED_RECT_UTILS = new Set([
  "resizeRect",
  "AffineTransform",
  "compassDirectionMap",
  "oppositeDirectionMap",
  "ScalingOptions",
])

const SKIP_KEYS = new Set(["loc", "start", "end", "extra", "leadingComments", "trailingComments", "innerComments"])

function walk(node: Node, visit: (node: Node, parent: Node | null) => void, parent: Node | null = null) {
  if (!node || typeof node.type !== "string") return
  visit(node, parent)
  for (const key in node) {
    if (SKIP_KEYS.has(key)) continue
    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value) if (child && typeof child.type === "string") walk(child, visit, node)
    } else if (value && typeof value.type === "string") {
      walk(value, visit, node)
    }
  }
}

const isFunction = (n: Node) =>
  n?.type === "ArrowFunctionExpression" || n?.type === "FunctionExpression" || n?.type === "ObjectMethod"

function returnedExpression(fn: Node): Node | null {
  if (fn.type === "ArrowFunctionExpression" && fn.body.type !== "BlockStatement") return fn.body
  const body = fn.body?.body ?? []
  for (const stmt of body) if (stmt.type === "ReturnStatement") return stmt.argument
  return null
}

function keyName(prop: Node): string | null {
  if (prop.computed) return null
  const key = prop.key
  if (!key) return null
  if (key.type === "Identifier") return key.name
  if (key.type === "StringLiteral") return key.value
  return null
}

export function transformScript(code: string, s: MagicString, options: ScriptOptions): ScriptResult {
  const { base, fullText } = options
  const notes: Note[] = []
  const pkgs = new Set<string>()
  const imports = new Set<string>()
  let changes = 0

  let ast: Node
  try {
    const plugins: any[] = []
    if (options.typescript) plugins.push("typescript")
    if (options.jsx) plugins.push("jsx")
    ast = parse(code, { sourceType: "module", plugins, errorRecovery: true, allowReturnOutsideFunction: true })
  } catch (error) {
    notes.push({
      line: lineAt(fullText, base),
      message: `Could not parse this script (${(error as Error).message}). Only selectors were updated.`,
    })
    return { changes, notes, pkgs, imports, parsed: false }
  }

  const src = (n: Node) => code.slice(n.start, n.end)
  const note = (n: Node, message: string) => notes.push({ line: lineAt(fullText, base + n.start), message })

  const edited: Array<[number, number]> = []
  const free = (start: number, end: number) => edited.every(([a, b]) => end <= a || start >= b)
  const overwrite = (start: number, end: number, text: string) => {
    if (!free(start, end)) return false
    s.overwrite(base + start, base + end, text)
    edited.push([start, end])
    changes++
    return true
  }
  const remove = (start: number, end: number) => {
    if (!free(start, end)) return false
    s.remove(base + start, base + end)
    edited.push([start, end])
    changes++
    return true
  }
  const insert = (at: number, text: string) => {
    s.appendLeft(base + at, text)
    changes++
  }

  // ---------------------------------------------------------------------------
  // 1. imports
  // ---------------------------------------------------------------------------

  const namespaces = new Map<string, string>()
  const named = new Map<string, { pkg: string; imported: string }>()

  for (const stmt of ast.program.body) {
    if (stmt.type !== "ImportDeclaration") continue
    const match = /^@zag-js\/([\w-]+)$/.exec(stmt.source.value)
    if (!match) continue
    const pkg = match[1]
    imports.add(pkg)

    if (pkg === "rect-utils") {
      for (const spec of stmt.specifiers) {
        const imported = spec.imported?.name ?? spec.imported?.value
        if (imported && REMOVED_RECT_UTILS.has(imported)) {
          note(spec, `@zag-js/rect-utils: \`${imported}\` is removed in v2.`)
        }
      }
    }
    if (NON_MACHINE_PACKAGES.has(pkg)) continue

    pkgs.add(pkg)
    for (const spec of stmt.specifiers) {
      if (spec.type === "ImportNamespaceSpecifier" || spec.type === "ImportDefaultSpecifier") {
        namespaces.set(spec.local.name, pkg)
      } else if (spec.type === "ImportSpecifier") {
        const imported = spec.imported.name ?? spec.imported.value
        named.set(spec.local.name, { pkg, imported })
        const renamed = EXPORT_RENAMES[pkg]?.find((r) => r.from === imported)
        if (renamed) {
          if (spec.local.start === spec.imported.start)
            overwrite(spec.start, spec.end, `${renamed.to} as ${spec.local.name}`)
          else overwrite(spec.imported.start, spec.imported.end, renamed.to)
        }
      }
    }
  }

  /** `ns.machine` / `ns.connect` or a named import of it */
  const refPkg = (n: Node, member: string): string | null => {
    if (!n) return null
    if (n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression" || n.type === "TSNonNullExpression") {
      return refPkg(n.expression, member)
    }
    if (n.type === "MemberExpression" && !n.computed && n.object.type === "Identifier" && n.property.name === member) {
      return namespaces.get(n.object.name) ?? null
    }
    if (n.type === "Identifier") {
      const imp = named.get(n.name)
      if (imp?.imported === member) return imp.pkg
    }
    return null
  }

  /** `ns.Api`, `Partial<ns.Props>`, named `Api` */
  const typePkg = (t: Node, name: string): string | null => {
    if (!t) return null
    if (t.type === "TSTypeAnnotation") return typePkg(t.typeAnnotation, name)
    if (t.type !== "TSTypeReference") return null
    const tn = t.typeName
    if (tn.type === "TSQualifiedName" && tn.left.type === "Identifier" && tn.right.name === name) {
      return namespaces.get(tn.left.name) ?? null
    }
    if (tn.type === "Identifier") {
      const imp = named.get(tn.name)
      if (imp?.imported === name) return imp.pkg
      const params = t.typeParameters?.params ?? t.typeArguments?.params
      if (params?.length) return typePkg(params[0], name)
    }
    return null
  }

  /** `ns.connect(...)`, possibly wrapped in computed/createMemo/$derived/useMemo */
  const connectPkg = (n: Node, depth = 0): string | null => {
    if (!n || depth > 3) return null
    if (n.type === "CallExpression") {
      const direct = refPkg(n.callee, "connect")
      if (direct) return direct
      const arg = n.arguments[0]
      if (isFunction(arg)) return connectPkg(returnedExpression(arg), depth + 1)
      return connectPkg(arg, depth + 1)
    }
    if (n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression") return connectPkg(n.expression, depth + 1)
    return null
  }

  // ---------------------------------------------------------------------------
  // 2. where the api lives
  // ---------------------------------------------------------------------------

  // A name can hold different apis in different components of one file.
  const apiVars = new Map<string, Set<string>>()
  const apiProps = new Map<string, Set<string>>()
  const addTo = (map: Map<string, Set<string>>, name: string, pkg: string) => {
    const set = map.get(name) ?? new Set<string>()
    set.add(pkg)
    map.set(name, set)
  }
  const isAsyncListHook = (n: Node) =>
    n?.type === "CallExpression" && n.callee.type === "Identifier" && /^(?:use|create)AsyncList$/.test(n.callee.name)

  walk(ast.program, (n) => {
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier") {
      const pkg =
        connectPkg(n.init) ?? typePkg(n.id.typeAnnotation, "Api") ?? (isAsyncListHook(n.init) ? "async-list" : null)
      if (pkg) addTo(apiVars, n.id.name, pkg)
    }
    if (n.type === "Identifier" && n.typeAnnotation) {
      const pkg = typePkg(n.typeAnnotation, "Api")
      if (pkg) addTo(apiVars, n.name, pkg)
    }
    if ((n.type === "TSPropertySignature" || n.type === "ObjectProperty") && n.key?.type === "Identifier") {
      const pkg = typePkg(n.typeAnnotation, "Api")
      if (pkg) addTo(apiProps, n.key.name, pkg)
    }
  })

  const resolveReceiver = (n: Node): Set<string> | null => {
    if (!n) return null
    if (n.type === "Identifier") return apiVars.get(n.name) ?? apiProps.get(n.name) ?? null
    if ((n.type === "MemberExpression" || n.type === "OptionalMemberExpression") && !n.computed) {
      if (n.property.name === "value" && n.object.type === "Identifier") return apiVars.get(n.object.name) ?? null
      return apiProps.get(n.property.name) ?? null
    }
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.arguments.length === 0) {
      return apiVars.get(n.callee.name) ?? null
    }
    return null
  }

  const apiLike = (n: Node): boolean => {
    if (!n) return false
    if (n.type === "Identifier") return /api$/i.test(n.name)
    if ((n.type === "MemberExpression" || n.type === "OptionalMemberExpression") && !n.computed) {
      return /api$/i.test(n.property.name) || (n.property.name === "value" && apiLike(n.object))
    }
    if (n.type === "CallExpression" && n.arguments.length === 0) return apiLike(n.callee)
    return false
  }

  // ---------------------------------------------------------------------------
  // 3. machine props objects
  // ---------------------------------------------------------------------------

  const propsObject = (n: Node, depth = 0): Node | null => {
    if (!n || depth > 3) return null
    if (n.type === "ObjectExpression") return n
    if (isFunction(n)) return propsObject(returnedExpression(n), depth + 1)
    if (n.type === "CallExpression") return propsObject(n.arguments[0], depth + 1)
    if (n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression") return propsObject(n.expression, depth + 1)
    return null
  }

  const handledObjects = new Set<Node>()

  const removedProps = new Set<Node>()
  const removeProperty = (obj: Node, prop: Node) => {
    const list: Node[] = obj.properties
    const i = list.indexOf(prop)
    const next = list[i + 1]
    const prev = list
      .slice(0, i)
      .reverse()
      .find((p) => !removedProps.has(p))
    const before = list[i - 1]
    removedProps.add(prop)
    if (next) return remove(prop.start, next.start)
    if (prev && before !== prev) {
      // the props in between are already gone, along with their trailing commas
      remove(prev.end, before.start)
      return remove(prop.start, prop.end)
    }
    if (prev) return remove(prev.end, prop.end)
    const after = code.slice(prop.end).match(/^\s*,/)
    return remove(prop.start, prop.end + (after ? after[0].length : 0))
  }

  const renameKey = (prop: Node, to: string) => {
    if (prop.shorthand) {
      const value = prop.value.type === "AssignmentPattern" ? src(prop.value) : prop.key.name
      return overwrite(prop.start, prop.end, `${to}: ${value}`)
    }
    const quoted = prop.key.type === "StringLiteral"
    return overwrite(prop.key.start, prop.key.end, quoted ? JSON.stringify(to) : to)
  }

  const renameKeysIn = (obj: Node, rules: Array<{ from: string; to: string }>) => {
    if (obj?.type !== "ObjectExpression" && obj?.type !== "ObjectPattern") return
    for (const prop of obj.properties) {
      const name = keyName(prop)
      const rule = rules.find((r) => r.from === name)
      if (rule) renameKey(prop, rule.to)
    }
  }

  const insertDefault = (obj: Node, prop: string, value: string) => {
    const inner = code.slice(obj.start + 1, obj.end - 1)
    const first = obj.properties[0]
    if (!first) return insert(obj.start + 1, ` ${prop}: ${value} `)
    if (inner.includes("\n")) {
      const lineStart = code.lastIndexOf("\n", first.start) + 1
      const indent = code.slice(lineStart, first.start)
      return insert(first.start, `${prop}: ${value},\n${indent}`)
    }
    return insert(first.start, `${prop}: ${value}, `)
  }

  const applyProps = (pkg: string, obj: Node) => {
    if (handledObjects.has(obj)) return
    handledObjects.add(obj)

    const props: Node[] = obj.properties
    const byName = new Map<string, Node>()
    for (const p of props) {
      const name = keyName(p)
      if (name) byName.set(name, p)
    }

    for (const prop of props) {
      const name = keyName(prop)
      if (!name) continue

      const rename = PROP_RENAMES[pkg]?.find((r) => r.from === name)
      if (rename) {
        renameKey(prop, rename.to)
        continue
      }

      if (REMOVED_PROPS[pkg]?.includes(name)) {
        removeProperty(obj, prop)
        continue
      }

      const nested = NESTED_RENAMES[pkg]
      if (nested && (name === "ids" || name === "translations")) {
        const rules = nested[name]
        if (rules) renameKeysIn(prop.value, rules)
        continue
      }

      if (name === "composite" && ["combobox", "menu", "select", "tabs"].includes(pkg)) {
        const value = prop.value
        const isTabs = pkg === "tabs"
        if (value?.type === "BooleanLiteral") {
          if (value.value) removeProperty(obj, prop)
          else overwrite(prop.start, prop.end, isTabs ? "virtualFocus: true" : 'popupType: "dialog"')
        } else if (isTabs && value) {
          overwrite(prop.start, prop.end, `virtualFocus: !(${src(value)})`)
        } else {
          note(prop, `${pkg}: \`composite\` is replaced by \`popupType: "dialog"\` (when composite was false).`)
        }
        continue
      }

      if (pkg === "combobox" && name === "disableLayer") {
        if (prop.value?.type === "BooleanLiteral" && prop.value.value) {
          renameKey(prop, "inline")
          const open = byName.get("open")
          if (open?.value?.type === "BooleanLiteral" && open.value.value) removeProperty(obj, open)
        } else {
          note(prop, "combobox: `disableLayer` is replaced by `inline`, an always-open combobox.")
        }
        continue
      }

      if (pkg === "slider" && (name === "aria-label" || name === "aria-labelledby")) {
        const fn = name === "aria-label" ? "getAriaLabel" : "getAriaLabelledBy"
        const value = prop.value
        const simple = ["ArrayExpression", "Identifier", "MemberExpression"].includes(value.type)
        const list = simple ? src(value) : `(${src(value)})`
        overwrite(prop.start, prop.end, `${fn}: ({ index }) => ${list}[index]`)
        continue
      }

      if (pkg === "number-input" && (name === "allowOverflow" || name === "clampValueOnBlur")) {
        const value = prop.value
        const outOfRange = name === "allowOverflow" ? value?.value === true : value?.value === false
        if (value?.type !== "BooleanLiteral") {
          note(prop, `number-input: \`${name}\` is replaced by \`allowOutOfRange\`.`)
        } else if (!outOfRange) {
          removeProperty(obj, prop)
        } else if (
          byName.has("allowOutOfRange") ||
          (name === "clampValueOnBlur" && byName.get("allowOverflow")?.value?.value === true)
        ) {
          removeProperty(obj, prop)
        } else {
          overwrite(prop.start, prop.end, "allowOutOfRange: true")
          byName.set("allowOutOfRange", prop)
          if (name === "allowOverflow") {
            note(
              prop,
              "number-input: `allowOverflow` is now `allowOutOfRange`. Typed values can leave the range, but stepping always stays within it.",
            )
          }
        }
        continue
      }

      if (pkg === "pin-input" && name === "blurOnComplete") {
        note(prop, "pin-input: `blurOnComplete` is removed. Move focus in `onValueComplete` instead.")
        continue
      }

      if (pkg === "async-list" && (name === "load" || name === "sort")) {
        const fn = prop.type === "ObjectMethod" ? prop : prop.value
        const param = isFunction(fn) ? fn.params[0] : null
        if (param?.type === "ObjectPattern") {
          renameKeysIn(param, [
            { from: "filterText", to: "filter" },
            { from: name === "load" ? "sortDescriptor" : "descriptor", to: "sorting" },
          ])
        } else if (param) {
          note(
            param,
            `async-list: \`${name}\` now receives \`filter\` and \`sorting\` instead of \`filterText\` and \`${name === "load" ? "sortDescriptor" : "descriptor"}\`.`,
          )
        }
        continue
      }
    }

    const changed = CHANGED_DEFAULTS[pkg]
    if (changed && !byName.has(changed.prop)) {
      const hasSpread = props.some((p) => p.type === "SpreadElement")
      insertDefault(obj, changed.prop, changed.v1)
      note(
        obj,
        `${changed.note}. Added \`${changed.prop}: ${changed.v1}\` to keep the v1 behavior${hasSpread ? " (spread props still override it)" : ""}; remove it to adopt the new default.`,
      )
    }

    if (pkg === "pin-input" && !byName.has("count") && !props.some((p) => p.type === "SpreadElement")) {
      note(obj, "pin-input: `count` is now required. The machine no longer counts the inputs in the DOM.")
    }
  }

  const propsFromCall = (pkg: string, arg: Node, at: Node) => {
    const obj = propsObject(arg)
    if (obj) return applyProps(pkg, obj)
    const changed = CHANGED_DEFAULTS[pkg]
    if (changed && arg) {
      note(at, `${changed.note}. Pass \`${changed.prop}: ${changed.v1}\` to keep the v1 behavior.`)
    }
  }

  walk(ast.program, (n) => {
    if (n.type === "CallExpression" || n.type === "NewExpression") {
      const callee = n.callee
      const isUseMachine =
        (callee.type === "Identifier" && callee.name === "useMachine") ||
        (callee.type === "MemberExpression" && callee.property?.name === "useMachine")
      const first = n.arguments[0]
      const fromFirst = refPkg(first, "machine")
      if (fromFirst && (isUseMachine || n.type === "NewExpression")) {
        propsFromCall(fromFirst, n.arguments[1], n)
        return
      }
      const direct = n.type === "CallExpression" ? refPkg(callee, "machine") : null
      if (direct) propsFromCall(direct, first, n)
      else if (isAsyncListHook(n)) propsFromCall("async-list", first, n)
    }

    if (n.type === "MemberExpression" && !n.computed && n.object.type === "Identifier") {
      const pkg = namespaces.get(n.object.name)
      const renamed = pkg && EXPORT_RENAMES[pkg]?.find((r) => r.from === n.property.name)
      if (renamed) overwrite(n.property.start, n.property.end, renamed.to)
    }
    if (n.type === "TSQualifiedName" && n.left.type === "Identifier") {
      const pkg = namespaces.get(n.left.name)
      const renamed = pkg && EXPORT_RENAMES[pkg]?.find((r) => r.from === n.right.name)
      if (renamed) overwrite(n.right.start, n.right.end, renamed.to)
    }

    if (n.type === "VariableDeclarator" && n.id.typeAnnotation) {
      const pkg = typePkg(n.id.typeAnnotation, "Props")
      const obj = propsObject(n.init)
      if (pkg && obj) applyProps(pkg, obj)
    }
    if (
      (n.type === "TSSatisfiesExpression" || n.type === "TSAsExpression") &&
      n.expression.type === "ObjectExpression"
    ) {
      const pkg = typePkg(n.typeAnnotation, "Props")
      if (pkg) applyProps(pkg, n.expression)
    }
  })

  // ---------------------------------------------------------------------------
  // 4. api members and other call sites
  // ---------------------------------------------------------------------------

  const onlyMachine = pkgs.size === 1 ? [...pkgs][0] : null

  walk(ast.program, (n, parent) => {
    if ((n.type === "MemberExpression" || n.type === "OptionalMemberExpression") && !n.computed) {
      const name = n.property?.name
      if (!name) return
      const resolved = resolveReceiver(n.object)

      for (const removed of REMOVED_MEMBERS) {
        if (removed.name !== name) continue
        const inFile = removed.pkgs.some((p) => pkgs.has(p))
        const matches =
          (resolved && removed.pkgs.some((p) => resolved.has(p))) || (!resolved && inFile && apiLike(n.object))
        if (!matches) continue

        // popover always portals in v2: `api.portalled ? Portal : Fragment` -> `Portal`
        if (name === "portalled") {
          const done =
            parent?.type === "ConditionalExpression" && parent.test === n
              ? overwrite(parent.start, parent.end, src(parent.consequent))
              : parent?.type === "UnaryExpression" && parent.operator === "!"
                ? overwrite(parent.start, parent.end, "false")
                : overwrite(n.start, n.end, "true")
          if (done) continue
        }
        note(n, removed.message)
      }

      const rules = MEMBER_BY_NAME.get(name)
      if (!rules) return

      let rule: MemberRule | undefined
      if (resolved) {
        rule = rules.find((r) => r.pkgs.some((p) => resolved.has(p)))
        if (rule?.generic && resolved.size > 1) {
          note(n, `\`${name}\` may be the ${rule.pkgs.join("/")} api member renamed to \`${rule.to}\` in v2.`)
          return
        }
      } else {
        const candidate = rules.find((r) => r.unique || r.pkgs.some((p) => pkgs.has(p)))
        if (!candidate) return
        if (!candidate.generic) {
          rule = candidate
        } else if (onlyMachine && candidate.pkgs.includes(onlyMachine) && apiLike(n.object)) {
          rule = candidate
        } else if (
          candidate.from === "prev" &&
          pkgs.has("tour") &&
          n.object.type === "Identifier" &&
          n.object.name === "actions"
        ) {
          rule = candidate
        } else {
          if (candidate.pkgs.some((p) => pkgs.has(p))) {
            note(
              n,
              `\`${name}\` may be the ${candidate.pkgs.join("/")} api member renamed to \`${candidate.to}\` in v2.`,
            )
          }
          return
        }
      }
      if (!rule) return

      // v1 `sorting` is a boolean. Reading a property off it means this is
      // already the v2 sort descriptor, so leave it alone.
      const readsProperty =
        (parent?.type === "MemberExpression" || parent?.type === "OptionalMemberExpression") && parent.object === n
      if (rule.from === "sorting" && readsProperty) return

      overwrite(n.property.start, n.property.end, rule.to)

      const call = parent?.type === "CallExpression" && parent.callee === n ? parent : null
      if (!call) return
      if (rule.special === "clear-highlight" && call.arguments.length === 0) {
        insert(call.end - 1, "null")
      }
      if (rule.special === "indicator-expanded" || rule.special === "indicator-selected") {
        const type = rule.special === "indicator-expanded" ? "expanded" : "selected"
        const arg = call.arguments[0]
        if (!arg) insert(call.end - 1, `{ type: "${type}" }`)
        else if (arg.type === "ObjectExpression") {
          const last = arg.properties[arg.properties.length - 1]
          if (last) insert(last.end, `, type: "${type}"`)
          else overwrite(arg.start, arg.end, `{ type: "${type}" }`)
        } else overwrite(arg.start, arg.end, `{ ...${src(arg)}, type: "${type}" }`)
      }
      return
    }

    if (n.type !== "CallExpression") return
    const callee = n.callee
    const method = callee.type === "MemberExpression" && !callee.computed ? callee.property.name : null
    const arg0 = n.arguments[0]

    if (method === "matches" && pkgs.has("hover-card")) {
      for (const arg of n.arguments) {
        if (arg.type === "StringLiteral" && arg.value === "closing") {
          const quote = code[arg.start]
          overwrite(arg.start, arg.end, `${quote}open.closing${quote}`)
        }
      }
    }

    if (method === "getResizeTriggerProps" && pkgs.has("floating-panel")) {
      renameKeysIn(arg0, [{ from: "axis", to: "placement" }])
    }
    if (method === "getHandleProps" && pkgs.has("image-cropper")) {
      renameKeysIn(arg0, [{ from: "position", to: "placement" }])
    }

    if (callee.type === "Identifier" && callee.name === "trackDismissableElement") {
      const options = n.arguments[1]
      const hasLayerChange =
        options?.type === "ObjectExpression" && options.properties.some((p: Node) => keyName(p) === "onLayerChange")
      if (!hasLayerChange) {
        note(
          n,
          "@zag-js/dismissable: `trackDismissableElement` requires `onLayerChange`. Apply the emitted layer state.",
        )
      }
    }
  })

  // tour step actions: { action: "prev" } -> "previous"
  if (pkgs.has("tour")) {
    walk(ast.program, (n) => {
      if (
        n.type === "ObjectProperty" &&
        keyName(n) === "action" &&
        n.value?.type === "StringLiteral" &&
        n.value.value === "prev"
      ) {
        const quote = code[n.value.start]
        overwrite(n.value.start, n.value.end, `${quote}previous${quote}`)
      }
    })
  }

  // anatomy: parts.x.attrs is a function now
  walk(ast.program, (n, parent) => {
    if (n.type !== "MemberExpression" || n.computed || n.property?.name !== "attrs") return
    const owner = n.object
    const ownerName =
      owner.type === "MemberExpression" ? (owner.object.name ?? owner.object.property?.name) : owner.name
    if (!/parts$/i.test(ownerName ?? "")) return
    if (parent?.type === "CallExpression" && parent.callee === n) return
    note(n, "anatomy: `parts.x.attrs` is a function in v2. Call it with the machine id: `parts.x.attrs(scope.id)`.")
  })

  return { changes, notes, pkgs, imports, parsed: true }
}
