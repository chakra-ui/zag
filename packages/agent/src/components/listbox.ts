import * as listbox from "@zag-js/listbox"
import { type AgentDescriptor, collectionItems, elementOf, labelOf, labelsOf } from "./shared"

const parts = listbox.anatomy.build()

export const listboxAgent: AgentDescriptor<listbox.Api> = {
  kind: "listbox",
  machine: listbox.machine,
  connect: listbox.connect,
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
