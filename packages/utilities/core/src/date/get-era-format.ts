import type { DateValue } from "./types"

export function getEraFormat(date: DateValue | undefined): "short" | undefined {
  if (!date) return undefined
  const id = date.calendar.identifier
  if (id === "gregory" || id === "iso8601") {
    return date.era === "BC" ? "short" : undefined
  }
  return "short"
}
