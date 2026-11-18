import type { Machine, Scope, Service } from "@zag-js/core"
import { textOf } from "../dom"

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
  state: (api: Api) => Record<string, unknown>
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

// The reason the bridge gives api methods that take one, so an app's change callback can tell an agent's change.
export const AGENT = "agent" as const
