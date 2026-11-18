import * as tabs from "@zag-js/tabs"
import { AGENT, type AgentDescriptor, partOf, sectionHolding, sectionsOf } from "./shared"

export const tabsAgent: AgentDescriptor<tabs.Api> = {
  kind: "tabs",
  machine: tabs.machine,
  connect: tabs.connect,
  element: (scope) => partOf(scope, "tabs-list"),
  state: (api) => ({ value: api.value }),
  items: (_api, scope) => sectionsOf(scope, "tabs-trigger"),
  actions: {
    setValue: ({ api, item, args }) => {
      const value = item(args[0]).value
      api().setValue(value, AGENT)
      return { key: "value", value }
    },
  },
  openItem: (api, value) => api.setValue(value, AGENT),
  reveal(api, scope, target) {
    const value = sectionHolding(scope, target)
    if (value == null || api.value === value) return false
    api.setValue(value, AGENT)
    return true
  },
}
