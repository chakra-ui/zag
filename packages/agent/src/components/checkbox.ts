import * as checkbox from "@zag-js/checkbox"
import { nameOf, textOf } from "../dom"
import { type AgentDescriptor, byId, partOf, toBoolean } from "./shared"

// A checkbox's state can be "indeterminate", which a step may ask for or the app may answer with.
const checkedStateOf = (api: checkbox.Api) => (api.indeterminate ? "indeterminate" : api.checked)
const toCheckedState = (value: unknown) => (value === "indeterminate" ? "indeterminate" : toBoolean(value))

export const checkboxAgent: AgentDescriptor<checkbox.Api> = {
  kind: "checkbox",
  machine: checkbox.machine,
  connect: checkbox.connect,
  element: (scope) => partOf(scope, "checkbox-root"),
  name: (scope) => textOf(partOf(scope, "checkbox-label")) || nameOf(byId(scope, `${scope.id}:input`)),
  state: (api) => ({ checked: checkedStateOf(api) }),
  actions: {
    setChecked: ({ api, args }) => {
      const value = toCheckedState(args[0])
      api().setChecked(value)
      return { key: "checked", value }
    },
    toggle: ({ api }) => {
      const value = checkedStateOf(api()) !== true
      api().toggleChecked()
      return { key: "checked", value }
    },
  },
}
