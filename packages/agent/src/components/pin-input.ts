import * as pinInput from "@zag-js/pin-input"
import { isSecret, REDACTED } from "../dom"
import { type AgentDescriptor, elementOf, labelOf } from "./shared"

const parts = pinInput.anatomy.build()

export const pinInputAgent: AgentDescriptor<pinInput.Api> = {
  kind: "pin-input",
  machine: pinInput.machine,
  connect: pinInput.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  // A one-time code or a masked pin is filled but never read back.
  state: (api, scope) => ({ value: isSecret(elementOf(scope, parts.input)) ? REDACTED : api.valueAsString }),
  actions: {
    setValue: ({ api, args }) => {
      const value = String(args[0] ?? "")
      api().setValue(Array.from(value))
      return { key: "value", value }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: "" }
    },
  },
}
