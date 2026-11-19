import * as toast from "@zag-js/toast"
import { textOf } from "../dom"
import { type AgentDescriptor, elementOf, pressIn } from "./shared"

const parts = toast.anatomy.build()

export const toastAgent: AgentDescriptor<toast.Api> = {
  kind: "toast",
  machine: toast.machine,
  connect: toast.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => textOf(elementOf(scope, parts.title)) || undefined,
  state: (api) => ({ type: api.type }),
  text: (scope) => [textOf(elementOf(scope, parts.title)), textOf(elementOf(scope, parts.description))].filter(Boolean),
  container: (scope) => elementOf(scope, parts.root),
  actions: {
    // Presses its action, like "Undo", or its close button.
    press: ({ args, scope, press }) => pressIn(elementOf(scope, parts.root), args[0], press),
    dismiss: ({ api }) => api().dismiss(),
  },
}
