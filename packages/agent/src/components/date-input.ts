import * as dateInput from "@zag-js/date-input"
import { type AgentDescriptor, elementOf, labelOf, toList } from "./shared"

const parts = dateInput.anatomy.build()

const isoOf = (value: { toString(): string }[]) => {
  const dates = value.map((date) => date.toString())
  if (dates.length === 0) return null
  return dates.length === 1 ? dates[0] : dates
}

export const dateInputAgent: AgentDescriptor<dateInput.Api> = {
  kind: "date-input",
  machine: dateInput.machine,
  connect: dateInput.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: isoOf(api.value) }),
  actions: {
    // Takes ISO dates, like 2026-11-18.
    setValue: ({ api, args }) => {
      const value = dateInput.parse(toList(args))
      api().setValue(value)
      return { key: "value", value: isoOf(value) }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: null }
    },
  },
}
