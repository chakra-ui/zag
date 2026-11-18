import * as drawer from "@zag-js/drawer"
import { textOf } from "../dom"
import { AGENT, type AgentDescriptor, contentOrTrigger, elementOf, pressIn, toBoolean } from "./shared"

const parts = drawer.anatomy.build()

export const drawerAgent: AgentDescriptor<drawer.Api> = {
  kind: "drawer",
  machine: drawer.machine,
  connect: drawer.connect,
  element: (scope) => contentOrTrigger(scope, parts.content, parts.trigger),
  name: (scope) => textOf(elementOf(scope, parts.title)) || undefined,
  state: (api) => ({ open: api.open }),
  text: (scope) => [textOf(elementOf(scope, parts.title)), textOf(elementOf(scope, parts.description))].filter(Boolean),
  container: (scope) => elementOf(scope, parts.content),
  actions: {
    press: ({ args, scope, press }) => pressIn(elementOf(scope, parts.content), args[0], press),
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
}
