import { DateFormatter, toCalendarDateTime } from "@internationalized/date"
import { createMachine, type Params } from "@zag-js/core"
import { constrainValue, getTodayDate, isDateEqual } from "@zag-js/date-utils"
import { raf } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import * as dom from "./date-input.dom"
import type { DateInputSchema, DateSegment, DateValue, SegmentType } from "./date-input.types"
import { IncompleteDate, type HourCycle } from "./utils/incomplete-date"
import { updateSegmentValue } from "./utils/input"
import { defaultTranslations } from "./utils/placeholders"
import { EDITABLE_SEGMENTS, getSegmentLabel, processSegments, TYPE_MAPPING } from "./utils/segments"
import type { Segments } from "./date-input.types"
import {
  getActiveDisplayValue,
  getActiveSegment,
  getGroupOffset,
  resolveActiveSegment,
  setDisplayValue,
} from "./utils/validity"
import { getValueAsString } from "./utils/formatting"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvedHourCycle(formatter: DateFormatter): HourCycle {
  const hc = formatter.resolvedOptions().hourCycle
  if (hc === "h11" || hc === "h12" || hc === "h23" || hc === "h24") return hc
  return "h23"
}

/**
 * Build the initial displayValues array.
 * If a value is committed, initialise each IncompleteDate from it (all fields non-null).
 * Otherwise create an empty IncompleteDate (all fields null = all segments are placeholders).
 */
function initDisplayValues(
  value: DateValue[] | undefined,
  placeholderValue: DateValue,
  hourCycle: HourCycle,
  count: number,
): IncompleteDate[] {
  const calendar = placeholderValue.calendar
  if (value?.length) {
    return Array.from({ length: count }, (_, i) =>
      value[i] ? new IncompleteDate(calendar, hourCycle, value[i]) : new IncompleteDate(calendar, hourCycle),
    )
  }
  return Array.from({ length: count }, () => new IncompleteDate(calendar, hourCycle))
}

function incompleteDateHash(dv: IncompleteDate): string {
  return `${dv.year}|${dv.month}|${dv.day}|${dv.hour}|${dv.dayPeriod}|${dv.minute}|${dv.second}|${dv.era}`
}

function incompleteDateEqual(a: IncompleteDate, b: IncompleteDate): boolean {
  return incompleteDateHash(a) === incompleteDateHash(b)
}

