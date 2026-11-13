/**
 * Writes the logic of every machine in `packages/machines/*` as JSON (states and transitions),
 * plus a precomputed layout, which the docs draw as an SVG map.
 * Output: `website/public/machines/<name>.json` (one per `*.machine.ts` file).
 *
 * Run with `pnpm machine-logic` from `website/` after changing any machine.
 */
import {
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  rmSync,
} from "node:fs"
import ELK, {
  type ElkExtendedEdge,
  type ElkLabel,
  type ElkNode,
} from "elkjs/lib/elk.bundled.js"
import Module, { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

type AnyFn = (...args: any[]) => any

const scriptDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, "../..")
const machinesDir = join(rootDir, "packages/machines")
const outDir = join(rootDir, "website/public/machines")
const coreEntry = join(rootDir, "packages/core/src/index.ts")

// Swap `createGuards` for a version that tags composed guards with a readable label (e.g. `isOpen && !isDisabled`).
// tsx runs the machines as CommonJS, so the swap goes through the require cache.
const require = createRequire(join(rootDir, "packages/core/package.json"))
const core = require(coreEntry)
const SHIM_ID = join(rootDir, "packages/core/src/__diagram-shim__.js")

type Guard = string | (AnyFn & { __label?: string })
const label = (g: Guard) =>
  typeof g === "string" ? g : (g?.__label ?? (g?.name || "guard"))
const wrap = (g: Guard) =>
  typeof g === "function" && /&&|\|\|/.test(g.__label ?? "")
    ? `(${g.__label})`
    : label(g)
const tag = (fn: AnyFn, text: string) => Object.assign(fn, { __label: text })
function createGuards() {
  return {
    and: (...gs: Guard[]) =>
      tag((p: any) => gs.every((g) => p.guard(g)), gs.map(wrap).join(" && ")),
    or: (...gs: Guard[]) =>
      tag((p: any) => gs.some((g) => p.guard(g)), gs.map(wrap).join(" || ")),
    not: (g: Guard) => tag((p: any) => !p.guard(g), `!${wrap(g)}`),
  }
}
const shim = new Module(SHIM_ID)
shim.filename = SHIM_ID
shim.loaded = true
shim.exports = {
  ...core,
  createGuards,
  setup: () => ({ ...core.setup(), guards: createGuards() }),
}
;(Module as any)._cache[SHIM_ID] = shim
const resolveFilename = (Module as any)._resolveFilename
;(Module as any)._resolveFilename = function (
  request: string,
  ...rest: unknown[]
) {
  if (request === "@zag-js/core") return SHIM_ID
  return resolveFilename.call(this, request, ...rest)
}

interface TransitionConfig {
  target?: string
  guard?: string | (AnyFn & { __label?: string })
}
type TransitionValue = TransitionConfig | TransitionConfig[] | undefined
interface StateConfig {
  id?: string
  initial?: string
  states?: Record<string, StateConfig | undefined>
  on?: Record<string, TransitionValue>
}
interface MachineConfig {
  initialState: AnyFn
  on?: Record<string, TransitionValue>
  states: Record<string, StateConfig | undefined>
}

const ROOT = "__any__"

interface JsonTransition {
  from: string
  to: string | null
  event: string
  guard: string | null
}
interface MachineLayout {
  width: number
  height: number
  states: Record<string, { x: number; y: number; w: number; h: number }>
  edges: {
    from: string
    to: string
    events: string[]
    lines: string[]
    points: [number, number][]
    label: { x: number; y: number; w: number; h: number } | null
  }[]
}

interface MachineJson {
  /** the same graph laid out both ways; the docs pick whichever fits the dialog best */
  layouts?: { right: MachineLayout; down: MachineLayout }
  id: string
  initial: string
  states: Array<{
    id: string
    label: string
    parent: string | null
    initial: boolean
  }>
  transitions: JsonTransition[]
}

function isMachine(value: unknown): value is MachineConfig {
  return (
    !!value &&
    typeof value === "object" &&
    "states" in value &&
    "initialState" in value
  )
}

function guardLabel(guard: TransitionConfig["guard"]) {
  if (!guard) return ""
  if (typeof guard === "string") return guard
  return guard.__label ?? (guard.name || "guard")
}

