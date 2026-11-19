import * as slider from "@zag-js/slider"
import { type AgentDescriptor, elementOf, labelOf, toNumber } from "./shared"

const parts = slider.anatomy.build()

// One thumb reads as a number, a range as a list.
const valueOf = (value: number[]) => (value.length === 1 ? value[0] : value)

export const sliderAgent: AgentDescriptor<slider.Api> = {
  kind: "slider",
  machine: slider.machine,
  connect: slider.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: valueOf(api.value) }),
  actions: {
    // The slider keeps its value within its min, max and step, so a value it rounds is reported as rejected.
    setValue: ({ api, args }) => {
      const value = args.flat().map(toNumber)
      api().setValue(value)
      return { key: "value", value: valueOf(value) }
    },
    increment: ({ api, args }) => api().increment(args.length ? toNumber(args[0]) : 0),
    decrement: ({ api, args }) => api().decrement(args.length ? toNumber(args[0]) : 0),
  },
}
