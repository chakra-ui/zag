import type { CalendarDate } from "@internationalized/date"

export function getEraFormat(date: CalendarDate | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined
}
