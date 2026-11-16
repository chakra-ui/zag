import { createNormalizer } from "@zag-js/types"
import { type MachineRecord, subscribeMachines } from "@zag-js/core"
import { type AgentDescriptor, type AgentItem, defaultDescriptors, type Expected } from "./components"
import {
  buttonsIn,
  fillValue,
  fold,
  frames,
  sectionsOf,
  isOffLimits,
  isShown,
  nameOf,
  rowOf,
  textOf,
  wordsOf,
} from "./dom"

/** One component as an agent sees it. */
export interface AgentEntry {
  ref: string
  component: string
  label?: string | undefined
  row?: string | undefined
  /** The sections that hold it, like a tab and an accordion item. */
  in?: string[] | undefined
  /** True when a closed section hides it. A step on it opens the section. */
  hidden?: boolean | undefined
  /** True for a component that left the page with its closed section, with the value it had. A step on it opens the section. */
  offPage?: boolean | undefined
  items?: AgentItem[] | undefined
  text?: string[] | undefined
  buttons?: string[] | undefined
  confirm?: string | undefined
  actions: string[]
  [state: string]: unknown
}

/** A step whose value the app refused or changed: what it asked for and what the page kept. */
export interface AgentRejection {
  step: number
  ref: string
  label?: string | undefined
  requested: unknown
  committed: unknown
}

export interface AgentStep {
  ref: string
  action: string
  args?: unknown[]
}

/** A step the agent asks to run, for `allow` to decide. */
export interface AgentAction extends AgentStep {
  component: string
  label?: string | undefined
  /** What `data-agent-confirm` says the step does, when a person must approve it. */
  confirm?: string | undefined
}

export interface CreateAgentOptions {
  /** Decides each press on an element marked `data-agent-confirm`. Without it those steps fail with "Needs a person". */
  allow?: (action: AgentAction) => boolean | Promise<boolean>
  /** The machines the bridge understands. Defaults to the ones this package ships. */
  descriptors?: AgentDescriptor[]
}

// The bridge reads api methods only, so props are passed through untouched.
const normalize = createNormalizer((props) => props)

// What every component on the page is, read fresh on each call.
interface Live {
  ref: string
  kind: string
  el: HTMLElement
  shown: boolean
  label?: string | undefined
  row?: string | undefined
  in: string[]
  /** The tab panel or accordion item it sits in, if any. */
  section: Element | null
  state: Record<string, unknown>
  items?: AgentItem[] | undefined
  descriptor?: AgentDescriptor | undefined
  record?: MachineRecord | undefined
  actions: string[]
}

// A component with a value that left the page with its closed section, as it last was.
interface Remembered {
  ref: string
  kind: string
  label?: string | undefined
  in: string[]
  value: unknown
  el: Element
  section: Element | null
}

const sectionSelector = "[role='tabpanel'][aria-labelledby], [role='region'][aria-labelledby]"
const sectionOf = (el: Element) => el.parentElement?.closest(sectionSelector) ?? null
// It left because its section closed and unmounted, not because the app removed it.
const leftWithSection = (item: { section: Element | null }) => !!item.section && !item.section.isConnected
// At most this many components that came onto the page are listed by name after an act.
const addedLimit = 30

const limit = 100

// Hidden by a closed section a step can open, not by being off the page.
const hidesIn = (el: Element) => !!el.parentElement?.closest("[hidden][aria-labelledby]")

