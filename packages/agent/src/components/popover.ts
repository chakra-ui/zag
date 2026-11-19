import * as popover from "@zag-js/popover"
import { frames, textOf } from "../dom"
import { AGENT, type AgentDescriptor, elementOf, pressIn, toBoolean } from "./shared"

const parts = popover.anatomy.build()

export const popoverAgent: AgentDescriptor<popover.Api> = {
  kind: "popover",
  machine: popover.machine,
  connect: popover.connect,
  element: (scope) => elementOf(scope, parts.trigger),
  name: (scope) => textOf(elementOf(scope, parts.title)) || undefined,
  state: (api) => ({ open: api.open }),
  text: (scope) => [textOf(elementOf(scope, parts.title)), textOf(elementOf(scope, parts.description))].filter(Boolean),
  container: (scope) => elementOf(scope, parts.content),
  actions: {
    // Opens it when it's closed, then presses one of its buttons.
    async press({ api, args, scope, press }) {
      if (!api().open) api().setOpen(true, AGENT)
      await frames()
      await pressIn(elementOf(scope, parts.content), args[0], press)
    },
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
}
