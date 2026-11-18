import * as hoverCard from "@zag-js/hover-card"
import { nameOf, textOf } from "../dom"
import { AGENT, type AgentDescriptor, elementOf, toBoolean, waitFor } from "./shared"

const parts = hoverCard.anatomy.build()

export const hoverCardAgent: AgentDescriptor<hoverCard.Api> = {
  kind: "hover-card",
  machine: hoverCard.machine,
  connect: hoverCard.connect,
  element: (scope) => elementOf(scope, parts.trigger),
  name: (scope) => nameOf(elementOf(scope, parts.trigger)),
  state: (api) => ({ open: api.open }),
  // What it shows while open, which a person would read by hovering.
  text: (scope) => [textOf(elementOf(scope, parts.content))].filter(Boolean),
  actions: {
    // Opens after its delay, as on hover, so this waits for it.
    async setOpen({ api, args }) {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      await waitFor(() => api().open === value)
      return { key: "open", value }
    },
  },
}
