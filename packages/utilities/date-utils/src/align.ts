import { CalendarDate } from "@internationalized/date"
import { alignCenter, alignEnd, alignStart } from "./constrain"
import { DateAlignment, DateContext } from "./types"

export function alignDate(ctx: DateContext, date: CalendarDate, alignment: DateAlignment) {
  switch (alignment) {
    case "start":
      return alignStart(ctx, date)
    case "end":
      return alignEnd(ctx, date)
    case "center":
    default:
      return alignCenter(ctx, date)
  }
}

export function alignStartDate(
  ctx: DateContext,
  focusedDate: CalendarDate,
  startDate: CalendarDate,
  endDate: CalendarDate,
) {
  if (focusedDate.compare(startDate) < 0) {
    return alignEnd(ctx, focusedDate)
  }
  if (focusedDate.compare(endDate) > 0) {
    return alignStart(ctx, focusedDate)
  }
  return startDate
}
