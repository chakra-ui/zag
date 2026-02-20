import type { DateValue } from "./types"

export function getEraFormat(date: DateValue | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined
}
