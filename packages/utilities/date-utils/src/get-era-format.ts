import type { DateValue } from "@internationalized/date"

export function getEraFormat(date: DateValue | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined
}
