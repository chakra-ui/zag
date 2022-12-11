import { CalendarDate, DateFormatter, endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { DateDescriptionContext } from "./types"

export function getSelectedDateDescription(ctx: DateDescriptionContext) {
  let dateFormatter = ctx.getDateFormatter({
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(ctx.start) || getEraFormat(ctx.end),
    timeZone: ctx.timeZone,
  })

  const { start, end = start } = ctx

  if (!ctx.isSelectingRange && start && end) {
    if (isSameDay(start, end)) {
      return dateFormatter.format(start.toDate(ctx.timeZone))
    } else {
      return formatRange(dateFormatter, ctx)
    }
  }

  return ""
}

export function getVisibleRangeDescription(ctx: DateDescriptionContext, isAria?: boolean) {
  if (!ctx.start) return ""
  const { start, end = start } = ctx

  let era = getEraFormat(ctx.start) || getEraFormat(ctx.end)

  let monthFormatter = ctx.getDateFormatter({
    month: "long",
    year: "numeric",
    era,
    calendar: ctx.start.calendar.identifier,
    timeZone: ctx.timeZone,
  })

  let dateFormatter = ctx.getDateFormatter({
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    calendar: ctx.start.calendar.identifier,
    timeZone: ctx.timeZone,
  })

  if (isSameDay(start, startOfMonth(start))) {
    if (isSameDay(end, endOfMonth(start))) {
      return monthFormatter.format(start.toDate(ctx.timeZone))
    }

    if (isSameDay(end, endOfMonth(end))) {
      return isAria
        ? formatRange(monthFormatter, ctx)
        : monthFormatter.formatRange(start.toDate(ctx.timeZone), end.toDate(ctx.timeZone))
    }
  }

  return isAria
    ? formatRange(dateFormatter, ctx)
    : dateFormatter.formatRange(start.toDate(ctx.timeZone), end.toDate(ctx.timeZone))
}

function getEraFormat(date: CalendarDate | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined
}

function formatRange(dateFormatter: DateFormatter, ctx: DateDescriptionContext) {
  let parts = dateFormatter.formatRangeToParts(ctx.start!.toDate(ctx.timeZone), ctx.end!.toDate(ctx.timeZone))

  let separatorIndex = -1

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i
    } else if (part.source === "endRange") {
      break
    }
  }

  let start = ""
  let end = ""
  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      start += parts[i].value
    } else if (i > separatorIndex) {
      end += parts[i].value
    }
  }

  return ctx.stringify({ start, end })
}
