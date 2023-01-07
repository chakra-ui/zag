import { DateFormatter } from "@internationalized/date"
import { DateDescriptionContext } from "./types"

export function formatRange(ctx: DateDescriptionContext, formatter: DateFormatter) {
  let parts = formatter.formatRangeToParts(ctx.start!.toDate(ctx.timeZone), ctx.end!.toDate(ctx.timeZone))

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

  return ctx.toString(start, end)
}
