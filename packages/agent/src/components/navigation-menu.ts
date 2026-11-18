import * as navigationMenu from "@zag-js/navigation-menu"
import { AGENT, type AgentDescriptor, elementOf, itemsFrom } from "./shared"

const parts = navigationMenu.anatomy.build()

export const navigationMenuAgent: AgentDescriptor<navigationMenu.Api> = {
  kind: "navigation-menu",
  machine: navigationMenu.machine,
  connect: navigationMenu.connect,
  element: (scope) => elementOf(scope, parts.root),
  // The menu that's open, if any.
  state: (api) => ({ open: api.value || null }),
  items: (_api, scope) => itemsFrom(scope, parts.trigger),
  actions: {
    open: ({ api, args, item }) => {
      const value = item(args[0]).value
      api().setValue(value, AGENT)
      return { key: "open", value }
    },
    close: ({ api }) => {
      api().setValue("", AGENT)
      return { key: "open", value: null }
    },
  },
}
