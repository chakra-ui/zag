import { isSameDay } from "@internationalized/date"
import { DateDescriptionContext } from "./types"
import { formatRange } from "./format-range"
import { getDateFormatter } from "./get-formatter"

export function formatSelectedDate(ctx: DateDescriptionContext) {
  const { start, end = start, timeZone } = ctx
  let formatter = getDateFormatter(ctx)
  if (ctx.isSelectingRange || start == null || end == null) {
    return ""
  }
  if (isSameDay(start, end)) {
    return formatter.format(start.toDate(timeZone))
  }
  return formatRange(ctx, formatter)
}
