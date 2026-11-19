import * as numberInput from "@zag-js/number-input"
import { type AgentDescriptor, elementOf, labelOf, toNumber } from "./shared"

const parts = numberInput.anatomy.build()

export const numberInputAgent: AgentDescriptor<numberInput.Api> = {
  kind: "number-input",
  machine: numberInput.machine,
  connect: numberInput.connect,
  element: (scope) => elementOf(scope, parts.input),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value }),
  actions: {
    // The input keeps its value within its min and max, so a value it clamps is reported as rejected.
    setValue: ({ api, args }) => {
      const value = toNumber(args[0])
      api().setValue(value)
      return { key: "value", value }
    },
    increment: ({ api }) => api().increment(),
    decrement: ({ api }) => api().decrement(),
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: null }
    },
  },
}
