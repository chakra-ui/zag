import * as angleSlider from "@zag-js/angle-slider"
import { type AgentDescriptor, elementOf, labelOf, toNumber } from "./shared"

const parts = angleSlider.anatomy.build()

export const angleSliderAgent: AgentDescriptor<angleSlider.Api> = {
  kind: "angle-slider",
  machine: angleSlider.machine,
  connect: angleSlider.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value }),
  actions: {
    setValue: ({ api, args }) => {
      const value = toNumber(args[0])
      api().setValue(value)
      return { key: "value", value }
    },
  },
}
