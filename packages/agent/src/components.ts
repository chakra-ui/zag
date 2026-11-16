import * as accordion from "@zag-js/accordion"
import * as checkbox from "@zag-js/checkbox"
import type { Machine, Scope, Service } from "@zag-js/core"
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import * as select from "@zag-js/select"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import { buttonsIn, frames, isShown, nameOf, textOf } from "./dom"

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

const byId = (scope: Scope, id: string) => scope.getById(id)

// Zag marks each part with `data-<scope>-<part>="<machine id>"`, like `data-tabs-list`.
const partOf = (scope: Scope, part: string) => scope.query(`[data-${part}="${CSS.escape(scope.id ?? "")}"]`)
const partsOf = (scope: Scope, part: string) => scope.queryAll(`[data-${part}="${CSS.escape(scope.id ?? "")}"]`)

// A tab list's or accordion's sections, from their triggers.
function sectionsOf(scope: Scope, part: string): AgentItem[] {
  return partsOf(scope, part).map((el) => ({
    value: el.dataset.value ?? el.id.slice(el.id.lastIndexOf(":") + 1),
    label: textOf(el),
  }))
}

function sectionHolding(scope: Scope, target: Element) {
  const prefix = `${scope.id}:content:`
  let node: Element | null = target
  while (node) {
    if (node.id.startsWith(prefix)) return node.id.slice(prefix.length)
    node = node.parentElement
  }
  return null
}

const toBoolean = (value: unknown) => value !== false && value !== "false" && value !== "off"

const tabsAgent: AgentDescriptor<tabs.Api> = {
  kind: "tabs",
  machine: tabs.machine,
  connect: tabs.connect,
  element: (scope) => partOf(scope, "tabs-list"),
  state: (api) => ({ value: api.value }),
  items: (_api, scope) => sectionsOf(scope, "tabs-trigger"),
  actions: {
    setValue: ({ api, item, args }) => {
      const value = item(args[0]).value
      api().setValue(value)
      return { key: "value", value }
    },
  },
  openItem: (api, value) => api.setValue(value),
  reveal(api, scope, target) {
    const value = sectionHolding(scope, target)
    if (value == null || api.value === value) return false
    api.setValue(value)
    return true
  },
}

const accordionAgent: AgentDescriptor<accordion.Api> = {
  kind: "accordion",
  machine: accordion.machine,
  connect: accordion.connect,
  element: (scope) => partOf(scope, "accordion-root"),
  state: (api) => ({ value: api.value }),
  items: (_api, scope) => sectionsOf(scope, "accordion-item-trigger"),
  actions: {
    open: ({ api, item, args }) => {
      const value = item(args[0]).value
      const next = api().value.includes(value) ? api().value : [...api().value, value]
      api().setValue(next)
      return { key: "value", value: next, holds: (open) => (open as string[]).includes(value) }
    },
    close: ({ api, item, args }) => {
      const value = item(args[0]).value
      const next = api().value.filter((open) => open !== value)
      api().setValue(next)
      return { key: "value", value: next, holds: (open) => !(open as string[]).includes(value) }
    },
    setValue: ({ api, args, item }) => {
      const value = args.map((arg) => item(arg).value)
      api().setValue(value)
      return { key: "value", value }
    },
  },
  openItem: (api, value) => {
    if (!api.value.includes(value)) api.setValue([...api.value, value])
  },
  reveal(api, scope, target) {
    const value = sectionHolding(scope, target)
    if (value == null || api.value.includes(value)) return false
    api.setValue([...api.value, value])
    return true
  },
}

const selectAgent: AgentDescriptor<select.Api> = {
  kind: "select",
  machine: select.machine,
  connect: select.connect,
  element: (scope) => byId(scope, `${scope.id}:trigger`),
  state: (api) => ({ value: api.valueAsString }),
  items: (api) =>
    api.collection.items.map((item: unknown) => ({
      value: api.collection.getItemValue(item) ?? "",
      label: api.collection.stringifyItem(item) ?? "",
    })),
  actions: {
    setValue: ({ api, args, item }) => {
      const picked = args.flat().map((arg) => item(arg))
      api().setValue(picked.map((one) => one.value))
      // The state shows the selected labels, as the select's trigger does.
      return { key: "value", value: picked.map((one) => one.label).join(", ") }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0])),
  },
}

