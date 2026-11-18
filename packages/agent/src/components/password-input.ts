import * as passwordInput from "@zag-js/password-input"
import { fillValue, REDACTED } from "../dom"
import { type AgentDescriptor, elementOf, labelOf } from "./shared"

const parts = passwordInput.anatomy.build()

export const passwordInputAgent: AgentDescriptor<passwordInput.Api> = {
  kind: "password-input",
  machine: passwordInput.machine,
  connect: passwordInput.connect,
  element: (scope) => elementOf(scope, parts.input),
  name: (scope) => labelOf(scope, parts.label),
  // Filled but never read back, even while the person has it visible.
  state: () => ({ value: REDACTED }),
  actions: {
    setValue: ({ scope, args }) => {
      const input = elementOf(scope, parts.input) as HTMLInputElement | null
      if (!input) throw new Error("The password input isn't on the page.")
      fillValue(input, String(args[0] ?? ""))
    },
  },
}
