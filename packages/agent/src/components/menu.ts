import type { Scope } from "@zag-js/core"
import * as menu from "@zag-js/menu"
import { frames, textOf } from "../dom"
import { AGENT, type AgentDescriptor, byId, toBoolean } from "./shared"

const menuContent = (scope: Scope) => byId(scope, `${scope.id}:content`)
const menuItems = (scope: Scope) =>
  Array.from(menuContent(scope)?.querySelectorAll<HTMLElement>("[role^='menuitem']") ?? [])

export const menuAgent: AgentDescriptor<menu.Api> = {
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
        api().setOpen(true, AGENT)
        await frames()
      }
      const el = menuItems(scope).find((candidate) => (candidate.dataset.value ?? textOf(candidate)) === wanted.value)
      if (!el) throw new Error(`${wanted.label} isn't in the menu.`)
      await press(el)
    },
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
}
