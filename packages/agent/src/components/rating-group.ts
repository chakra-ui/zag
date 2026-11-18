import * as ratingGroup from "@zag-js/rating-group"
import { type AgentDescriptor, elementOf, labelOf, toNumber } from "./shared"

const parts = ratingGroup.anatomy.build()

export const ratingGroupAgent: AgentDescriptor<ratingGroup.Api> = {
  kind: "rating-group",
  machine: ratingGroup.machine,
  connect: ratingGroup.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  // -1 is no rating.
  state: (api) => ({ value: api.value < 0 ? null : api.value, max: api.count }),
  actions: {
    setValue: ({ api, args }) => {
      const value = toNumber(args[0])
      api().setValue(value)
      return { key: "value", value }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: null }
    },
  },
}
