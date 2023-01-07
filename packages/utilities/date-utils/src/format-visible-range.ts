import { endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { formatRange } from "./format-range"
import { getDateFormatter, getMonthFormatter } from "./get-formatter"
import { DateDescriptionContext } from "./types"

export function formatVisibleRange(ctx: DateDescriptionContext, isAria?: boolean) {
  if (!ctx.start) return ""
  const { start, end = start, timeZone } = ctx

  let monthFormatter = getMonthFormatter(ctx)
  let dateFormatter = getDateFormatter(ctx)

  if (!isSameDay(start, startOfMonth(start))) {
    return isAria
      ? formatRange(ctx, dateFormatter)
      : dateFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }

  if (isSameDay(end, endOfMonth(start))) {
    return monthFormatter.format(start.toDate(timeZone))
  }

  if (isSameDay(end, endOfMonth(end))) {
    return isAria
      ? formatRange(ctx, monthFormatter)
      : monthFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone))
  }
}
