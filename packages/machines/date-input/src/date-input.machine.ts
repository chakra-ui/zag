import { DateFormatter } from "@internationalized/date"
import { createMachine, memo, type Params } from "@zag-js/core"
import { constrainValue, getTodayDate, isDateEqual } from "@zag-js/date-utils"
import { raf } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import * as dom from "./date-input.dom"
import type { DateInputSchema, DateSegment, DateValue, SegmentType } from "./date-input.types"
import {
  constrainValues,
  createFormatFn,
  getValueAsString,
  resolveHourCycleProp,
  resolvePlaceholderValue,
} from "./utils/formatting"
import {
  IncompleteDate,
  incompleteDateEqual,
  incompleteDateHash,
  initDisplayValues,
  resolvedHourCycle,
} from "./utils/incomplete-date"
import { updateSegmentValue } from "./utils/input"
import { defaultTranslations } from "./utils/placeholders"
import { getFormatterOptions, getSegmentLabel, processSegments, resolveAllSegments } from "./utils/segments"
import {
  getActiveDisplayValue,
  getActiveSegment,
  getGroupCount,
  getGroupOffset,
  resolveActiveSegment,
  setDisplayValue,
} from "./utils/validity"

export const machine = createMachine<DateInputSchema>({
  props({ props }) {
    const locale = props.locale || "en-US"
    const timeZone = props.timeZone || "UTC"
    const selectionMode = props.selectionMode || "single"
    const granularity = props.granularity || "day"
    const translations = { ...defaultTranslations, ...props.translations }

    const defaultValue = constrainValues(props.defaultValue, props.min, props.max)
    const value = constrainValues(props.value, props.min, props.max)

    const placeholderValue = resolvePlaceholderValue(props, timeZone, granularity, value, defaultValue)

    const hourCycle = resolveHourCycleProp(props.hourCycle)
    const shouldForceLeadingZeros = props.shouldForceLeadingZeros ?? false
    const digitStyle = shouldForceLeadingZeros ? "2-digit" : "numeric"

    const formatter =
      props.formatter ?? new DateFormatter(locale, getFormatterOptions(granularity, digitStyle, hourCycle, timeZone))
    const allSegments = props.allSegments ?? resolveAllSegments(formatter)

    return {
      locale,
      timeZone,
      selectionMode,
      format: createFormatFn(formatter),
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
    const initialValue = prop("value") || prop("defaultValue")
    const groupCount = getGroupCount(prop("selectionMode"))

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
    groupCount: ({ prop }) => getGroupCount(prop("selectionMode")),
    valueAsString: ({ context, prop }) => getValueAsString(context.get("value"), prop),
    segments: memo(
      ({ context, prop }) => [
        context.hash("value"),
        prop("selectionMode"),
        context.hash("placeholderValue"),
        context.hash("displayValues"),
        prop("allSegments"),
        prop("timeZone"),
        prop("translations"),
        prop("granularity"),
        prop("formatter"),
        prop("locale"),
      ],
      (_deps, { context, prop, computed }) => {
        const value = context.get("value")
        const placeholderValue = context.get("placeholderValue")
        const displayValues = context.get("displayValues")
        const allSegments = prop("allSegments")
        const timeZone = prop("timeZone")
        const translations = prop("translations") || defaultTranslations
        const granularity = prop("granularity")
        const formatter = prop("formatter")
        const locale = prop("locale")
        const allSegmentTypes = Object.keys(allSegments) as SegmentType[]

        return Array.from({ length: computed("groupCount") }, (_, i) => {
          const dv = displayValues[i] ?? new IncompleteDate(placeholderValue.calendar, resolvedHourCycle(formatter))
          // When all segments are filled, use the committed value for display; otherwise
          // fall back through the IncompleteDate's toValue() which fills missing fields from placeholderValue.
          const committedValue = value?.[i]
          const isFullyCommitted = committedValue && dv.isComplete(allSegmentTypes)
          const displayDate = isFullyCommitted ? committedValue : dv.toValue(placeholderValue)

          // Show the era segment when the display value is in BC era (Gregorian calendar).
          // Create the era formatter inline — no dedicated prop needed.
          const showEra = dv.era === "BC" && dv.calendar.identifier === "gregory"
          const segmentFormatter = showEra
            ? new DateFormatter(locale, {
                ...(formatter.resolvedOptions() as Intl.DateTimeFormatOptions),
                era: "short",
              })
            : formatter

          return processSegments({
            dateValue: displayDate.toDate(timeZone),
            displayValue: dv,
            formatter: segmentFormatter,
            locale,
            translations,
            granularity,
          })
        })
      },
    ),
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

    track([() => prop("defaultPlaceholderValue")?.toString()], () => {
      action(["syncDefaultPlaceholderValue"])
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

      clearDisplayValues({ context, prop, computed }) {
        const hc = resolvedHourCycle(prop("formatter"))
        const placeholderValue = context.get("placeholderValue")
        context.set(
          "displayValues",
          Array.from({ length: computed("groupCount") }, () => new IncompleteDate(placeholderValue.calendar, hc)),
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
        const displayValue = context.get("displayValues")[index]
        if (displayValue && displayValue.isComplete(allSegmentTypes)) {
          commitValue(params, index, displayValue)
        }
      },

      setSegmentToLowestValue(params) {
        const { event, context, prop } = params
        const { segment } = event
        const index = context.get("activeIndex")
        const allSegmentTypes = Object.keys(prop("allSegments")) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")
        if (segment.minValue == null) return
        const displayValue = getActiveDisplayValue(params).set(
          segment.type as SegmentType,
          segment.minValue,
          placeholderValue,
        )
        setDisplayValue(params, index, displayValue)
        if (displayValue.isComplete(allSegmentTypes)) commitValue(params, index, displayValue)
      },

      setSegmentToHighestValue(params) {
        const { event, context, prop } = params
        const { segment } = event
        const index = context.get("activeIndex")
        const allSegmentTypes = Object.keys(prop("allSegments")) as SegmentType[]
        const placeholderValue = context.get("placeholderValue")
        if (segment.maxValue == null) return
        const displayValue = getActiveDisplayValue(params).set(
          segment.type as SegmentType,
          segment.maxValue,
          placeholderValue,
        )
        setDisplayValue(params, index, displayValue)
        if (displayValue.isComplete(allSegmentTypes)) commitValue(params, index, displayValue)
      },

      setDateValue({ context, event, prop }) {
        if (!Array.isArray(event.value)) return
        const value = event.value.map((date: DateValue) => constrainValue(date, prop("min"), prop("max")))
        context.set("value", value)
      },

      clearDateValue({ context }) {
        context.set("value", [])
      },

      syncDisplayValues({ context, prop, computed }) {
        const value = context.get("value")
        const hc = resolvedHourCycle(prop("formatter"))
        const placeholderValue = context.get("placeholderValue")
        context.set(
          "displayValues",
          initDisplayValues(value?.length ? value : undefined, placeholderValue, hc, computed("groupCount")),
        )
      },

      syncDefaultPlaceholderValue({ prop, context }) {
        // Don't override an explicitly-provided placeholderValue prop
        if (prop("placeholderValue") != null) return
        const defaultPlaceholder = prop("defaultPlaceholderValue")
        if (!defaultPlaceholder) return
        // When granularity changes to a time-requiring value (e.g. "day" → "hour"),
        // defaultPlaceholderValue becomes a CalendarDateTime. Update the context
        // placeholder so that arrow-cycling on time segments initialises correctly.
        context.set("placeholderValue", defaultPlaceholder)
      },

      syncPlaceholderProp({ prop, context, computed }) {
        const propValue = prop("placeholderValue")
        if (propValue) {
          context.set("placeholderValue", propValue)
          const value = context.get("value")
          if (value?.length) {
            const hc = resolvedHourCycle(prop("formatter"))
            context.set("displayValues", initDisplayValues(value, propValue, hc, computed("groupCount")))
          }
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
        const { context, prop, computed } = params
        const allSegments = prop("allSegments")
        const allSegmentTypes = Object.keys(allSegments) as SegmentType[]
        const dateCount = computed("groupCount")
        const placeholderValue = context.get("placeholderValue")

        for (let i = 0; i < dateCount; i++) {
          const displayValue = context.get("displayValues")[i]
          if (!displayValue) continue

          // If only dayPeriod is missing and all other segments are filled, auto-commit
          const allExceptDayPeriod = allSegmentTypes.filter((s) => s !== "dayPeriod")
          if (allSegments.dayPeriod && displayValue.isComplete(allExceptDayPeriod) && displayValue.dayPeriod == null) {
            const filled = displayValue.set(
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