export const machine = createMachine<DateInputSchema>({
  props({ props }) {
    const locale = props.locale || "en-US"
    const timeZone = props.timeZone || "UTC"
    const selectionMode = props.selectionMode || "single"
    const granularity = props.granularity || "day"
    const translations = { ...defaultTranslations, ...props.translations }

    // sort and constrain dates
    const defaultValue = props.defaultValue
      ? props.defaultValue.map((date) => constrainValue(date, props.min, props.max))
      : undefined
    const value = props.value ? props.value.map((date) => constrainValue(date, props.min, props.max)) : undefined

    // get initial placeholder value
    let placeholderValue =
      props.placeholderValue ||
      props.defaultPlaceholderValue ||
      value?.[0] ||
      defaultValue?.[0] ||
      getTodayDate(timeZone)
    placeholderValue = constrainValue(placeholderValue, props.min, props.max)

    // When granularity requires time fields, ensure the placeholder is a CalendarDateTime
    // so that IncompleteDate.cycle() and toValue() can properly handle hour/minute/second.
    const needsTime = granularity === "hour" || granularity === "minute" || granularity === "second"
    if (needsTime && !("hour" in placeholderValue)) {
      placeholderValue = toCalendarDateTime(placeholderValue)
    }

    const hourCycle = props.hourCycle === 12 ? "h12" : props.hourCycle === 24 ? "h23" : undefined
    const shouldForceLeadingZeros = props.shouldForceLeadingZeros ?? false
    const digitStyle = shouldForceLeadingZeros ? "2-digit" : "numeric"

    const formatterOptions: Intl.DateTimeFormatOptions = {
      timeZone: timeZone,
      day: digitStyle,
      month: digitStyle,
      year: "numeric",
      hourCycle,
    }
    if (granularity === "hour" || granularity === "minute" || granularity === "second") {
      formatterOptions.hour = digitStyle
    }
    if (granularity === "minute" || granularity === "second") {
      formatterOptions.minute = "2-digit"
    }
    if (granularity === "second") {
      formatterOptions.second = "2-digit"
    }

    const formatter = props.formatter ?? new DateFormatter(locale, formatterOptions)

    // Always include 'era' for BC date support. Era is auto-set alongside year,
    // and the era segment is only rendered when the display value is in BC era.
    const allSegments =
      props.allSegments ??
      (() => {
        const segs = formatter
          .formatToParts(new Date())
          .filter((seg) => EDITABLE_SEGMENTS[seg.type])
          .reduce<Segments>((p, seg) => {
            const key = TYPE_MAPPING[seg.type as keyof typeof TYPE_MAPPING] || seg.type
            p[key] = true
            return p
          }, {})
        segs.era = true
        return segs
      })()

    return {
      locale,
      timeZone,
      selectionMode,
      format(date, { timeZone }) {
        const jsd = date.toDate(timeZone)
        const isBC = date.calendar?.identifier === "gregory" && date.era === "BC"
        if (isBC) {
          // Use proleptic Gregorian year: 0 for 1 BC, -1 for 2 BC, etc.
          const prolYear = jsd.getUTCFullYear()
          const safeDate = new Date(Date.UTC(2000, jsd.getUTCMonth(), jsd.getUTCDate()))
          return formatter
            .formatToParts(safeDate)
            .map((p) => (p.type === "year" ? String(prolYear) : p.value))
            .join("")
        }
        return formatter.format(jsd)
      },
      ...props,
      translations,
      value,
      defaultValue: defaultValue ?? [],
      granularity,
      shouldForceLeadingZeros,
      formatter,
      placeholderValue: typeof props.placeholderValue === "undefined" ? undefined : placeholderValue,
      defaultPlaceholderValue: placeholderValue,
      allSegments,
    }
  },

  initialState() {
    return "idle"
  },

  refs() {
    return {
      announcer: null,
      segmentToAnnounceIndex: null,
    }
  },

  effects: ["setupLiveRegion"],

  context({ prop, bindable }) {
    const formatter = prop("formatter")
    const hc = resolvedHourCycle(formatter)
    const placeholderValue = prop("defaultPlaceholderValue")
    const selectionMode = prop("selectionMode")
    const groupCount = selectionMode === "range" ? 2 : 1
    const initialValue = prop("value") || prop("defaultValue")

    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual(a, b) {
          if (a?.length !== b?.length) return false
          const len = Math.max(a.length, b.length)
          for (let i = 0; i < len; i++) {
            if (!isDateEqual(a[i], b[i])) return false
          }
          return true
        },
        hash: (v) => v.map((date) => date?.toString() ?? "").join(","),
        onChange(value) {
          const valueAsString = getValueAsString(value, prop)
          prop("onValueChange")?.({ value, valueAsString })
        },
      })),
      activeIndex: bindable(() => ({
        defaultValue: 0,
        sync: true,
      })),
      activeSegmentIndex: bindable(() => ({
        defaultValue: -1,
        sync: true,
      })),
      placeholderValue: bindable<DateValue>(() => ({
        defaultValue: prop("defaultPlaceholderValue"),
        isEqual: isDateEqual,
        hash: (v) => v.toString(),
        sync: true,
        onChange(placeholderValue) {
          prop("onPlaceholderChange")?.({ value: prop("value") ?? [], valueAsString: [], placeholderValue })
        },
      })),
      displayValues: bindable<IncompleteDate[]>(() => ({
        defaultValue: initDisplayValues(
          initialValue,
          placeholderValue ?? getTodayDate(prop("timeZone")),
          hc,
          groupCount,
        ),
        isEqual: (a, b) => b != null && a.length === b.length && a.every((d, i) => incompleteDateEqual(d, b[i]!)),
        hash: (v) => v.map(incompleteDateHash).join("||"),
      })),
      enteredKeys: bindable(() => ({
        defaultValue: "",
        sync: true,
      })),
    }
  },

  computed: {
    isInteractive: ({ prop }) => !prop("disabled") && !prop("readOnly"),
    valueAsString: ({ context, prop }) => getValueAsString(context.get("value"), prop),
    segments: ({ context, prop }) => {
      const value = context.get("value")
      const selectionMode = prop("selectionMode")
      const placeholderValue = context.get("placeholderValue")
      const displayValues = context.get("displayValues")
      const allSegments = prop("allSegments")
      const timeZone = prop("timeZone")
      const translations = prop("translations") || defaultTranslations
      const granularity = prop("granularity")
      const formatter = prop("formatter")
      const allSegmentTypes = Object.keys(allSegments) as SegmentType[]
      const locale = prop("locale")

      const groupCount = selectionMode === "range" ? 2 : 1

      return Array.from({ length: groupCount }, (_, i) => {
        const dv = displayValues[i] ?? new IncompleteDate(placeholderValue.calendar, resolvedHourCycle(formatter))
        // When all segments are filled, use the committed value for display; otherwise
        // fall back through the IncompleteDate's toValue() which fills missing fields from placeholderValue.
        const committedValue = value?.[i]
        const isFullyCommitted = committedValue && dv.isComplete(allSegmentTypes)
        const displayDate = isFullyCommitted ? committedValue : dv.toValue(placeholderValue)

        // Show the era segment when the display value is in BC era (Gregorian calendar).
        // Create the era formatter inline (React Aria pattern) — no dedicated prop needed.
        const showEra = dv.era === "BC" && dv.calendar.identifier === "gregory"
        const segmentFormatter = showEra
          ? new DateFormatter(locale, { ...(formatter.resolvedOptions() as Intl.DateTimeFormatOptions), era: "short" })
          : formatter

        return processSegments({
          dateValue: displayDate.toDate(timeZone),
          displayValue: dv,
          formatter: segmentFormatter,
          locale: prop("locale"),
          translations,
          granularity,
        })
      })
    },
  },

  watch({ track, context, prop, action }) {
    track([() => context.hash("value")], () => {
      action(["syncDisplayValues"])
    })

    track([() => context.get("activeSegmentIndex")], () => {
      action(["focusActiveSegment"])
    })

    track([() => prop("placeholderValue")?.toString()], () => {
      action(["syncPlaceholderProp"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setDateValue"],
    },
    "VALUE.CLEAR": {
      actions: ["clearDateValue", "clearDisplayValues", "clearEnteredKeys"],
    },
  },

  states: {
    idle: {
      on: {
        "SEGMENT.FOCUS": {
          target: "focused",
          actions: ["setActiveSegmentIndex", "invokeOnFocus"],
        },
      },
    },

    focused: {
      on: {
        "SEGMENT.FOCUS": {
          actions: ["setActiveSegmentIndex", "clearEnteredKeys"],
        },
        "SEGMENT.BLUR": {
          target: "idle",
          actions: ["confirmPlaceholder", "clearEnteredKeys", "invokeOnBlur"],
        },
        "SEGMENT.INPUT": {
          actions: ["setSegmentValue", "announceSegmentValue"],
        },
        "SEGMENT.ADJUST": {
          actions: ["invokeOnSegmentAdjust", "clearEnteredKeys", "announceSegmentValue"],
        },
        "SEGMENT.ARROW_LEFT": {
          actions: ["setPreviousActiveSegmentIndex", "clearEnteredKeys"],
        },
        "SEGMENT.ARROW_RIGHT": {
          actions: ["setNextActiveSegmentIndex", "clearEnteredKeys"],
        },
        "SEGMENT.BACKSPACE": [
          {
            guard: "isActiveSegmentPlaceholder",
            actions: ["setPreviousActiveSegmentIndex", "clearEnteredKeys"],
          },
          {
            actions: ["clearSegmentValue", "clearEnteredKeys", "announceSegmentValue"],
          },
        ],
        "SEGMENT.HOME": {
          actions: ["setSegmentToLowestValue", "clearEnteredKeys", "announceSegmentValue"],
        },
        "SEGMENT.END": {
          actions: ["setSegmentToHighestValue", "clearEnteredKeys", "announceSegmentValue"],
        },
      },
    },
  },

  implementations: {
    effects: {
      setupLiveRegion({ scope, refs }) {
        const liveRegion = createLiveRegion({
          level: "assertive",
          document: scope.getDoc(),
        })
        refs.set("announcer", liveRegion)
        return () => liveRegion.destroy()
      },
    },

    guards: {
      isActiveSegmentPlaceholder: (ctx) => {
        const hasEnteredKeys = ctx.context.get("enteredKeys") !== ""
        if (hasEnteredKeys) return false
        return getActiveSegment(ctx)?.isPlaceholder === true
      },
    },

    actions: {
      invokeOnFocus({ prop }) {
        prop("onFocusChange")?.({ focused: true })
      },

      invokeOnBlur({ prop }) {
        prop("onFocusChange")?.({ focused: false })
      },

      setActiveSegmentIndex({ context, event }) {
        if (event.dateIndex != null) {
          context.set("activeIndex", event.dateIndex)
        }
        context.set("activeSegmentIndex", event.segmentIndex)
      },

      clearDisplayValues({ context, prop }) {
        const formatter = prop("formatter")
        const hc = resolvedHourCycle(formatter)
        const placeholderValue = context.get("placeholderValue")
        const selectionMode = prop("selectionMode")
        const count = selectionMode === "range" ? 2 : 1
        context.set(
          "displayValues",
          Array.from({ length: count }, () => new IncompleteDate(placeholderValue.calendar, hc)),
        )
      },

      clearEnteredKeys({ context }) {
        context.set("enteredKeys", "")
      },

      setPreviousActiveSegmentIndex(ctx) {
        const { context } = ctx
        const index = context.get("activeIndex")
        const { allSegments, segments, offset, localIndex } = resolveActiveSegment(ctx)
        const prevLocalIndex = segments.findLastIndex((segment, i) => i < localIndex && segment.isEditable)

        if (prevLocalIndex !== -1) {
          context.set("activeSegmentIndex", offset + prevLocalIndex)
          return
        }

        // Go to previous group's last editable segment (e.g. range mode)
        const prevGroupIndex = index - 1
        if (prevGroupIndex < 0) return
        const prevGroupSegments = allSegments[prevGroupIndex]
        if (!prevGroupSegments) return
        const lastPrevGroupEditableLocalIndex = prevGroupSegments.findLastIndex((s) => s.isEditable)
        if (lastPrevGroupEditableLocalIndex === -1) return
        context.set("activeIndex", prevGroupIndex)
        context.set("activeSegmentIndex", getGroupOffset(allSegments, prevGroupIndex) + lastPrevGroupEditableLocalIndex)
      },

      setNextActiveSegmentIndex(ctx) {
        const { context } = ctx
        const { segments, offset, localIndex } = resolveActiveSegment(ctx)
        const nextLocalIndex = segments.findIndex((segment, i) => i > localIndex && segment.isEditable)
        if (nextLocalIndex === -1) return
        context.set("activeSegmentIndex", offset + nextLocalIndex)
      },

      focusActiveSegment({ scope, context }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const activeSegmentEl = segmentEls[context.get("activeSegmentIndex")]
          activeSegmentEl?.focus({ preventScroll: true })
        })
      },

      clearSegmentValue(params) {
        const { context, prop, event } = params
        const index = context.get("activeIndex")
        const allSegments = prop("allSegments")
        const allSegmentTypes = Object.keys(allSegments) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")

        const segment = getActiveSegment(params) ?? event.segment
        const type = segment.type as DateSegment["type"]

        let dv = getActiveDisplayValue(params)

        // dayPeriod: toggle AM/PM
        if (type === "dayPeriod") {
          const cleared = dv.clear(type)
          setDisplayValue(params, index, cleared)
          if (cleared.isCleared(allSegmentTypes)) commitClear(params, index)
          return
        }

        // hour: when clearing in 12h mode, preserve AM/PM context via clear
        if (type === "hour") {
          const cleared = dv.clear(type)
          setDisplayValue(params, index, cleared)
          if (cleared.isCleared(allSegmentTypes)) commitClear(params, index)
          return
        }

        const enteredKeys = context.get("enteredKeys")
        const textToUse = enteredKeys !== "" ? enteredKeys : segment.text
        const newValue = textToUse.slice(0, -1)

        if (newValue === "" || newValue === "0") {
          const cleared = dv.clear(type)
          setDisplayValue(params, index, cleared)
          if (cleared.isCleared(allSegmentTypes)) commitClear(params, index)
        } else {
          dv = dv.set(type, Number(newValue), placeholderValue)
          setDisplayValue(params, index, dv)
          // Re-check: if now complete, commit
          if (dv.isComplete(allSegmentTypes)) {
            commitValue(params, index, dv)
          }
        }
      },

      invokeOnSegmentAdjust(params) {
        const { context, prop, event } = params
        const { segment, amount } = event
        const type = segment.type as DateSegment["type"]
        const index = context.get("activeIndex")
        const allSegments = prop("allSegments")
        const allSegmentTypes = Object.keys(allSegments) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")
        const displaySegmentTypes = allSegmentTypes

        const dv = getActiveDisplayValue(params)
        const next = dv.cycle(type, amount, placeholderValue, displaySegmentTypes)
        setDisplayValue(params, index, next)

        if (next.isComplete(allSegmentTypes)) {
          commitValue(params, index, next)
        }
      },

      setSegmentValue(params) {
        const { event, context, refs } = params
        const { segment, input } = event
        // Save segment index before updateSegmentValue may advance (announce the updated segment, not the one we move to)
        refs.set("segmentToAnnounceIndex", context.get("activeSegmentIndex"))
        // Capture the active group index BEFORE updateSegmentValue, which may advance to the next group
        const index = context.get("activeIndex")
        updateSegmentValue(params, segment, input)
        // After the set, check if we should commit (using the original group, not the one we may have advanced to)
        const allSegmentTypes = Object.keys(params.prop("allSegments")) as SegmentType[]
        const dv = context.get("displayValues")[index]
        if (dv && dv.isComplete(allSegmentTypes)) {
          commitValue(params, index, dv)
        }
      },

      setSegmentToLowestValue(params) {
        const { event, context, prop } = params
        const { segment } = event
        const index = context.get("activeIndex")
        const allSegmentTypes = Object.keys(prop("allSegments")) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")
        if (segment.minValue == null) return
        const dv = getActiveDisplayValue(params).set(segment.type as SegmentType, segment.minValue, placeholderValue)
        setDisplayValue(params, index, dv)
        if (dv.isComplete(allSegmentTypes)) commitValue(params, index, dv)
      },

      setSegmentToHighestValue(params) {
        const { event, context, prop } = params
        const { segment } = event
        const index = context.get("activeIndex")
        const allSegmentTypes = Object.keys(prop("allSegments")) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")
        if (segment.maxValue == null) return
        const dv = getActiveDisplayValue(params).set(segment.type as SegmentType, segment.maxValue, placeholderValue)
        setDisplayValue(params, index, dv)
        if (dv.isComplete(allSegmentTypes)) commitValue(params, index, dv)
      },

      setDateValue({ context, event, prop }) {
        if (!Array.isArray(event.value)) return
        const value = event.value.map((date: DateValue) => constrainValue(date, prop("min"), prop("max")))
        context.set("value", value)
      },

      clearDateValue({ context }) {
        context.set("value", [])
      },

      syncDisplayValues({ context, prop }) {
        const value = context.get("value")
        const formatter = prop("formatter")
        const hc = resolvedHourCycle(formatter)
        const placeholderValue = context.get("placeholderValue")
        const selectionMode = prop("selectionMode")
        const count = selectionMode === "range" ? 2 : 1
        // Re-initialise displayValues from the committed value so that each
        // IncompleteDate reflects all the user's typed fields.
        context.set("displayValues", initDisplayValues(value?.length ? value : undefined, placeholderValue, hc, count))
      },

      syncPlaceholderProp({ prop, context }) {
        const propValue = prop("placeholderValue")
        if (propValue) {
          context.set("placeholderValue", propValue)
          // Reset displayValues to empty so seeding restarts from the new placeholder.
          const formatter = prop("formatter")
          const hc = resolvedHourCycle(formatter)
          const selectionMode = prop("selectionMode")
          const count = selectionMode === "range" ? 2 : 1
          context.set(
            "displayValues",
            Array.from({ length: count }, () => new IncompleteDate(propValue.calendar, hc)),
          )
        }
      },

      announceSegmentValue({ refs, computed, context }) {
        const announcer = refs.get("announcer")
        if (!announcer) return

        const index = context.get("activeIndex")
        const activeSegmentIndex = context.get("activeSegmentIndex")
        // Use saved index when SEGMENT.INPUT advanced (we updated that segment, not the one we moved to)
        const segmentIndexToUse = refs.get("segmentToAnnounceIndex") ?? activeSegmentIndex
        refs.set("segmentToAnnounceIndex", null)
        const allSegments = computed("segments")
        const segment = allSegments[index]?.[segmentIndexToUse - getGroupOffset(allSegments, index)]

        if (!segment || segment.type === "literal") return

        const valueText = segment.isPlaceholder ? "Empty" : segment.text
        announcer.announce(`${getSegmentLabel(segment.type)}, ${valueText}`)
      },

      // On blur, if only dayPeriod is unfilled, auto-fill it and commit the value
      confirmPlaceholder(params) {
        const { context, prop } = params
        const allSegments = prop("allSegments")
        const allSegmentTypes = Object.keys(allSegments) as SegmentType[]
        const selectionMode = prop("selectionMode")
        const dateCount = selectionMode === "range" ? 2 : 1
        const placeholderValue = context.get("placeholderValue")

        for (let i = 0; i < dateCount; i++) {
          const dv = context.get("displayValues")[i]
          if (!dv) continue

          // If only dayPeriod is missing and all other segments are filled, auto-commit
          const allExceptDayPeriod = allSegmentTypes.filter((s) => s !== "dayPeriod")
          if (allSegments.dayPeriod && dv.isComplete(allExceptDayPeriod) && dv.dayPeriod == null) {
            const filled = dv.set(
              "dayPeriod",
              placeholderValue && "hour" in placeholderValue ? (placeholderValue.hour >= 12 ? 1 : 0) : 0,
              placeholderValue,
            )
            setDisplayValue(params, i, filled)
            commitValue(params, i, filled)
          }
        }
      },
    },
  },
})

// ---------------------------------------------------------------------------
// Internal commit helpers (not exported — only used by actions above)
// ---------------------------------------------------------------------------

type ActionParams = Params<DateInputSchema>

function commitValue(params: ActionParams, index: number, dv: IncompleteDate) {
  const { context, prop } = params
  const placeholderValue = context.get("placeholderValue")
  const date = constrainValue(dv.toValue(placeholderValue), prop("min"), prop("max"))
  const values = Array.from(context.get("value"))
  values[index] = date
  context.set("value", values)
}

function commitClear(params: ActionParams, index: number) {
  const { context } = params
  const values = context.get("value")
  if (index < values.length) {
    context.set("value", values.slice(0, index))
  }
}
