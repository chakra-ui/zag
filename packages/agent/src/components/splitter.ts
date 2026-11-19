import * as splitter from "@zag-js/splitter"
import { type AgentDescriptor, elementOf, toNumber } from "./shared"

const parts = splitter.anatomy.build()

export const splitterAgent: AgentDescriptor<splitter.Api> = {
  kind: "splitter",
  machine: splitter.machine,
  connect: splitter.connect,
  element: (scope) => elementOf(scope, parts.root),
  // Each panel's share of the splitter, in percent.
  state: (api) => ({ sizes: api.getSizes() }),
  items: (api) => api.getPanels().map((panel) => ({ value: String(panel.id), label: String(panel.id) })),
  actions: {
    resize: ({ api, args, item }) => api().resizePanel(item(args[0]).value, toNumber(args[1])),
    collapse: ({ api, args, item }) => api().collapsePanel(item(args[0]).value),
    expand: ({ api, args, item }) => api().expandPanel(item(args[0]).value),
  },
}