/** Mermaid ids: prefix to dodge reserved words, replace anything non-alphanumeric */
function toArray(value: TransitionValue): TransitionConfig[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function generate(name: string, machine: MachineConfig) {
  const parents = new Map<string, string | undefined>()
  const states = new Map<string, StateConfig>()
  const ids = new Map<string, string>()

  const visit = (
    path: string,
    state: StateConfig,
    parent: string | undefined,
  ) => {
    states.set(path, state)
    parents.set(path, parent)
    if (state.id) ids.set(state.id, path)
    for (const [key, child] of Object.entries(state.states ?? {})) {
      if (child) visit(`${path}.${key}`, child, path)
    }
  }
  for (const [key, state] of Object.entries(machine.states)) {
    if (state) visit(key, state, undefined)
  }

  const resolveTarget = (
    target: string,
    source: string,
  ): string | undefined => {
    if (target.startsWith("#")) return ids.get(target.slice(1))
    const from = source === ROOT ? "" : source
    if (target.startsWith("."))
      return states.has(from + target) ? from + target : undefined
    if (target.includes(".")) return states.has(target) ? target : undefined
    // Bare name: sibling first, walking up through ancestors
    let scope = parents.get(from)
    while (scope) {
      const candidate = `${scope}.${target}`
      if (states.has(candidate)) return candidate
      scope = parents.get(scope)
    }
    return states.has(target) ? target : undefined
  }

  let initial: string | undefined
  try {
    initial = machine.initialState({
      prop: () => undefined,
      context: { get: () => undefined },
    })
  } catch {}
  if (!initial || !states.has(initial)) initial = Object.keys(machine.states)[0]

  // one entry per branch, in config order (guard priority)
  const flat: JsonTransition[] = []
  const seen = new Set<string>()

  const addTransitions = (
    source: string,
    on: StateConfig["on"],
    jsonSource = source,
  ) => {
    for (const [event, value] of Object.entries(on ?? {})) {
      for (const transition of toArray(value)) {
        const target = transition.target
          ? resolveTarget(transition.target, source)
          : undefined
        if (transition.target && !target) {
          console.warn(
            `  unresolved target "${transition.target}" from "${source}" on ${event}`,
          )
        }
        const entry = {
          from: jsonSource,
          to: target ?? null,
          event,
          guard: guardLabel(transition.guard) || null,
        }
        const key = JSON.stringify(entry)
        if (!seen.has(key)) {
          seen.add(key)
          flat.push(entry)
        }
      }
    }
  }

  addTransitions(ROOT, machine.on, "*")
  for (const [path, state] of states) addTransitions(path, state.on)

  const initialTop = initial.split(".")[0]
  const json: MachineJson = {
    id: name,
    initial: initialTop,
    states: [...states].map(([path, _state]) => {
      const parent = parents.get(path)
      const isInitial = parent
        ? states.get(parent)!.initial === path.slice(parent.length + 1)
        : path === initialTop
      return {
        id: path,
        label: path.split(".").pop()!,
        parent: parent ?? null,
        initial: isInitial,
      }
    }),
    // Stable sort keeps config order among same from/event (guard priority)
    transitions: flat.sort(
      (a, b) => cmp(a.from, b.from) || cmp(a.event, b.event),
    ),
  }

  return json
}

/* -----------------------------------------------------------------------------
 * Layout: computed here with ELK so the docs draw plain SVG with no layout library
 * -----------------------------------------------------------------------------*/

const elk = new ELK()

// mono text in the docs renders about this wide per character
const CHAR = 7.6
const LABEL_CHAR = 6.6
const NODE_H = 44
const LABEL_LINE = 16
const MAX_LABEL_LINES = 3

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "110",
  "elk.spacing.nodeNode": "56",
  "elk.spacing.edgeEdge": "16",
  "elk.spacing.edgeNode": "24",
  "elk.spacing.edgeLabel": "6",
  "elk.layered.spacing.edgeNodeBetweenLayers": "26",
  "elk.edgeLabels.placement": "CENTER",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.padding": "[top=32,left=48,bottom=32,right=32]",
  // edges between nested states otherwise come back relative to their container
  "elk.json.edgeCoords": "ROOT",
}

const round = (value = 0) => Math.round(value)

function labelLines(events: string[]) {
  return events.length > MAX_LABEL_LINES
    ? [
        ...events.slice(0, MAX_LABEL_LINES),
        `+${events.length - MAX_LABEL_LINES} more`,
      ]
    : events
}

