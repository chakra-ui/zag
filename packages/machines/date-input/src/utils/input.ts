import { DateFormatter } from "@internationalized/date"
import type { Params } from "@zag-js/core"
import type { DateInputSchema, DateSegment } from "../date-input.types"
import { IncompleteDate } from "./incomplete-date"
import { goToNextSegment, getActiveDisplayValue, setDisplayValue } from "./validity"

export function isNumberString(value: string) {
  return !Number.isNaN(Number.parseInt(value))
}

export function updateSegmentValue(
  ctx: Params<DateInputSchema>,
  segment: DateSegment,
  input: string,
): IncompleteDate | undefined {
  const { context, prop } = ctx
  const type = segment.type as DateSegment["type"]
  const index = context.get("activeIndex")
  const formatter = prop("formatter")
  const enteredKeys = context.get("enteredKeys")
  const placeholderValue = context.get("placeholderValue")

  let dv = getActiveDisplayValue(ctx)
  let next: IncompleteDate | undefined

  switch (type) {
    case "dayPeriod": {
      if (!("hour" in dv.toValue(placeholderValue))) return

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
        next = dv.set("dayPeriod", 0, placeholderValue)
      } else if (pm.toLowerCase().startsWith(lowerInput)) {
        next = dv.set("dayPeriod", 1, placeholderValue)
      } else {
        break
      }

      setDisplayValue(ctx, index, next)
      goToNextSegment(ctx)
      break
    }
    case "era": {
      const eras = dv.calendar.getEras()

      // Try to match input against formatted era names
      const eraFormatter = new DateFormatter(prop("locale"), { era: "short" })
      const lowerInput = input.toLowerCase()

      for (let i = 0; i < eras.length; i++) {
        const eraDate = dv.toValue(placeholderValue).set({ year: 1 }).toDate(prop("timeZone"))
        const formattedEra = eraFormatter.formatToParts(eraDate).find((p) => p.type === "era")?.value
        if (formattedEra && formattedEra.toLowerCase().startsWith(lowerInput)) {
          next = dv.set("era", eras[i], placeholderValue)
          setDisplayValue(ctx, index, next)
          goToNextSegment(ctx)
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

      const shouldSetValue = segmentValue !== 0 || allowsZero
      if (shouldSetValue) {
        dv = dv.set(type, segmentValue, placeholderValue)
        next = dv
        setDisplayValue(ctx, index, dv)
      }

      if (
        segment.maxValue !== undefined &&
        (Number(numberValue + "0") > segment.maxValue || newValue.length >= String(segment.maxValue).length)
      ) {
        context.set("enteredKeys", "")
        if (shouldSetValue) {
          goToNextSegment(ctx)
        }
      } else {
        context.set("enteredKeys", newValue)
      }
      break
    }
  }

  return next
}
