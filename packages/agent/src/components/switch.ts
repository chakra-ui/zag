import * as zagSwitch from "@zag-js/switch"
import { nameOf, textOf } from "../dom"
import { type AgentDescriptor, byId, partOf, toBoolean } from "./shared"

export const switchAgent: AgentDescriptor<zagSwitch.Api> = {
  kind: "switch",
  machine: zagSwitch.machine,
  connect: zagSwitch.connect,
  element: (scope) => partOf(scope, "switch-root"),
  name: (scope) => textOf(partOf(scope, "switch-label")) || nameOf(byId(scope, `${scope.id}:input`)),
  state: (api) => ({ checked: api.checked }),
  actions: {
    setChecked: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setChecked(value)
      return { key: "checked", value }
    },
    toggle: ({ api }) => {
      const value = !api().checked
      api().toggleChecked()
      return { key: "checked", value }
    },
  },
}
