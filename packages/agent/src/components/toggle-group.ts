import * as toggleGroup from "@zag-js/toggle-group"
import { type AgentDescriptor, elementOf, itemsFrom } from "./shared"

const parts = toggleGroup.anatomy.build()

export const toggleGroupAgent: AgentDescriptor<toggleGroup.Api> = {
  kind: "toggle-group",
  machine: toggleGroup.machine,
  connect: toggleGroup.connect,
  element: (scope) => elementOf(scope, parts.root),
  state: (api) => ({ value: api.value }),
  items: (_api, scope) => itemsFrom(scope, parts.item),
  actions: {
    setValue: ({ api, args, item }) => {
      const value = args.flat().map((arg) => item(arg).value)
      api().setValue(value)
      return { key: "value", value }
    },
    // Presses one item, like a person would: on when it's off, off when it's on.
    toggle: ({ api, args, item }) => {
      const value = item(args[0]).value
      const on = api().value.includes(value)
      api().setValue(on ? api().value.filter((one) => one !== value) : [...api().value, value])
      return { key: "value", value, holds: (committed) => (committed as string[]).includes(value) !== on }
    },
  },
}
