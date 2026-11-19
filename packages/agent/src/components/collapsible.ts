import * as collapsible from "@zag-js/collapsible"
import { nameOf } from "../dom"
import { AGENT, type AgentDescriptor, elementOf, toBoolean } from "./shared"

const parts = collapsible.anatomy.build()

export const collapsibleAgent: AgentDescriptor<collapsible.Api> = {
  kind: "collapsible",
  machine: collapsible.machine,
  connect: collapsible.connect,
  element: (scope) => elementOf(scope, parts.trigger),
  name: (scope) => nameOf(elementOf(scope, parts.trigger)),
  state: (api) => ({ open: api.open }),
  actions: {
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
  reveal(api, scope, target) {
    if (api.open || !elementOf(scope, parts.content)?.contains(target)) return false
    api.setOpen(true, AGENT)
    return true
  },
}