const switchAgent: AgentDescriptor<zagSwitch.Api> = {
  kind: "switch",
  machine: zagSwitch.machine,
  connect: zagSwitch.connect,
  element: (scope) => partOf(scope, "switch-root"),
  name: (scope) => textOf(partOf(scope, "switch-label")) || nameOf(byId(scope, `${scope.id}:input`)),
  state: (api) => ({ checked: api.checked }),
  actions: {
    setChecked: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setChecked(value)
      return { key: "checked", value }
    },
    toggle: ({ api }) => {
      const value = !api().checked
      api().toggleChecked()
      return { key: "checked", value }
    },
  },
}

// A checkbox's state can be "indeterminate", which a step may ask for or the app may answer with.
const checkedStateOf = (api: checkbox.Api) => (api.indeterminate ? "indeterminate" : api.checked)
const toCheckedState = (value: unknown) => (value === "indeterminate" ? "indeterminate" : toBoolean(value))

const checkboxAgent: AgentDescriptor<checkbox.Api> = {
  kind: "checkbox",
  machine: checkbox.machine,
  connect: checkbox.connect,
  element: (scope) => partOf(scope, "checkbox-root"),
  name: (scope) => textOf(partOf(scope, "checkbox-label")) || nameOf(byId(scope, `${scope.id}:input`)),
  state: (api) => ({ checked: checkedStateOf(api) }),
  actions: {
    setChecked: ({ api, args }) => {
      const value = toCheckedState(args[0])
      api().setChecked(value)
      return { key: "checked", value }
    },
    toggle: ({ api }) => {
      const value = checkedStateOf(api()) !== true
      api().toggleChecked()
      return { key: "checked", value }
    },
  },
}

const menuContent = (scope: Scope) => byId(scope, `${scope.id}:content`)
const menuItems = (scope: Scope) =>
  Array.from(menuContent(scope)?.querySelectorAll<HTMLElement>("[role^='menuitem']") ?? [])

const menuAgent: AgentDescriptor<menu.Api> = {
  kind: "menu",
  machine: menu.machine,
  connect: menu.connect,
  element: (scope) => byId(scope, `${scope.id}:trigger`),
  state: (api) => ({ open: api.open }),
  items: (_api, scope) => menuItems(scope).map((el) => ({ value: el.dataset.value ?? textOf(el), label: textOf(el) })),
  actions: {
    // Opens the menu when it's closed, then picks the item, like a person would.
    async press({ api, args, scope, item, press }) {
      const wanted = item(args[0])
      if (!api().open) {
        api().setOpen(true)
        await frames()
      }
      const el = menuItems(scope).find((candidate) => (candidate.dataset.value ?? textOf(candidate)) === wanted.value)
      if (!el) throw new Error(`${wanted.label} isn't in the menu.`)
      await press(el)
    },
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value)
      return { key: "open", value }
    },
  },
}

const dialogContent = (scope: Scope) => byId(scope, `${scope.id}:content`)

const dialogAgent: AgentDescriptor<dialog.Api> = {
  kind: "dialog",
  machine: dialog.machine,
  connect: dialog.connect,
  element: dialogContent,
  name: (scope) => textOf(byId(scope, `${scope.id}:title`)) || undefined,
  state: (api) => ({ open: api.open }),
  text: (scope) =>
    [textOf(byId(scope, `${scope.id}:title`)), textOf(byId(scope, `${scope.id}:description`))].filter(Boolean),
  container: dialogContent,
  actions: {
    async press({ args, scope, press }) {
      const wanted = String(args[0] ?? "")
      const buttons = buttonsIn(dialogContent(scope))
      const button = buttons.find((el) => (nameOf(el) ?? "").toLowerCase() === wanted.toLowerCase())
      if (!button) {
        throw new Error(`No button "${wanted}". Buttons: ${buttons.map((el) => nameOf(el)).join(", ")}.`)
      }
      await press(button)
    },
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value)
      return { key: "open", value }
    },
  },
}

export const defaultDescriptors: AgentDescriptor[] = [
  tabsAgent,
  accordionAgent,
  selectAgent,
  switchAgent,
  checkboxAgent,
  menuAgent,
  dialogAgent,
]

export { isShown }
