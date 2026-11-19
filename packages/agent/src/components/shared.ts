import type { Machine, Scope, Service } from "@zag-js/core"
import { buttonsIn, isShown, nameOf, textOf } from "../dom"

export interface AgentItem {
  value: string
  label: string
}

/**
 * What a step asked for, which an action returns so `act` can check the page kept it: the state key it sets, the
 * value it asked for, and, when the value alone can't say, whether a committed value counts, like an accordion
 * section that's open among others.
 */
export interface Expected {
  key: string
  value: unknown
  holds?: (committed: unknown) => boolean
}

export interface ActionContext<Api = any> {
  api: () => Api
  scope: Scope
  args: unknown[]
  /** Finds one of the component's items by its value or label, or throws with the ones there are. */
  item: (arg: unknown) => AgentItem
  /** Presses a button, after `allow` agrees when it's marked `data-agent-confirm`. */
  press: (button: HTMLElement) => Promise<void>
}

/**
 * What the bridge needs to know about one machine: how to read it and which of
 * its api methods an agent may call.
 */
export interface AgentDescriptor<Api = any> {
  kind: string
  machine: Machine<any>
  connect: (service: Service<any>, normalize: any) => Api
  /** The element that names the component and decides whether it's on the page. */
  element: (scope: Scope) => HTMLElement | null
  name?: (scope: Scope, api: Api) => string | undefined
  state: (api: Api, scope: Scope) => Record<string, unknown>
  /**
   * The state key that holds its value, which `act` reports in `values` and remembers when its section unmounts.
   * Defaults to `value`, or `checked` when there's no `value`. A component with neither, like a dialog, has none.
   */
  value?: string
  items?: (api: Api, scope: Scope) => AgentItem[]
  /** Text it shows, like a dialog's title and description. */
  text?: (scope: Scope) => string[]
  /** The element whose buttons belong to it, like a dialog's content. */
  container?: (scope: Scope) => HTMLElement | null
  /** Returns what the step asked for, when it sets a value, so `act` can tell a change the app refused. */
  actions: Record<string, (context: ActionContext<Api>) => Expected | void | Promise<Expected | void>>
  /** Opens one of its sections by value, like a tab or accordion item, for a component that unmounted with it. */
  openItem?: (api: Api, value: string) => void
  /** Opens what hides `target`, like its tab or accordion item. Returns true when it did. */
  reveal?: (api: Api, scope: Scope, target: Element) => boolean
}

/** Types a component description and returns it, for describing your own machines to the bridge. */
export function defineAgentComponent<Api>(descriptor: AgentDescriptor<Api>): AgentDescriptor<Api> {
  return descriptor
}

export const byId = (scope: Scope, id: string) => scope.getById(id)

// Zag marks each part with `data-<scope>-<part>="<machine id>"`, like `data-tabs-list`.
export const partOf = (scope: Scope, part: string) => scope.query(`[data-${part}="${CSS.escape(scope.id ?? "")}"]`)
export const partsOf = (scope: Scope, part: string) => scope.queryAll(`[data-${part}="${CSS.escape(scope.id ?? "")}"]`)

// A tab list's or accordion's sections, from their triggers.
export function sectionsOf(scope: Scope, part: string): AgentItem[] {
  return partsOf(scope, part).map((el) => ({
    value: el.dataset.value ?? el.id.slice(el.id.lastIndexOf(":") + 1),
    label: textOf(el),
  }))
}

export function sectionHolding(scope: Scope, target: Element) {
  const prefix = `${scope.id}:content:`
  let node: Element | null = target
  while (node) {
    if (node.id.startsWith(prefix)) return node.id.slice(prefix.length)
    node = node.parentElement
  }
  return null
}

export const toBoolean = (value: unknown) => value !== false && value !== "false" && value !== "off"

export function toNumber(value: unknown): number {
  const number = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""))
  if (Number.isNaN(number)) throw new Error(`"${String(value)}" isn't a number.`)
  return number
}

// A step may pass a list as one array argument or as several arguments.
export const toList = (args: unknown[]) => args.flat().map((arg) => String(arg))

interface Part {
  attr: string
}

/** One of the component's parts, from its anatomy, like `anatomy.build().root`. */
export const elementOf = (scope: Scope, part: Part) => scope.query(`[${part.attr}="${CSS.escape(scope.id ?? "")}"]`)
export const elementsOf = (scope: Scope, part: Part) => scope.queryAll(`[${part.attr}="${CSS.escape(scope.id ?? "")}"]`)

/** A label part's text. Without one, the bridge names the component by its element's accessible name. */
export const labelOf = (scope: Scope, label: Part) => textOf(elementOf(scope, label)) || undefined

/**
 * Items read from the page, one per part, like a radio group's radios. Their value is the part's `data-value`, or
 * the end of its id, and their label its accessible name.
 */
export const itemsFrom = (scope: Scope, part: Part): AgentItem[] =>
  elementsOf(scope, part).map((el) => ({
    value: el.dataset.value ?? el.id.slice(el.id.lastIndexOf(":") + 1),
    label: nameOf(el) ?? "",
  }))

interface ListCollectionLike {
  items: unknown[]
  getItemValue: (item: any) => string | null
  stringifyItem: (item: any) => string | null
}

/** A list collection's items, like a select's or a combobox's options. */
export const collectionItems = (collection: ListCollectionLike): AgentItem[] =>
  collection.items.map((item) => ({
    value: collection.getItemValue(item) ?? "",
    label: collection.stringifyItem(item) ?? "",
  }))

/** The selected items' labels, as a select's trigger shows them. */
export const labelsOf = (collection: ListCollectionLike, values: string[]) => {
  const items = collectionItems(collection)
  return values.map((value) => items.find((item) => item.value === value)?.label ?? value).join(", ")
}

// The reason the bridge gives api methods that take one, so an app's change callback can tell an agent's change.
export const AGENT = "agent" as const

/** Presses the button in `container` the step names, like a dialog's "Save". */
export async function pressIn(
  container: HTMLElement | null,
  wanted: unknown,
  press: (button: HTMLElement) => Promise<void>,
) {
  const name = String(wanted ?? "")
  const buttons = buttonsIn(container)
  const button = buttons.find((el) => (nameOf(el) ?? "").toLowerCase() === name.toLowerCase())
  if (!button) throw new Error(`No button "${name}". Buttons: ${buttons.map((el) => nameOf(el)).join(", ")}.`)
  await press(button)
}

/** Its content while it shows, else its trigger, so a closed popup is still listed and can be opened. */
export const contentOrTrigger = (scope: Scope, content: Part, trigger: Part) => {
  const el = elementOf(scope, content)
  return isShown(el) ? el : (elementOf(scope, trigger) ?? el)
}

/** Waits for `done`, like a popup that opens after its delay, for at most `ms`. */
export async function waitFor(done: () => boolean, ms = 2000) {
  const end = Date.now() + ms
  while (!done() && Date.now() < end) await new Promise((resolve) => setTimeout(resolve, 16))
}
