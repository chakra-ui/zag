import { DateFormatter } from "@internationalized/date"
import { createMachine } from "@zag-js/core"
import { constrainValue, getTodayDate, isDateEqual } from "@zag-js/date-utils"
import { raf } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import * as dom from "./date-field.dom"
import type { DateFieldSchema, DateSegment, DateValue, Segments } from "./date-field.types"
import { addSegment, getDefaultValidSegments, setSegment } from "./utils/adjusters"
import { getValueAsString } from "./utils/formatting"
import { updateSegmentValue } from "./utils/input"
import { defaultTranslations } from "./utils/placeholders"
import { EDITABLE_SEGMENTS, getSegmentLabel, processSegments, TYPE_MAPPING } from "./utils/segments"
import { getActiveSegment, getDisplayValue, markSegmentInvalid, markSegmentValid, setValue } from "./utils/validity"

export const machine = createMachine<DateFieldSchema>({
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

    const hourCycle = props.hourCycle === 12 ? "h12" : props.hourCycle === 24 ? "h23" : undefined

    const formatterOptions: Intl.DateTimeFormatOptions = {
      timeZone: timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hourCycle,
    }
    if (granularity === "hour" || granularity === "minute" || granularity === "second") {
      formatterOptions.hour = "2-digit"
    }
    if (granularity === "minute" || granularity === "second") {
      formatterOptions.minute = "2-digit"
    }
    if (granularity === "second") {
      formatterOptions.second = "2-digit"
    }

    const formatter = props.formatter ?? new DateFormatter(locale, formatterOptions)

    const allSegments =
      props.allSegments ??
      formatter
        .formatToParts(new Date())
        .filter((seg) => EDITABLE_SEGMENTS[seg.type])
        .reduce<Segments>((p, seg) => {
          const key = TYPE_MAPPING[seg.type as keyof typeof TYPE_MAPPING] || seg.type
          p[key] = true
          return p
        }, {})

    return {
      locale,
      timeZone,
      selectionMode,
      format(date, { timeZone }) {
        return formatter.format(date.toDate(timeZone))
      },
      ...props,
      translations,
      value,
      defaultValue: defaultValue ?? [],
      granularity,
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

  context({ prop, bindable, getContext }) {
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
        value: prop("placeholderValue"),
        isEqual: isDateEqual,
        hash: (v) => v.toString(),
        sync: true,
        onChange(placeholderValue) {
          const context = getContext()
          const value = context.get("value")
          const valueAsString = getValueAsString(value, prop)
          prop("onPlaceholderChange")?.({ value, valueAsString, placeholderValue })
        },
      })),
      validSegments: bindable<Segments[]>(() => {
        return {
          defaultValue: getDefaultValidSegments(prop("value") || prop("defaultValue"), prop("allSegments")),
        }
      }),
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
      const validSegments = context.get("validSegments")
      const timeZone = prop("timeZone")
      const translations = prop("translations") || defaultTranslations
      const granularity = prop("granularity")
      const formatter = prop("formatter")

      let dates: DateValue[] = value?.length ? value : [placeholderValue]

      if (selectionMode === "range") {
        dates = value?.length ? value : [placeholderValue, placeholderValue]
      }

      return dates.map((date, i) => {
        const displayValue = date || placeholderValue
        const currentValidSegments = validSegments?.[i] || {}

        return processSegments({
          dateValue: displayValue.toDate(timeZone),
          displayValue,
          validSegments: currentValidSegments,
          formatter,
          locale: prop("locale"),
          translations,
          granularity,
        })
      })
    },
  },

  watch({ track, context, action }) {
    track([() => context.hash("value")], () => {
      action(["syncValidSegments"])
    })

    track([() => context.get("activeSegmentIndex")], () => {
      action(["focusActiveSegment"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setDateValue"],
    },
    "VALUE.CLEAR": {
      actions: ["clearDateValue", "clearPlaceholderDate", "clearEnteredKeys"],
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

      clearPlaceholderDate({ prop, context }) {
        context.set("placeholderValue", getTodayDate(prop("timeZone")))
      },

      clearEnteredKeys({ context }) {
        context.set("enteredKeys", "")
      },

      setPreviousActiveSegmentIndex({ context, computed }) {
        const index = context.get("activeIndex")
        const activeSegmentIndex = context.get("activeSegmentIndex")
        const segments = computed("segments")[index]
        const previousActiveSegmentIndex = segments.findLastIndex(
          (segment, i) => i < activeSegmentIndex && segment.isEditable,
        )
        if (previousActiveSegmentIndex === -1) return
        context.set("activeSegmentIndex", previousActiveSegmentIndex)
      },

      setNextActiveSegmentIndex({ context, computed }) {
        const index = context.get("activeIndex")
        const activeSegmentIndex = context.get("activeSegmentIndex")
        const segments = computed("segments")[index]
        const nextActiveSegmentIndex = segments.findIndex((segment, i) => i > activeSegmentIndex && segment.isEditable)
        if (nextActiveSegmentIndex === -1) return
        context.set("activeSegmentIndex", nextActiveSegmentIndex)
      },

      focusActiveSegment({ scope, context }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const activeSegmentEl = segmentEls[context.get("activeSegmentIndex")]
          activeSegmentEl?.focus({ preventScroll: true })
        })
      },

      clearSegmentValue(params) {
        const { event, prop, context } = params
        const { segment } = event

        const displayValue = getDisplayValue(params)
        const formatter = prop("formatter")
        const type = segment.type as DateSegment["type"]

        // dayPeriod: reset to placeholder's AM/PM
        if (type === "dayPeriod") {
          markSegmentInvalid(params, type)
          if ("hour" in displayValue) {
            const placeholderValue = context.get("placeholderValue")
            const isPM = displayValue.hour >= 12
            const shouldBePM = "hour" in placeholderValue && placeholderValue.hour >= 12
            if (isPM && !shouldBePM) {
              setValue(params, displayValue.set({ hour: displayValue.hour - 12 }))
            } else if (!isPM && shouldBePM) {
              setValue(params, displayValue.set({ hour: displayValue.hour + 12 }))
            } else {
              setValue(params, displayValue)
            }
          }
          return
        }

        // hour: when clearing in 12h mode, preserve AM/PM context
        if (type === "hour" && "hour" in displayValue && formatter.resolvedOptions().hour12) {
          const validSegments = context.get("validSegments")
          const index = context.get("activeIndex")
          const activeValidSegments = validSegments[index]
          const placeholderValue = context.get("placeholderValue")

          markSegmentInvalid(params, type)
          if (displayValue.hour >= 12 && activeValidSegments?.dayPeriod && "hour" in placeholderValue) {
            setValue(params, displayValue.set({ hour: placeholderValue.hour + 12 }))
          } else {
            setValue(params, displayValue)
          }
          return
        }

        const newValue = segment.text.slice(0, -1)

        if (newValue === "" || newValue === "0") {
          markSegmentInvalid(params, type)
          setValue(params, displayValue)
        } else {
          setValue(params, setSegment(displayValue, type, newValue, formatter.resolvedOptions()))
        }
      },

      invokeOnSegmentAdjust(params) {
        const { event, context, prop } = params
        const { segment, amount } = event
        const type = segment.type as DateSegment["type"]
        const validSegments = context.get("validSegments")
        const formatter = prop("formatter")
        const index = context.get("activeIndex")
        const activeValidSegments = validSegments[index]

        const displayValue = getDisplayValue(params)

        if (!activeValidSegments?.[type]) {
          markSegmentValid(params, type)
        }
        setValue(params, addSegment(displayValue, type, amount, formatter.resolvedOptions()))
      },

      setSegmentValue(params) {
        const { event, context, refs } = params
        const { segment, input } = event
        // Save segment index before updateSegmentValue may advance (announce the updated segment, not the one we move to)
        refs.set("segmentToAnnounceIndex", context.get("activeSegmentIndex"))
        updateSegmentValue(params, segment, input)
      },

      setSegmentToLowestValue(params) {
        const { event } = params
        const { segment } = event
        updateSegmentValue(params, segment, String(segment.minValue))
      },

      setSegmentToHighestValue(params) {
        const { event } = params
        const { segment } = event
        updateSegmentValue(params, segment, String(segment.maxValue))
      },

      setDateValue({ context, event, prop }) {
        if (!Array.isArray(event.value)) return
        const value = event.value.map((date: DateValue) => constrainValue(date, prop("min"), prop("max")))
        context.set("value", value)
      },

      clearDateValue({ context }) {
        context.set("value", [])
      },

      syncValidSegments({ context, prop }) {
        context.set("validSegments", getDefaultValidSegments(context.get("value"), prop("allSegments")))
      },

      announceSegmentValue({ refs, computed, context }) {
        const announcer = refs.get("announcer")
        if (!announcer) return

        const index = context.get("activeIndex")
        const activeSegmentIndex = context.get("activeSegmentIndex")
        // Use saved index when SEGMENT.INPUT advanced (we updated that segment, not the one we moved to)
        const segmentIndexToUse = refs.get("segmentToAnnounceIndex") ?? activeSegmentIndex
        refs.set("segmentToAnnounceIndex", null)
        const segments = computed("segments")[index]
        const segment = segments?.[segmentIndexToUse]

        if (!segment || segment.type === "literal") return

        const valueText = segment.isPlaceholder ? "Empty" : segment.text
        announcer.announce(`${getSegmentLabel(segment.type)}, ${valueText}`)
      },

      // On blur, if only dayPeriod is unfilled, auto-fill it and commit the value
      confirmPlaceholder(params) {
        const { context, prop } = params
        const allSegments = prop("allSegments")
        const validSegments = context.get("validSegments")
        const selectionMode = prop("selectionMode")
        const dateCount = selectionMode === "range" ? 2 : 1

        for (let i = 0; i < dateCount; i++) {
          const activeValidSegments = validSegments[i] || {}
          const validKeys = Object.keys(activeValidSegments)
          const allKeys = Object.keys(allSegments)

          if (validKeys.length === allKeys.length - 1 && allSegments.dayPeriod && !activeValidSegments.dayPeriod) {
            activeValidSegments.dayPeriod = true
            context.set("validSegments", validSegments)

            const displayValue = context.get("value")[i] || context.get("placeholderValue")
            const values = Array.from(context.get("value"))
            values[i] = constrainValue(displayValue, prop("min"), prop("max"))
            context.set("value", values)
          }
        }
      },
    },
  },
})
