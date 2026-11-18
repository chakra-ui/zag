import * as treeView from "@zag-js/tree-view"
import { type AgentDescriptor, elementOf, labelOf } from "./shared"

const parts = treeView.anatomy.build()

export const treeViewAgent: AgentDescriptor<treeView.Api> = {
  kind: "tree-view",
  machine: treeView.machine,
  connect: treeView.connect,
  element: (scope) => elementOf(scope, parts.tree),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.selectedValue, expanded: api.expandedValue }),
  items: (api) =>
    api.collection.getValues().map((value) => ({ value, label: api.collection.stringify(value) ?? value })),
  actions: {
    select: ({ api, args, item }) => {
      const value = args.flat().map((arg) => item(arg).value)
      api().setSelectedValue(value)
      return { key: "value", value }
    },
    // Opens the branches given, and the ones above them, so they show.
    expand: ({ api, args, item }) => {
      const values = args.flat().map((arg) => item(arg).value)
      for (const value of values) api().expandParent(value)
      api().expand(values)
    },
    collapse: ({ api, args, item }) => api().collapse(args.flat().map((arg) => item(arg).value)),
  },
}