async function computeLayout(
  json: MachineJson,
  direction: "RIGHT" | "DOWN",
): Promise<MachineLayout> {
  const childrenOf = (parent: string | null) =>
    json.states.filter((state) => state.parent === parent)

  const toElk = (id: string, label: string): ElkNode => {
    const kids = childrenOf(id)
    if (!kids.length)
      return { id, width: round(label.length * CHAR + 48), height: NODE_H }
    return {
      id,
      layoutOptions: { "elk.padding": "[top=44,left=24,bottom=24,right=24]" },
      children: kids.map((kid) => toElk(kid.id, kid.label)),
    }
  }

  // one edge per source/target pair, listing every event between them
  const pairs = new Map<
    string,
    { from: string; to: string; events: string[] }
  >()
  for (const t of json.transitions) {
    if (!t.to || t.from === "*" || t.to === t.from) continue
    const key = `${t.from}->${t.to}`
    const pair = pairs.get(key) ?? { from: t.from, to: t.to, events: [] }
    if (!pair.events.includes(t.event)) pair.events.push(t.event)
    pairs.set(key, pair)
  }

  const root: ElkNode = await elk.layout({
    id: "root",
    layoutOptions: { ...layoutOptions, "elk.direction": direction },
    children: childrenOf(null).map((state) => toElk(state.id, state.label)),
    edges: [...pairs].map(([id, pair]) => {
      const lines = labelLines(pair.events)
      return {
        id,
        sources: [pair.from],
        targets: [pair.to],
        labels: [
          {
            text: lines.join("\n"),
            width: round(
              Math.max(...lines.map((line) => line.length)) * LABEL_CHAR + 16,
            ),
            height: lines.length * LABEL_LINE + 8,
          },
        ],
      }
    }),
  })

  // elk positions children relative to their parent; the docs want page coordinates
  const states: MachineLayout["states"] = {}
  const walk = (node: ElkNode, ox: number, oy: number) => {
    for (const child of node.children ?? []) {
      const x = ox + (child.x ?? 0)
      const y = oy + (child.y ?? 0)
      states[child.id] = {
        x: round(x),
        y: round(y),
        w: round(child.width),
        h: round(child.height),
      }
      walk(child, x, y)
    }
  }
  walk(root, 0, 0)

  const edges = ((root.edges ?? []) as ElkExtendedEdge[]).map((edge) => {
    const pair = pairs.get(edge.id)!
    const section = edge.sections?.[0]
    const points = section
      ? [
          section.startPoint,
          ...(section.bendPoints ?? []),
          section.endPoint,
        ].map((p) => [round(p.x), round(p.y)] as [number, number])
      : []
    const label = edge.labels?.[0] as ElkLabel | undefined
    return {
      from: pair.from,
      to: pair.to,
      events: pair.events,
      lines: labelLines(pair.events),
      points,
      label: label
        ? {
            x: round(label.x),
            y: round(label.y),
            w: round(label.width),
            h: round(label.height),
          }
        : null,
    }
  })

  return { width: round(root.width), height: round(root.height), states, edges }
}

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

async function main() {
  mkdirSync(outDir, { recursive: true })
  for (const file of readdirSync(outDir)) {
    if (file.endsWith(".mmd") || file.endsWith(".json"))
      rmSync(join(outDir, file))
  }

  const dirs = readdirSync(machinesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  const written: string[] = []
  const failed: string[] = []

  for (const dir of dirs) {
    const srcDir = join(machinesDir, dir, "src")
    if (!existsSync(srcDir)) continue
    const files = readdirSync(srcDir)
      .filter((f) => f.endsWith(".machine.ts"))
      .sort()
    for (const file of files) {
      const name = file.replace(/\.machine\.ts$/, "")
      try {
        const mod = await import(pathToFileURL(join(srcDir, file)).href)
        const machine = Object.values(mod).find(isMachine)
        if (!machine) throw new Error("no machine export")
        const json = generate(name, machine)
        json.layouts = {
          right: await computeLayout(json, "RIGHT"),
          down: await computeLayout(json, "DOWN"),
        }
        writeFileSync(
          join(outDir, `${name}.json`),
          JSON.stringify(json, null, 2) + "\n",
        )
        written.push(name)
      } catch (error) {
        failed.push(name)
        console.error(`✗ ${name}: ${(error as Error).message}`)
      }
    }
  }

  console.log(`Wrote ${written.length} machines to ${outDir}`)
  if (failed.length) {
    console.error(`Failed: ${failed.join(", ")}`)
    process.exitCode = 1
  }
}

main()
