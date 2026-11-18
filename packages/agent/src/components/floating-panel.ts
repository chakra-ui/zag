import * as floatingPanel from "@zag-js/floating-panel"
import { textOf } from "../dom"
import { AGENT, type AgentDescriptor, contentOrTrigger, elementOf, pressIn, toBoolean } from "./shared"

const parts = floatingPanel.anatomy.build()

export const floatingPanelAgent: AgentDescriptor<floatingPanel.Api> = {
  kind: "floating-panel",
  machine: floatingPanel.machine,
  connect: floatingPanel.connect,
  element: (scope) => contentOrTrigger(scope, parts.content, parts.trigger),
  name: (scope) => textOf(elementOf(scope, parts.title)) || undefined,
  state: (api) => ({ open: api.open }),
  container: (scope) => elementOf(scope, parts.body),
  actions: {
    press: ({ args, scope, press }) => pressIn(elementOf(scope, parts.body), args[0], press),
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
    minimize: ({ api }) => api().minimize(),
    maximize: ({ api }) => api().maximize(),
    restore: ({ api }) => api().restore(),
  },
}