export function createAgent(options: CreateAgentOptions = {}) {
  const descriptors = options.descriptors ?? defaultDescriptors
  const records = new Set<MachineRecord>()
  subscribeMachines((record, mounted) => {
    if (mounted) records.add(record)
    else records.delete(record)
  })

  // Refs stay the same while an element stays on the page.
  const refs = new WeakMap<object, string>()
  let nextRef = 0
  const refOf = (key: object) => {
    let ref = refs.get(key)
    if (!ref) {
      ref = `c${++nextRef}`
      refs.set(key, ref)
    }
    return ref
  }

  const descriptorOf = (record: MachineRecord) => descriptors.find((d) => d.machine === record.machine)
  const apiOf = (record: MachineRecord, descriptor: AgentDescriptor) => descriptor.connect(record.service, normalize)

  // Elements owned by a machine's popup, whose buttons belong to it, not the page.
  const ownedSelector = "[data-dialog-content], [data-menu-content]"
  // Zag marks each part with `data-<scope>-<part>="<machine id>"`.
  const isPart = (el: Element, ids: Set<string>) =>
    Array.from(el.attributes).some((attr) => attr.name.startsWith("data-") && ids.has(attr.value))

  function scan(): Live[] {
    const found: Live[] = []
    for (const record of records) {
      const descriptor = descriptorOf(record)
      if (!descriptor) continue
      const scope = record.service.scope
      const el = descriptor.element(scope)
      if (!el || !el.isConnected || isOffLimits(el)) continue
      const api = apiOf(record, descriptor)
      const label = descriptor.name?.(scope, api) ?? nameOf(el, false)
      found.push({
        ref: refOf(record),
        kind: descriptor.kind,
        el,
        shown: isShown(el),
        label,
        row: rowOf(el, label),
        in: sectionsOf(el),
        section: sectionOf(el),
        state: descriptor.state(api),
        items: descriptor.items?.(api, scope),
        descriptor,
        record,
        actions: Object.keys(descriptor.actions),
      })
    }
    const doc = globalThis.document
    const ids = new Set(Array.from(records, (record) => record.service.scope.id).filter(Boolean) as string[])
    // Plain text fields, which Zag leaves to the page.
    for (const el of doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")) {
      if (isPart(el, ids) || el.type === "hidden" || el.type === "checkbox" || el.type === "radio") continue
      if (isOffLimits(el) || el.closest(ownedSelector)) continue
      const label = nameOf(el)
      found.push({
        ref: refOf(el),
        kind: "field",
        el,
        shown: isShown(el),
        label,
        row: rowOf(el, label),
        in: sectionsOf(el),
        section: sectionOf(el),
        state: { value: el.closest("[data-agent-secret]") || el.type === "password" ? "[redacted]" : el.value },
        actions: el.disabled || el.readOnly ? [] : ["setValue"],
      })
    }
    // Plain buttons, like a form's save.
    for (const el of doc.querySelectorAll<HTMLElement>("button")) {
      if (isPart(el, ids) || isOffLimits(el) || el.closest(ownedSelector)) continue
      const label = nameOf(el)
      found.push({
        ref: refOf(el),
        kind: "button",
        el,
        shown: isShown(el),
        label,
        row: rowOf(el, label),
        in: sectionsOf(el),
        section: sectionOf(el),
        state: {},
        actions: el.hasAttribute("disabled") ? [] : ["press"],
      })
    }
    // On the page, or one step away behind a closed section.
    const result = found.filter((live) => live.shown || hidesIn(live.el))
    remember(result)
    return result
  }

  // Values of components whose section closed and unmounted, by key, so a result still has them.
  const memory = new Map<string, Remembered>()
  function remember(result: Live[]) {
    const present = new Set<string>()
    for (const live of result) {
      if (!hasValue(live)) continue
      const key = keyOf(live)
      present.add(key)
      memory.set(key, { ...live, value: valueOf(live) })
    }
    for (const [key, item] of memory) {
      if (!present.has(key) && !leftWithSection(item)) memory.delete(key)
    }
  }
  const offPage = () => [...memory.values()].filter((item) => !item.el.isConnected)

  function entryOf(live: Live): AgentEntry {
    const entry: AgentEntry = { ref: live.ref, component: live.kind, actions: live.actions }
    if (live.label) entry.label = live.label
    if (live.row) entry.row = live.row
    if (live.in.length) entry.in = live.in
    if (!live.shown) entry.hidden = true
    Object.assign(entry, live.state)
    if (live.items?.length && live.items.length <= 10) entry.items = live.items
    if (live.descriptor && live.record) {
      const scope = live.record.service.scope
      const text = live.descriptor.text?.(scope)
      if (text?.length) entry.text = text
      const container = live.descriptor.container?.(scope)
      const buttons = buttonsIn(container).map((el) => nameOf(el) ?? "")
      if (buttons.length) entry.buttons = buttons
    }
    const confirm = live.el.closest("[data-agent-confirm]")?.getAttribute("data-agent-confirm")
    if (confirm) entry.confirm = confirm
    return entry
  }

  const wordsOfLive = (live: Live) => wordsOf([live.label, live.row, ...live.in].filter(Boolean).join(" "))

  // A component by ref, by the words of its label, row or section, by an item it offers, or by its kind.
  function find(all: Live[], ref: string, action: string): Live {
    const byRef = all.find((live) => live.ref === ref)
    if (byRef) return byRef
    const words = wordsOf(ref)
    const needle = fold(ref.trim())
    const tiers = [
      all.filter((live) => words.length > 0 && words.every((word) => wordsOfLive(live).includes(word))),
      all.filter((live) => live.items?.some((item) => fold(item.label) === needle || fold(item.value) === needle)),
      all.filter((live) => fold(live.kind) === needle),
    ]
    for (const near of tiers) {
      if (near.length === 0) continue
      if (near.length === 1) return near[0]
      const able = near.filter((live) => live.actions.includes(action))
      if (able.length === 1) return able[0]
      const shown = (able.length ? able : near).filter((live) => live.shown)
      if (shown.length === 1) return shown[0]
      const which = (able.length ? able : near)
        .map((live) => `${live.ref} (${[live.kind, live.label, ...live.in].filter(Boolean).join(", ")})`)
        .join("; ")
      throw new Error(`"${ref}" matches more than one component: ${which}. Use a ref.`)
    }
    const labels = all
      .map((live) => live.label)
      .filter(Boolean)
      .slice(0, 40)
    // A closed tab or accordion item may hold it, unmounted, where nothing can find it yet.
    const sections = all
      .filter((live) => live.descriptor?.reveal && live.items?.length)
      .map((live) => `${live.label ?? live.kind} (${live.ref}): ${live.items!.map((item) => item.label).join(", ")}`)
    const behind = sections.length
      ? ` It may be behind one of these, which a step can open first: ${sections.join("; ")}.`
      : ""
    throw new Error(`Nothing named "${ref}". On the page: ${labels.join(", ")}.${behind}`)
  }

  // A remembered component whose section unmounted: open its sections, outermost first, so it mounts again.
  async function reopen(ref: string) {
    const words = wordsOf(ref)
    const matches = offPage().filter(
      (item) =>
        item.ref === ref ||
        (words.length > 0 &&
          words.every((word) => wordsOf([item.label, ...item.in].filter(Boolean).join(" ")).includes(word))),
    )
    if (matches.length !== 1) return false
    for (const section of matches[0].in) {
      const owner = scan().find(
        (live) => live.descriptor?.openItem && live.items?.some((item) => fold(item.label) === fold(section)),
      )
      if (!owner) continue
      const item = owner.items!.find((candidate) => fold(candidate.label) === fold(section))!
      owner.descriptor!.openItem!(apiOf(owner.record!, owner.descriptor!), item.value)
      await frames()
    }
    return true
  }

  async function confirmPress(target: Element, step: AgentStep, live: Live) {
    const confirm = target.closest("[data-agent-confirm]")?.getAttribute("data-agent-confirm") ?? undefined
    if (!confirm) return
    const allowed = await options.allow?.({
      ...step,
      args: step.args ?? [],
      component: live.kind,
      label: live.label,
      confirm,
    })
    if (!allowed) throw new Error(`Needs a person: ${confirm}`)
  }

  // Opens the closed tabs or accordion items that hold the element, outermost first.
  async function reveal(el: Element) {
    for (let tries = 0; tries < 4 && !isShown(el); tries++) {
      let opened = false
      for (const record of records) {
        const descriptor = descriptorOf(record)
        if (descriptor?.reveal?.(apiOf(record, descriptor), record.service.scope, el)) opened = true
      }
      if (!opened) break
      await frames()
    }
  }

  // What a step did, and what it asked for when it set a value, so `act` can check the page kept it.
  interface Ran {
    what: string
    ref: string
    label?: string | undefined
    expected?: Expected | void
  }

  async function run(step: AgentStep): Promise<Ran> {
    const action = step.action
    const args = step.args ?? []
    let live: Live
    try {
      live = find(scan(), step.ref, action)
    } catch (error) {
      if (!(await reopen(step.ref))) throw error
      const back = offPage().find((item) => item.ref === step.ref)
      live = find(scan(), back?.label ?? step.ref, action)
    }
    if (!live.shown) {
      await reveal(live.el)
      live = scan().find((next) => next.ref === live.ref) ?? live
    }
    const what = `${action}${args.length ? ` ${JSON.stringify(args)}` : ""} on ${live.label ?? live.kind}`

    if (live.kind === "field") {
      if (action !== "setValue") throw new Error(`A field takes setValue, not ${action}.`)
      const value = String(args[0] ?? "")
      fillValue(live.el as HTMLInputElement, value)
      return { what, ref: live.ref, label: live.label, expected: { key: "value", value } }
    }
    if (live.kind === "button") {
      if (action !== "press") throw new Error(`A button takes press, not ${action}.`)
      await confirmPress(live.el, step, live)
      live.el.click()
      return { what, ref: live.ref, label: live.label }
    }

    const descriptor = live.descriptor!
    const record = live.record!
    const scope = record.service.scope
    // open and close stand in for setOpen on components without their own, like a menu.
    const viaSetOpen = !descriptor.actions[action] && (action === "open" || action === "close")
    const handler = viaSetOpen ? descriptor.actions.setOpen : descriptor.actions[action]
    if (!handler) throw new Error(`${descriptor.kind} takes ${live.actions.join(", ")}, not ${action}.`)
    const items = () => descriptor.items?.(apiOf(record, descriptor), scope) ?? []
    const expected = await handler({
      api: () => apiOf(record, descriptor),
      scope,
      args: viaSetOpen ? [action === "open"] : args,
      item(arg) {
        const wanted = fold(String(arg ?? ""))
        const match = items().find((item) => fold(item.value) === wanted || fold(item.label) === wanted)
        if (!match) {
          throw new Error(
            `No item "${String(arg)}". Items: ${items()
              .map((item) => item.label)
              .join(", ")}.`,
          )
        }
        return match
      },
      async press(button) {
        await confirmPress(button, step, live)
        button.click()
      },
    })
    return { what, ref: live.ref, label: live.label, expected }
  }

  // The step's value against what the page kept, once the app answered. A component that left the page, like a
  // dialog that unmounts as it closes, has nothing left to compare.
  function rejectionOf(index: number, ran: Ran, now: Live[]): AgentRejection | undefined {
    const expected = ran.expected
    if (!expected) return undefined
    const live = now.find((next) => next.ref === ran.ref)
    if (!live || !(expected.key in live.state)) return undefined
    const committed = live.state[expected.key]
    const holds = expected.holds
      ? expected.holds(committed)
      : JSON.stringify(committed) === JSON.stringify(expected.value)
    if (holds) return undefined
    return { step: index, ref: ran.ref, label: ran.label, requested: expected.value, committed }
  }

  const keyOf = (live: Pick<Live, "in" | "label" | "kind">) => [...live.in, live.label ?? live.kind].join(" › ")
  const valueOf = (live: Live) => ("value" in live.state ? live.state.value : live.state.checked)
  const hasValue = (live: Live) => "value" in live.state || "checked" in live.state

  const offPageEntry = (item: Remembered): AgentEntry => ({
    ref: item.ref,
    component: item.kind,
    actions: [],
    ...(item.label ? { label: item.label } : {}),
    ...(item.in.length ? { in: item.in } : {}),
    [item.kind === "switch" || item.kind === "checkbox" ? "checked" : "value"]: item.value,
    offPage: true,
  })

  function snapshot(): AgentEntry[] {
    const all = scan()
    const entries = [...all.map(entryOf), ...offPage().map(offPageEntry)]
    const total = entries.length
    entries.splice(limit)
    if (total > limit) {
      entries.push({
        ref: "more",
        component: "more",
        actions: [],
        text: [`${total - limit} more components. Use query to find them.`],
      })
    }
    return entries
  }

  function query(input: { text?: string; within?: string; kind?: string } = {}) {
    const all = scan()
    if (input.within) {
      try {
        const live = find(all, input.within, "")
        const words = wordsOf(input.text ?? "")
        const items = (live.items ?? []).filter((item) => words.every((word) => wordsOf(item.label).includes(word)))
        return { ref: live.ref, label: live.label, items: items.slice(0, 50) }
      } catch (error) {
        return { error: String((error as Error).message) }
      }
    }
    const words = wordsOf(input.text ?? "")
    return all
      .filter((live) => !input.kind || fold(live.kind) === fold(input.kind))
      .filter(
        (live) =>
          words.every((word) => wordsOfLive(live).includes(word)) ||
          live.items?.some((item) => words.every((word) => wordsOf(item.label).includes(word))),
      )
      .slice(0, 50)
      .map(entryOf)
  }

  // Every field's value, including ones that left the page with a closed section.
  const valuesOf = (all: Live[]) =>
    Object.fromEntries([
      ...offPage().map((item) => [keyOf(item), item.value]),
      ...all.filter(hasValue).map((live) => [keyOf(live), valueOf(live)]),
    ])

  // One short line for a component that came onto the page, like "c20 menu: Actions for Jane Doe".
  const lineOf = (live: Live) => {
    const entry = entryOf(live)
    const buttons = entry.buttons?.length ? ` [${entry.buttons.join(", ")}]` : ""
    return `${live.ref} ${live.kind}${live.label ? `: ${live.label}` : ""}${buttons}`
  }

  async function act(input: { steps: AgentStep[] }) {
    const beforeAll = scan()
    const before = new Map(beforeAll.map((live) => [live.ref, live]))
    const valuesBefore = valuesOf(beforeAll)
    const done: string[] = []
    const rejected: AgentRejection[] = []
    const removed: string[] = []
    const rows: Record<string, string> = {}
    let error: { step: number; message: string } | undefined
    // Compared after every step, so a row deleted on a tab a later step closes is still reported.
    let previous = beforeAll
    const compare = (now: Live[]) => {
      const byRef = new Map(now.map((live) => [live.ref, live]))
      for (const live of previous) {
        const next = byRef.get(live.ref)
        // Gone while its section stayed, like a deleted row. A closed tab's fields aren't removed.
        if (!next && !leftWithSection(live)) removed.push(live.label ?? live.kind)
        // Text on its row changed, like a member's role.
        if (next?.row && live.row && next.row !== live.row) rows[next.label ?? next.ref] = next.row
      }
      previous = now
    }
    for (const [index, step] of (input.steps ?? []).entries()) {
      try {
        const ran = await run(step)
        done.push(ran.what)
        await frames()
        const now = scan()
        // A refused value doesn't stop the steps after it: they rarely depend on it, and one call reports them all.
        const rejection = rejectionOf(index, ran, now)
        if (rejection) rejected.push(rejection)
        compare(now)
      } catch (caught) {
        error = { step: index, message: String((caught as Error)?.message ?? caught) }
        break
      }
    }
    await frames()
    const after = scan()
    compare(after)
    const values = valuesOf(after)
    const changed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(values)) {
      if (key in valuesBefore && JSON.stringify(valuesBefore[key]) !== JSON.stringify(value)) changed[key] = value
    }
    const fresh = after.filter((live) => !before.has(live.ref))
    const added = fresh.slice(0, addedLimit).map(lineOf)
    if (fresh.length > addedLimit) added.push(`and ${fresh.length - addedLimit} more: use query to find them`)
    return {
      ok: !error && rejected.length === 0,
      done,
      ...(error ? { error } : {}),
      ...(rejected.length ? { rejected } : {}),
      changed,
      ...(Object.keys(rows).length ? { rows } : {}),
      ...(removed.length ? { removed } : {}),
      ...(added.length ? { added } : {}),
      values,
    }
  }

  return { snapshot, query, act }
}

export type Agent = ReturnType<typeof createAgent>

export { textOf }
