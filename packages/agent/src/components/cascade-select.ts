import * as cascadeSelect from "@zag-js/cascade-select"
import { AGENT, type AgentDescriptor, type AgentItem, elementOf, labelOf, toBoolean } from "./shared"

const parts = cascadeSelect.anatomy.build()

type Collection = cascadeSelect.Api["collection"]

// A node's labels from the top, like "Europe / France / Paris".
const pathLabel = (collection: Collection, path: string[]) =>
  path.map((value) => collection.stringify(value) ?? value).join(" / ")

// Every option it can end on, by its own value, with the path to it as its label.
function leavesOf(collection: Collection): AgentItem[] {
  return collection.getValues().flatMap((value) => {
    const node = collection.findNode(value)
    if (!node || collection.isBranchNode(node)) return []
    return [{ value, label: pathLabel(collection, collection.getValuePath(collection.getIndexPath(value))) }]
  })
}

export const cascadeSelectAgent: AgentDescriptor<cascadeSelect.Api> = {
  kind: "cascade-select",
  machine: cascadeSelect.machine,
  connect: cascadeSelect.connect,
  element: (scope) => elementOf(scope, parts.trigger),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value.map((path) => pathLabel(api.collection, path)).join(", ") }),
  items: (api) => leavesOf(api.collection),
  actions: {
    setValue: ({ api, args, item }) => {
      const picked = args.flat().map((arg) => item(arg))
      const collection = api().collection
      api().setValue(picked.map((one) => collection.getValuePath(collection.getIndexPath(one.value))))
      return { key: "value", value: picked.map((one) => one.label).join(", ") }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: "" }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0]), AGENT),
  },
}
