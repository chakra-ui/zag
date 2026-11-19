import * as editable from "@zag-js/editable"
import { type AgentDescriptor, elementOf, labelOf } from "./shared"

const parts = editable.anatomy.build()

export const editableAgent: AgentDescriptor<editable.Api> = {
  kind: "editable",
  machine: editable.machine,
  connect: editable.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value }),
  actions: {
    setValue: ({ api, args }) => {
      const value = String(args[0] ?? "")
      api().setValue(value)
      return { key: "value", value }
    },
  },
}
