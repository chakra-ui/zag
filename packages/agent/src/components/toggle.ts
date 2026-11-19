import * as toggle from "@zag-js/toggle"
import { nameOf } from "../dom"
import { type AgentDescriptor, elementOf, toBoolean } from "./shared"

const parts = toggle.anatomy.build()

export const toggleAgent: AgentDescriptor<toggle.Api> = {
  kind: "toggle",
  machine: toggle.machine,
  connect: toggle.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => nameOf(elementOf(scope, parts.root)),
  state: (api) => ({ pressed: api.pressed }),
  value: "pressed",
  actions: {
    setPressed: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setPressed(value)
      return { key: "pressed", value }
    },
    toggle: ({ api }) => {
      const value = !api().pressed
      api().setPressed(value)
      return { key: "pressed", value }
    },
  },
}
