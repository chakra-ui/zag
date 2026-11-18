import * as combobox from "@zag-js/combobox"
import { AGENT, type AgentDescriptor, collectionItems, elementOf, labelOf, labelsOf, toBoolean } from "./shared"

const parts = combobox.anatomy.build()

export const comboboxAgent: AgentDescriptor<combobox.Api> = {
  kind: "combobox",
  machine: combobox.machine,
  connect: combobox.connect,
  element: (scope) => elementOf(scope, parts.input),
  name: (scope) => labelOf(scope, parts.label),
  // The selected labels, as a select's trigger shows them.
  state: (api) => ({ value: labelsOf(api.collection, api.value) }),
  // Only the options it offers now: an app that filters them as a person types shows more after a search.
  items: (api) => collectionItems(api.collection),
  actions: {
    setValue: ({ api, args, item }) => {
      const picked = args.flat().map((arg) => item(arg))
      api().setValue(picked.map((one) => one.value))
      return { key: "value", value: picked.map((one) => one.label).join(", ") }
    },
    // Types into the input, so an app that filters its options by what's typed offers the ones that match.
    search: ({ api, args }) => {
      api().setInputValue(String(args[0] ?? ""), AGENT)
      api().setOpen(true, AGENT)
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: "" }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0]), AGENT),
  },
}
