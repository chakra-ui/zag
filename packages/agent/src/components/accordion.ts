import * as accordion from "@zag-js/accordion"
import { AGENT, type AgentDescriptor, partOf, sectionHolding, sectionsOf } from "./shared"

export const accordionAgent: AgentDescriptor<accordion.Api> = {
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
      api().setValue(next, AGENT)
      return { key: "value", value: next, holds: (open) => (open as string[]).includes(value) }
    },
    close: ({ api, item, args }) => {
      const value = item(args[0]).value
      const next = api().value.filter((open) => open !== value)
      api().setValue(next, AGENT)
      return { key: "value", value: next, holds: (open) => !(open as string[]).includes(value) }
    },
    setValue: ({ api, args, item }) => {
      const value = args.map((arg) => item(arg).value)
      api().setValue(value, AGENT)
      return { key: "value", value }
    },
  },
  openItem: (api, value) => {
    if (!api.value.includes(value)) api.setValue([...api.value, value], AGENT)
  },
  reveal(api, scope, target) {
    const value = sectionHolding(scope, target)
    if (value == null || api.value.includes(value)) return false
    api.setValue([...api.value, value], AGENT)
    return true
  },
}
