import * as radioGroup from "@zag-js/radio-group"
import { type AgentDescriptor, elementOf, itemsFrom, labelOf } from "./shared"

const parts = radioGroup.anatomy.build()

export const radioGroupAgent: AgentDescriptor<radioGroup.Api> = {
  kind: "radio-group",
  machine: radioGroup.machine,
  connect: radioGroup.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value ?? null }),
  items: (_api, scope) => itemsFrom(scope, parts.item),
  actions: {
    setValue: ({ api, args, item }) => {
      const value = item(args[0]).value
      api().setValue(value)
      return { key: "value", value }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: null }
    },
  },
}
