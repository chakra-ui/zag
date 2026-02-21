import { DateFormatter } from "@internationalized/date"
import type { Params } from "@zag-js/core"
import type { DateInputSchema, DateSegment } from "../date-input.types"
import { setSegment } from "./adjusters"
import { advanceToNextSegment, getDisplayValue, markSegmentValid, setValue } from "./validity"

export function isNumberString(value: string) {
  return !Number.isNaN(Number.parseInt(value))
}

export function updateSegmentValue(ctx: Params<DateInputSchema>, segment: DateSegment, input: string) {
  const { context, prop } = ctx
  const type = segment.type as DateSegment["type"]
  const validSegments = context.get("validSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]
  const formatter = prop("formatter")
  const enteredKeys = context.get("enteredKeys")

  switch (type) {
    case "dayPeriod": {
      const displayValue = getDisplayValue(ctx)
      if (!("hour" in displayValue)) return

      // Get locale-aware AM/PM strings
      const amPmFormatter = new DateFormatter(prop("locale"), { hour: "numeric", hour12: true })
      const amDate = new Date()
      amDate.setHours(0)
      const pmDate = new Date()
      pmDate.setHours(12)

      const am = amPmFormatter.formatToParts(amDate).find((p) => p.type === "dayPeriod")?.value || "AM"
      const pm = amPmFormatter.formatToParts(pmDate).find((p) => p.type === "dayPeriod")?.value || "PM"

      const lowerInput = input.toLowerCase()
      if (am.toLowerCase().startsWith(lowerInput)) {
        markSegmentValid(ctx, type)
        setValue(ctx, setSegment(displayValue, "dayPeriod", 0, formatter.resolvedOptions()))
      } else if (pm.toLowerCase().startsWith(lowerInput)) {
        markSegmentValid(ctx, type)
        setValue(ctx, setSegment(displayValue, "dayPeriod", 12, formatter.resolvedOptions()))
      } else {
        break
      }

      advanceToNextSegment(ctx)
      break
    }
    case "era": {
      const displayValue = getDisplayValue(ctx)
      const eras = displayValue.calendar.getEras()

      // Try to match input against formatted era names
      const eraFormatter = new DateFormatter(prop("locale"), { era: "short" })
      const lowerInput = input.toLowerCase()

      for (let i = 0; i < eras.length; i++) {
        const eraDate = displayValue.set({ year: 1 }).toDate(prop("timeZone"))
        const formattedEra = eraFormatter.formatToParts(eraDate).find((p) => p.type === "era")?.value
        if (formattedEra && formattedEra.toLowerCase().startsWith(lowerInput)) {
          markSegmentValid(ctx, type)
          setValue(ctx, displayValue.set({ era: eras[i] }))
          advanceToNextSegment(ctx)
          break
        }
      }
      break
    }
    case "day":
    case "hour":
    case "minute":
    case "second":
    case "month":
    case "year": {
      let newValue = enteredKeys + input
      let numberValue = Number.parseInt(newValue)
      let segmentValue = numberValue
      let allowsZero = segment.minValue === 0

      if (!isNumberString(input)) return

      if (segment.type === "hour" && formatter.resolvedOptions().hour12) {
        switch (formatter.resolvedOptions().hourCycle) {
          case "h11":
            if (numberValue > 11) {
              segmentValue = Number.parseInt(input)
            }
            break
          case "h12":
            allowsZero = false
            if (numberValue > 12) {
              segmentValue = Number.parseInt(input)
            }
            break
        }

        if (segment.value !== undefined && segment.value >= 12 && numberValue > 1) {
          numberValue += 12
        }
      } else if (segment.maxValue !== undefined && numberValue > segment.maxValue) {
        segmentValue = Number.parseInt(input)
      }

      if (isNaN(numberValue)) {
        return
      }

      let shouldSetValue = segmentValue !== 0 || allowsZero
      if (shouldSetValue) {
        if (!activeValidSegments?.[type]) {
          markSegmentValid(ctx, type)
        }
        setValue(ctx, setSegment(getDisplayValue(ctx), type, segmentValue, formatter.resolvedOptions()))
      }

      if (
        segment.maxValue !== undefined &&
        (Number(numberValue + "0") > segment.maxValue || newValue.length >= String(segment.maxValue).length)
      ) {
        context.set("enteredKeys", "")
        if (shouldSetValue) {
          advanceToNextSegment(ctx)
        }
      } else {
        context.set("enteredKeys", newValue)
      }
      break
    }
  }
}
