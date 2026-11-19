import { createNormalizer } from "@zag-js/types"
import { type MachineRecord, subscribeMachines } from "@zag-js/core"
import type { AgentDescriptor, AgentItem, Expected } from "./components"
import {
  buttonsIn,
  fillValue,
  fold,
  frames,
  sectionsOf,
  isOffLimits,
  isSecret,
  isShown,
  nameOf,
  REDACTED,
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

/** Decides a step: true runs it, false refuses it. A promise lets the app ask a person first. */
export type Allow = (action: AgentAction) => boolean | Promise<boolean>

/** For one `act` call, beside the bridge's own options, like a browser agent's rules from `registerTools`. */
export interface ActOptions {
  /** Asked for every step before it runs, and again when the button it presses is marked `data-agent-confirm`. */
  allow?: Allow | undefined
}

export interface CreateAgentOptions {
  /** Decides each press on an element marked `data-agent-confirm`. Without it those steps fail with "Needs a person". */
  allow?: Allow
  /**
   * The machines the bridge understands, like `[tabsAgent, selectAgent]`, or `allComponents` for every one this
   * package describes. Only these are bundled.
   */
  components: AgentDescriptor[]
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
  /** The state key its value had, like `value` or `checked`. */
  key: string
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
// A line in `added` lists a component's items when it has at most this many.
const lineItemLimit = 6

const limit = 100

// Hidden by a closed section a step can open, not by being off the page.
const hidesIn = (el: Element) => !!el.parentElement?.closest("[hidden][aria-labelledby]")

export function createAgent(options: CreateAgentOptions) {
  const descriptors = options.components
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

  // A menu's content, whose items belong to the menu, not the page. Other popups name theirs with `container`.
  const ownedSelector = "[data-menu-content]"
  // Zag marks each part with `data-<scope>-<part>="<machine id>"`, and gives the rest, like a hidden input, an id
  // that starts with the machine's.
  const isPart = (el: Element, ids: Set<string>) =>
    Array.from(el.attributes).some((attr) => attr.name.startsWith("data-") && ids.has(attr.value)) ||
    (!!el.id && [...ids].some((id) => el.id.startsWith(`${id}:`)))

  function scan(): Live[] {
    const found: Live[] = []
    // Popups' contents, like a dialog's or a popover's, whose fields and buttons belong to them.
    const owned: Element[] = []
    const isOwned = (el: Element) => !!el.closest(ownedSelector) || owned.some((container) => container.contains(el))
    for (const record of records) {
      const descriptor = descriptorOf(record)
      if (!descriptor) continue
      const scope = record.service.scope
      const el = descriptor.element(scope)
      if (!el || !el.isConnected || isOffLimits(el)) continue
      const api = apiOf(record, descriptor)
      const container = descriptor.container?.(scope)
      if (container) owned.push(container)
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
        state: descriptor.state(api, scope),
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
      if (isOffLimits(el) || isOwned(el)) continue
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
        state: { value: isSecret(el) ? REDACTED : el.value },
        actions: el.disabled || el.readOnly ? [] : ["setValue"],
      })
    }
    // Plain buttons, like a form's save.
    for (const el of doc.querySelectorAll<HTMLElement>("button")) {
      if (isPart(el, ids) || isOffLimits(el) || isOwned(el)) continue
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
      const valueKey = valueKeyOf(live)
      if (!valueKey) continue
      const key = keyOf(live)
      present.add(key)
      memory.set(key, { ...live, key: valueKey, value: live.state[valueKey] })
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

  // A name that starts with a closed section's, like "Email Deploy failures" with the Email accordion item closed:
  // open that section, so what it holds mounts and the name can find it. Only when one section matches.
  async function openSectionNamed(ref: string) {
    const words = wordsOf(ref)
    const matches = scan().flatMap((live) => {
      if (!live.descriptor?.openItem || !live.items) return []
      return live.items
        .filter((item) => {
          const label = wordsOf(item.label)
          return label.length > 0 && label.length < words.length && label.every((word, index) => words[index] === word)
        })
        .map((item) => ({ live, item }))
    })
    if (matches.length !== 1) return false
    const { live, item } = matches[0]
    live.descriptor!.openItem!(apiOf(live.record!, live.descriptor!), item.value)
    await frames()
    return true
  }

  const confirmOf = (el: Element) => el.closest("[data-agent-confirm]")?.getAttribute("data-agent-confirm") ?? undefined
  const actionOf = (step: AgentStep, live: Live, confirm?: string): AgentAction => ({
    ...step,
    args: step.args ?? [],
    component: live.kind,
    label: live.label,
    ...(confirm ? { confirm } : {}),
  })

  // A press on an element marked `data-agent-confirm` runs only when a person agrees: through the bridge's own
  // `allow`, or, when it has none, the caller's, which already answered for the step.
  async function confirmPress(target: Element, step: AgentStep, live: Live, extra: ActOptions) {
    const confirm = confirmOf(target)
    if (!confirm) return
    const action = actionOf(step, live, confirm)
    if (extra.allow && confirm !== confirmOf(live.el) && !(await extra.allow(action))) {
      throw new Error(`Not allowed: ${confirm}`)
    }
    const allowed = options.allow ? await options.allow(action) : !!extra.allow
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

  async function run(step: AgentStep, extra: ActOptions): Promise<Ran> {
    const action = step.action
    const args = step.args ?? []
    let live: Live
    try {
      live = find(scan(), step.ref, action)
    } catch (error) {
      if (!(await reopen(step.ref)) && !(await openSectionNamed(step.ref))) throw error
      const back = offPage().find((item) => item.ref === step.ref)
      live = find(scan(), back?.label ?? step.ref, action)
    }
    if (!live.shown) {
      await reveal(live.el)
      live = scan().find((next) => next.ref === live.ref) ?? live
    }
    if (extra.allow && !(await extra.allow(actionOf(step, live, confirmOf(live.el))))) {
      throw new Error(`Not allowed: ${action} on ${live.label ?? live.kind}`)
    }
    // What a secret field was given stays out of the result, like its value.
    const shownArgs = live.state.value === REDACTED ? [REDACTED] : args
    const what = `${action}${args.length ? ` ${JSON.stringify(shownArgs)}` : ""} on ${live.label ?? live.kind}`

    if (live.kind === "field") {
      if (action !== "setValue") throw new Error(`A field takes setValue, not ${action}.`)
      const value = String(args[0] ?? "")
      fillValue(live.el as HTMLInputElement, value)
      return { what, ref: live.ref, label: live.label, expected: { key: "value", value } }
    }
    if (live.kind === "button") {
      if (action !== "press") throw new Error(`A button takes press, not ${action}.`)
      await confirmPress(live.el, step, live, extra)
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
        await confirmPress(button, step, live, extra)
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
    // A secret field's value can't be read back, so there's nothing to compare.
    if (committed === REDACTED) return undefined
    const holds = expected.holds
      ? expected.holds(committed)
      : JSON.stringify(committed) === JSON.stringify(expected.value)
    if (holds) return undefined
    return { step: index, ref: ran.ref, label: ran.label, requested: expected.value, committed }
  }

  const keyOf = (live: Pick<Live, "in" | "label" | "kind">) => [...live.in, live.label ?? live.kind].join(" › ")
  // The state key that holds its value, if it has one.
  const valueKeyOf = (live: Live) => {
    const declared = live.descriptor?.value
    if (declared) return declared in live.state ? declared : undefined
    if ("value" in live.state) return "value"
    if ("checked" in live.state) return "checked"
    return undefined
  }

  const offPageEntry = (item: Remembered): AgentEntry => ({
    ref: item.ref,
    component: item.kind,
    actions: [],
    ...(item.label ? { label: item.label } : {}),
    ...(item.in.length ? { in: item.in } : {}),
    [item.key]: item.value,
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
      ...all.flatMap((live) => {
        const valueKey = valueKeyOf(live)
        return valueKey ? [[keyOf(live), live.state[valueKey]]] : []
      }),
    ])

  // One short line for a component that came onto the page, with what it offers when that's short, like
  // "c20 menu: Actions for Jane Doe [Make admin, Remove]", so a step can use it without a query first.
  const lineOf = (live: Live) => {
    const entry = entryOf(live)
    const items = entry.items && entry.items.length <= lineItemLimit ? entry.items.map((item) => item.label) : []
    const offers = [...items, ...(entry.buttons ?? [])]
    const list = offers.length ? ` [${offers.join(", ")}]` : ""
    return `${live.ref} ${live.kind}${live.label ? `: ${live.label}` : ""}${list}`
  }

  async function act(input: { steps: AgentStep[] }, extra: ActOptions = {}) {
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
        const ran = await run(step, extra)
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
