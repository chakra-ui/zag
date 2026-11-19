import * as gridlist from "@zag-js/gridlist"
import { type AgentDescriptor, collectionItems, elementOf, labelOf, labelsOf } from "./shared"

const parts = gridlist.anatomy.build()

export const gridlistAgent: AgentDescriptor<gridlist.Api> = {
  kind: "gridlist",
  machine: gridlist.machine,
  connect: gridlist.connect,
  element: (scope) => elementOf(scope, parts.content),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: labelsOf(api.collection, api.value) }),
  items: (api) => collectionItems(api.collection),
  actions: {
    setValue: ({ api, args, item }) => {
      const picked = args.flat().map((arg) => item(arg))
      api().setValue(picked.map((one) => one.value))
      return { key: "value", value: picked.map((one) => one.label).join(", ") }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: "" }
    },
  },
}
