import * as colorPicker from "@zag-js/color-picker"
import { AGENT, type AgentDescriptor, elementOf, labelOf, toBoolean } from "./shared"

const parts = colorPicker.anatomy.build()

// The same color, whatever format each is written in, like #ff0000 and rgb(255, 0, 0).
const sameColor = (a: unknown, b: string) => {
  try {
    return colorPicker.parse(String(a)).isEqual(colorPicker.parse(b))
  } catch {
    return false
  }
}

export const colorPickerAgent: AgentDescriptor<colorPicker.Api> = {
  kind: "color-picker",
  machine: colorPicker.machine,
  connect: colorPicker.connect,
  element: (scope) => elementOf(scope, parts.control) ?? elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  // In the picker's own format, like #ff0000 or rgba(255, 0, 0, 1).
  state: (api) => ({ value: api.valueAsString }),
  actions: {
    // Takes any CSS color, like #ff0000, rgb(255, 0, 0) or hsl(0, 100%, 50%).
    setValue: ({ api, args }) => {
      const value = String(args[0] ?? "")
      try {
        colorPicker.parse(value)
      } catch {
        throw new Error(`"${value}" isn't a color. Use one like #ff0000 or rgb(255, 0, 0).`)
      }
      api().setValue(value)
      return { key: "value", value, holds: (committed) => sameColor(committed, value) }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0]), AGENT),
  },
}
