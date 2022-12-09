import { CalendarDate, DateFormatter, endOfMonth, isSameDay, startOfMonth } from "@internationalized/date"
import { DateDescriptionContext } from "./types"

export function getSelectedDateDescription(ctx: DateDescriptionContext) {
  let dateFormatter = ctx.createDateFormatter({
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(ctx.start) || getEraFormat(ctx.end),
    timeZone: ctx.timeZone,
  })

  if (!ctx.isSelectingRange && ctx.start && ctx.end) {
    if (isSameDay(ctx.start, ctx.end)) {
      return dateFormatter.format(ctx.start.toDate(ctx.timeZone))
    } else {
      return formatRange(dateFormatter, ctx)
    }
  }

  return ""
}

export function getVisibleRangeDescription(ctx: DateDescriptionContext, isAria?: boolean) {
  if (!ctx.start || !ctx.end) throw new Error("Missing start date")

  let era = getEraFormat(ctx.start) || getEraFormat(ctx.end)

  let monthFormatter = ctx.createDateFormatter({
    month: "long",
    year: "numeric",
    era,
    calendar: ctx.start.calendar.identifier,
    timeZone: ctx.timeZone,
  })

  let dateFormatter = ctx.createDateFormatter({
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    calendar: ctx.start.calendar.identifier,
    timeZone: ctx.timeZone,
  })

  if (isSameDay(ctx.start, startOfMonth(ctx.start))) {
    if (isSameDay(ctx.end, endOfMonth(ctx.start))) {
      return monthFormatter.format(ctx.start.toDate(ctx.timeZone))
    }

    if (isSameDay(ctx.end, endOfMonth(ctx.end))) {
      return isAria
        ? formatRange(monthFormatter, ctx)
        : monthFormatter.formatRange(ctx.start.toDate(ctx.timeZone), ctx.end.toDate(ctx.timeZone))
    }
  }

  return isAria
    ? formatRange(dateFormatter, ctx)
    : dateFormatter.formatRange(ctx.start.toDate(ctx.timeZone), ctx.end.toDate(ctx.timeZone))
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
