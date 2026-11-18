import * as datePicker from "@zag-js/date-picker"
import { AGENT, type AgentDescriptor, elementOf, labelOf, toBoolean, toList } from "./shared"

const parts = datePicker.anatomy.build()

// ISO dates, like 2026-11-18, whatever the picker shows: one for a single date, a list for a range or several.
const isoOf = (value: { toString(): string }[]) => {
  const dates = value.map((date) => date.toString())
  if (dates.length === 0) return null
  return dates.length === 1 ? dates[0] : dates
}

export const datePickerAgent: AgentDescriptor<datePicker.Api> = {
  kind: "date-picker",
  machine: datePicker.machine,
  connect: datePicker.connect,
  element: (scope) => elementOf(scope, parts.input) ?? elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: isoOf(api.value) }),
  actions: {
    // Takes ISO dates. The picker may refuse one, like a date outside its min and max, which is reported as rejected.
    setValue: ({ api, args }) => {
      const value = datePicker.parse(toList(args))
      api().setValue(value)
      return { key: "value", value: isoOf(value) }
    },
    clear: ({ api }) => {
      api().clearValue({ focus: false })
      return { key: "value", value: null }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0]), AGENT),
  },
}
