import { DateFormatter } from "@internationalized/date"
import { createGuards, createMachine, type Params, type PropFn } from "@zag-js/core"
import {
  alignDate,
  constrainValue,
  formatSelectedDate,
  getAdjustedDateFn,
  getDecadeRange,
  getEndDate,
  getNextPage,
  getNextSection,
  getPreviousPage,
  getPreviousSection,
  getTodayDate,
  isDateEqual,
  isDateOutsideRange,
  isNextRangeInvalid,
  isPreviousRangeInvalid,
  parseDateString,
  type AdjustDateReturn,
} from "@zag-js/date-utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import { disableTextSelection, raf, restoreTextSelection, setElementValue } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import { getPlacement, type Placement } from "@zag-js/popper"
import * as dom from "./date-picker.dom"
import type { DatePickerSchema, DateSegment, DateValue, DateView, Segments, SegmentType } from "./date-picker.types"
import {
  addSegment,
  adjustStartAndEndDate,
  clampView,
  defaultTranslations,
  eachView,
  EDITABLE_SEGMENTS,
  getDefaultValidSegments,
  getNextView,
  getPreviousView,
  isAboveMinView,
  isBelowMinView,
  isValidDate,
  processSegments,
  setSegment,
  sortDates,
  TYPE_MAPPING,
} from "./date-picker.utils"

const { and } = createGuards<DatePickerSchema>()

function isDateArrayEqual(a: DateValue[], b: DateValue[] | undefined) {
  if (a?.length !== b?.length) return false
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (!isDateEqual(a[i], b[i])) return false
  }
  return true
}

function getValueAsString(value: DateValue[], prop: PropFn<DatePickerSchema>) {
  return value.map((date) => prop("format")(date, { locale: prop("locale"), timeZone: prop("timeZone") }))
}

export const machine = createMachine<DatePickerSchema>({
  props({ props }) {
    const locale = props.locale || "en-US"
    const timeZone = props.timeZone || "UTC"
    const selectionMode = props.selectionMode || "single"
    const numOfMonths = props.numOfMonths || 1

    // sort and constrain dates
    const defaultValue = props.defaultValue
      ? sortDates(props.defaultValue).map((date) => constrainValue(date, props.min, props.max))
      : undefined
    const value = props.value
      ? sortDates(props.value).map((date) => constrainValue(date, props.min, props.max))
      : undefined

    // get initial focused value
    let focusedValue =
      props.focusedValue || props.defaultFocusedValue || value?.[0] || defaultValue?.[0] || getTodayDate(timeZone)
    focusedValue = constrainValue(focusedValue, props.min, props.max)

    // get initial placeholder value
    let placeholderValue =
      props.placeholderValue ||
      props.defaultPlaceholderValue ||
      value?.[0] ||
      defaultValue?.[0] ||
      getTodayDate(timeZone)
    placeholderValue = constrainValue(placeholderValue, props.min, props.max)

    // get the initial view
    const minView: DateView = "day"
    const maxView: DateView = "year"
    const defaultView = clampView(props.view || minView, minView, maxView)
    const granularity = props.granularity || "day"
    const translations = { ...defaultTranslations, ...props.translations }

    const formatter = new DateFormatter(locale, {
      timeZone: timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const allSegments = formatter
      .formatToParts(new Date())
      .filter((seg) => EDITABLE_SEGMENTS[seg.type])
      .reduce<Segments>((p, seg) => {
        const key = TYPE_MAPPING[seg.type as keyof typeof TYPE_MAPPING] || seg.type
        p[key] = true
        return p
      }, {})

    return {
      locale,
      numOfMonths,
      timeZone,
      selectionMode,
      defaultView,
      minView,
      maxView,
      outsideDaySelectable: false,
      closeOnSelect: true,
      format(date, { timeZone }) {
        return formatter.format(date.toDate(timeZone))
      },
      parse(value, { locale, timeZone }) {
        return parseDateString(value, locale, timeZone)
      },
      ...props,
      translations,
      focusedValue: typeof props.focusedValue === "undefined" ? undefined : focusedValue,
      defaultFocusedValue: focusedValue,
      value,
      defaultValue: defaultValue ?? [],
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
      granularity,
      formatter,
      placeholderValue: typeof props.placeholderValue === "undefined" ? undefined : placeholderValue,
      defaultPlaceholderValue: placeholderValue,
      allSegments,
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen") || prop("inline")
    return open ? "open" : "idle"
  },

  refs() {
    return {
      announcer: undefined,
    }
  },

  context({ prop, bindable, getContext }) {
    return {
      focusedValue: bindable<DateValue>(() => ({
        defaultValue: prop("defaultFocusedValue"),
        value: prop("focusedValue"),
        isEqual: isDateEqual,
        hash: (v) => v.toString(),
        sync: true,
        onChange(focusedValue) {
          const context = getContext()
          const view = context.get("view")
          const value = context.get("value")
          const valueAsString = getValueAsString(value, prop)
          prop("onFocusChange")?.({ value, valueAsString, view, focusedValue })
        },
      })),
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual: isDateArrayEqual,
        hash: (v) => v.map((date) => date.toString()).join(","),
        onChange(value) {
          const context = getContext()
          const valueAsString = getValueAsString(value, prop)
          prop("onValueChange")?.({ value, valueAsString, view: context.get("view") })
        },
      })),
      inputValue: bindable(() => ({
        defaultValue: "",
      })),
      activeIndex: bindable(() => ({
        defaultValue: 0,
        sync: true,
      })),
      activeSegmentIndex: bindable(() => ({
        defaultValue: -1,
        sync: true,
      })),
      hoveredValue: bindable<DateValue | null>(() => ({
        defaultValue: null,
        isEqual: (a, b) => b !== null && a !== null && isDateEqual(a, b),
      })),
      view: bindable(() => ({
        defaultValue: prop("defaultView"),
        value: prop("view"),
        onChange(value) {
          prop("onViewChange")?.({ view: value })
        },
      })),
      startValue: bindable(() => {
        const focusedValue = prop("focusedValue") || prop("defaultFocusedValue")
        return {
          defaultValue: alignDate(focusedValue, "start", { months: prop("numOfMonths") }, prop("locale")),
          isEqual: isDateEqual,
          hash: (v) => v.toString(),
        }
      }),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      restoreFocus: bindable<boolean | undefined>(() => ({
        defaultValue: false,
      })),
      placeholderValue: bindable<DateValue>(() => ({
        defaultValue: prop("defaultPlaceholderValue"),
        value: prop("placeholderValue"),
        isEqual: isDateEqual,
        hash: (v) => v.toString(),
        sync: true,
        onChange(placeholderValue) {
          const context = getContext()
          const view = context.get("view")
          const value = context.get("value")
          const valueAsString = getValueAsString(value, prop)
          prop("onPlaceholderChange")?.({ value, valueAsString, view, placeholderValue })
        },
      })),
      validSegments: bindable<Segments[]>(() => {
        return {
          defaultValue: getDefaultValidSegments(prop("value") || prop("defaultValue"), prop("allSegments")),
        }
      }),
    }
  },

  computed: {
    isInteractive: ({ prop }) => !prop("disabled") && !prop("readOnly"),
    visibleDuration: ({ prop }) => ({ months: prop("numOfMonths") }),
    endValue: ({ context, computed }) => getEndDate(context.get("startValue"), computed("visibleDuration")),
    visibleRange: ({ context, computed }) => ({ start: context.get("startValue"), end: computed("endValue") }),
    visibleRangeText({ context, prop, computed }) {
      const timeZone = prop("timeZone")
      const formatter = new DateFormatter(prop("locale"), { month: "long", year: "numeric", timeZone })
      const start = formatter.format(context.get("startValue").toDate(timeZone))
      const end = formatter.format(computed("endValue").toDate(timeZone))
      const formatted = prop("selectionMode") === "range" ? `${start} - ${end}` : start
      return { start, end, formatted }
    },
    isPrevVisibleRangeValid: ({ context, prop }) =>
      !isPreviousRangeInvalid(context.get("startValue"), prop("min"), prop("max")),
    isNextVisibleRangeValid: ({ prop, computed }) =>
      !isNextRangeInvalid(computed("endValue"), prop("min"), prop("max")),
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

  effects: ["setupLiveRegion"],

  watch({ track, prop, context, action, computed }) {
    track([() => prop("locale")], () => {
      action(["setStartValue"])
    })

    track([() => context.hash("focusedValue")], () => {
      action(["setStartValue", "focusActiveCellIfNeeded", "setHoveredValueIfKeyboard"])
    })

    // Ensure the month/year select reflect the actual visible start value
    track([() => context.hash("startValue")], () => {
      action(["syncMonthSelectElement", "syncYearSelectElement"])
    })

    track([() => context.get("inputValue")], () => {
      action(["syncInputValue"])
    })

    track([() => context.hash("value")], () => {
      action(["syncValidSegments", "syncInputElement"])
    })

    track([() => computed("valueAsString").toString()], () => {
      action(["announceValueText"])
    })

    track([() => context.get("view")], () => {
      action(["focusActiveCell"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })

    track([() => context.get("activeSegmentIndex")], () => {
      action(["focusActiveSegment"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setDateValue", "setFocusedDate"],
    },
    "VIEW.SET": {
      actions: ["setView"],
    },
    "FOCUS.SET": {
      actions: ["setFocusedDate"],
    },
    "VALUE.CLEAR": {
      actions: ["clearDateValue", "clearFocusedDate", "focusFirstInputElement"],
    },
    "INPUT.CHANGE": [
      {
        guard: "isInputValueEmpty",
        actions: ["setInputValue", "clearDateValue", "clearFocusedDate"],
      },
      {
        actions: ["setInputValue", "focusParsedDate"],
      },
    ],
    "INPUT.ENTER": {
      actions: ["focusParsedDate", "selectFocusedDate"],
    },
    "INPUT.FOCUS": {
      actions: ["setActiveIndex"],
    },
    "INPUT.BLUR": [
      {
        guard: "shouldFixOnBlur",
        actions: ["setActiveIndexToStart", "selectParsedDate"],
      },
      {
        actions: ["setActiveIndexToStart"],
      },
    ],
    "PRESET.CLICK": [
      {
        guard: "isOpenControlled",
        actions: ["setDateValue", "setFocusedDate", "invokeOnClose"],
      },
      {
        target: "focused",
        actions: ["setDateValue", "setFocusedDate", "focusInputElement"],
      },
    ],
    "GOTO.NEXT": [
      {
        guard: "isYearView",
        actions: ["focusNextDecade", "announceVisibleRange"],
      },
      {
        guard: "isMonthView",
        actions: ["focusNextYear", "announceVisibleRange"],
      },
      {
        actions: ["focusNextPage"],
      },
    ],
    "GOTO.PREV": [
      {
        guard: "isYearView",
        actions: ["focusPreviousDecade", "announceVisibleRange"],
      },
      {
        guard: "isMonthView",
        actions: ["focusPreviousYear", "announceVisibleRange"],
      },
      {
        actions: ["focusPreviousPage"],
      },
    ],
  },

  states: {
    idle: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell"],
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
          },
        ],
        "SEGMENT_GROUP.FOCUS": {
          target: "focused",
          actions: ["focusFirstSegment"],
        },
        "SEGMENT.FOCUS": {
          target: "focused",
          actions: ["setActiveSegmentIndex"],
        },
      },
    },

    focused: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell"],
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
          },
        ],
        "SEGMENT.FOCUS": {
          actions: ["setActiveSegmentIndex"],
        },
        "SEGMENT.ADJUST": {
          actions: ["invokeOnSegmentAdjust"],
        },
        "SEGMENT.ARROW_LEFT": {
          actions: ["focusPreviousSegment"],
        },
        "SEGMENT.ARROW_RIGHT": {
          actions: ["focusNextSegment"],
        },
        "SEGMENT.BACKSPACE": {
          actions: ["clearSegmentValue"],
        },
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackDismissableElement", "trackPositioning"],
      exit: ["clearHoveredDate", "resetView"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: and("shouldRestoreFocus", "isInteractOutsideEvent"),
            target: "focused",
            actions: ["focusTriggerElement"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["focusInputElement"],
          },
          {
            target: "idle",
          },
        ],
        "CELL.CLICK": [
          {
            guard: "isAboveMinView",
            actions: ["setFocusedValueForView", "setPreviousView"],
          },
          {
            guard: and("isRangePicker", "hasSelectedRange"),
            actions: ["setActiveIndexToStart", "resetSelection", "setActiveIndexToEnd"],
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "setRestoreFocus",
            ],
          },
          {
            guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
            target: "focused",
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "focusInputElement",
            ],
          },
          {
            guard: and("isRangePicker", "isSelectingEndDate"),
            actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToStart", "clearHoveredDate"],
          },
          // ===
          {
            guard: "isRangePicker",
            actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToEnd"],
          },
          {
            guard: "isMultiPicker",
            actions: ["setFocusedDate", "toggleSelectedDate"],
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and("closeOnSelect", "isOpenControlled"),
            actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose", "focusInputElement"],
          },
          {
            actions: ["setFocusedDate", "setSelectedDate"],
          },
          // ===
        ],
        "CELL.POINTER_MOVE": {
          guard: and("isRangePicker", "isSelectingEndDate"),
          actions: ["setHoveredDate", "setFocusedDate"],
        },
        "TABLE.POINTER_LEAVE": {
          guard: "isRangePicker",
          actions: ["clearHoveredDate"],
        },
        "TABLE.POINTER_DOWN": {
          actions: ["disableTextSelection"],
        },
        "TABLE.POINTER_UP": {
          actions: ["enableTextSelection"],
        },
        "TABLE.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: ["focusFirstSelectedDate", "invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["focusFirstSelectedDate", "invokeOnClose", "focusTriggerElement"],
          },
        ],
        "TABLE.ENTER": [
          {
            guard: "isAboveMinView",
            actions: ["setPreviousView"],
          },
          {
            guard: and("isRangePicker", "hasSelectedRange"),
            actions: ["setActiveIndexToStart", "clearDateValue", "setSelectedDate", "setActiveIndexToEnd"],
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
            actions: ["setSelectedDate", "setActiveIndexToStart", "clearHoveredDate", "invokeOnClose"],
          },
          {
            guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
            target: "focused",
            actions: [
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "focusInputElement",
            ],
          },
          {
            guard: and("isRangePicker", "isSelectingEndDate"),
            actions: ["setSelectedDate", "setActiveIndexToStart", "clearHoveredDate"],
          },
          // ===
          {
            guard: "isRangePicker",
            actions: ["setSelectedDate", "setActiveIndexToEnd", "focusNextDay"],
          },
          {
            guard: "isMultiPicker",
            actions: ["toggleSelectedDate"],
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and("closeOnSelect", "isOpenControlled"),
            actions: ["selectFocusedDate", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectFocusedDate", "invokeOnClose", "focusInputElement"],
          },
          {
            actions: ["selectFocusedDate"],
          },
          // ===
        ],
        "TABLE.ARROW_RIGHT": [
          {
            guard: "isMonthView",
            actions: ["focusNextMonth"],
          },
          {
            guard: "isYearView",
            actions: ["focusNextYear"],
          },
          {
            actions: ["focusNextDay", "setHoveredDate"],
          },
        ],
        "TABLE.ARROW_LEFT": [
          {
            guard: "isMonthView",
            actions: ["focusPreviousMonth"],
          },
          {
            guard: "isYearView",
            actions: ["focusPreviousYear"],
          },
          {
            actions: ["focusPreviousDay"],
          },
        ],
        "TABLE.ARROW_UP": [
          {
            guard: "isMonthView",
            actions: ["focusPreviousMonthColumn"],
          },
          {
            guard: "isYearView",
            actions: ["focusPreviousYearColumn"],
          },
          {
            actions: ["focusPreviousWeek"],
          },
        ],
        "TABLE.ARROW_DOWN": [
          {
            guard: "isMonthView",
            actions: ["focusNextMonthColumn"],
          },
          {
            guard: "isYearView",
            actions: ["focusNextYearColumn"],
          },
          {
            actions: ["focusNextWeek"],
          },
        ],
        "TABLE.PAGE_UP": {
          actions: ["focusPreviousSection"],
        },
        "TABLE.PAGE_DOWN": {
          actions: ["focusNextSection"],
        },
        "TABLE.HOME": [
          {
            guard: "isMonthView",
            actions: ["focusFirstMonth"],
          },
          {
            guard: "isYearView",
            actions: ["focusFirstYear"],
          },
          {
            actions: ["focusSectionStart"],
          },
        ],
        "TABLE.END": [
          {
            guard: "isMonthView",
            actions: ["focusLastMonth"],
          },
          {
            guard: "isYearView",
            actions: ["focusLastYear"],
          },
          {
            actions: ["focusSectionEnd"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        ],
        "VIEW.TOGGLE": {
          actions: ["setNextView"],
        },
        INTERACT_OUTSIDE: [
          {
            guard: "isOpenControlled",
            actions: ["setActiveIndexToStart", "invokeOnClose"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["setActiveIndexToStart", "invokeOnClose", "focusTriggerElement"],
          },
          {
            target: "idle",
            actions: ["setActiveIndexToStart", "invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["setActiveIndexToStart", "invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["setActiveIndexToStart", "invokeOnClose"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isAboveMinView: ({ context, prop }) => isAboveMinView(context.get("view"), prop("minView")),
      isDayView: ({ context, event }) => (event.view || context.get("view")) === "day",
      isMonthView: ({ context, event }) => (event.view || context.get("view")) === "month",
      isYearView: ({ context, event }) => (event.view || context.get("view")) === "year",
      isRangePicker: ({ prop }) => prop("selectionMode") === "range",
      hasSelectedRange: ({ context }) => context.get("value").length === 2,
      isMultiPicker: ({ prop }) => prop("selectionMode") === "multiple",
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
      isSelectingEndDate: ({ context }) => context.get("activeIndex") === 1,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != undefined || !!prop("inline"),
      isInteractOutsideEvent: ({ event }) => event.previousEvent?.type === "INTERACT_OUTSIDE",
      isInputValueEmpty: ({ event }) => event.value.trim() === "",
      shouldFixOnBlur: ({ event }) => !!event.fixOnBlur,
    },

    effects: {
      trackPositioning({ context, prop, scope }) {
        if (prop("inline")) return

        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement)
        }
        const anchorEl = dom.getControlEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(anchorEl, getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      setupLiveRegion({ scope, refs }) {
        const doc = scope.getDoc()
        refs.set("announcer", createLiveRegion({ level: "assertive", document: doc }))
        return () => refs.get("announcer")?.destroy?.()
      },

      trackDismissableElement({ scope, send, context, prop }) {
        if (prop("inline")) return

        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "popover",
          defer: true,
          exclude: [...dom.getInputEls(scope), dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
          onInteractOutside(event) {
            context.set("restoreFocus", !event.detail.focusable)
          },
          onDismiss() {
            send({ type: "INTERACT_OUTSIDE" })
          },
          onEscapeKeyDown(event) {
            event.preventDefault()
            send({ type: "TABLE.ESCAPE", src: "dismissable" })
          },
        })
      },
    },

    actions: {
      setNextView({ context, prop }) {
        const nextView = getNextView(context.get("view"), prop("minView"), prop("maxView"))
        context.set("view", nextView)
      },
      setPreviousView({ context, prop }) {
        const prevView = getPreviousView(context.get("view"), prop("minView"), prop("maxView"))
        context.set("view", prevView)
      },
      setView({ context, event }) {
        context.set("view", event.view)
      },
      setRestoreFocus({ context }) {
        context.set("restoreFocus", true)
      },
      announceValueText({ context, prop, refs }) {
        const announceText = context
          .get("value")
          .map((date) => formatSelectedDate(date, null, prop("locale"), prop("timeZone")))
        refs.get("announcer")?.announce(announceText.join(","), 3000)
      },
      announceVisibleRange({ computed, refs }) {
        const { formatted } = computed("visibleRangeText")
        refs.get("announcer")?.announce(formatted)
      },
      disableTextSelection({ scope }) {
        disableTextSelection({ target: dom.getContentEl(scope), doc: scope.getDoc() })
      },
      enableTextSelection({ scope }) {
        restoreTextSelection({ doc: scope.getDoc(), target: dom.getContentEl(scope) })
      },
      focusFirstSelectedDate(params) {
        const { context } = params
        if (!context.get("value").length) return
        setFocusedValue(params, context.get("value")[0])
      },
      syncInputElement({ scope, computed }) {
        raf(() => {
          const inputEls = dom.getInputEls(scope)
          inputEls.forEach((inputEl, index) => {
            setElementValue(inputEl, computed("valueAsString")[index] || "")
          })
        })
      },
      syncValidSegments({ context, prop }) {
        context.set("validSegments", getDefaultValidSegments(context.get("value"), prop("allSegments")))
      },
      setFocusedDate(params) {
        const { event } = params
        const value = Array.isArray(event.value) ? event.value[0] : event.value
        setFocusedValue(params, value)
      },
      setFocusedValueForView(params) {
        const { context, event } = params
        setFocusedValue(params, context.get("focusedValue").set({ [context.get("view")]: event.value }))
      },
      focusNextMonth(params) {
        const { context } = params
        setFocusedValue(params, context.get("focusedValue").add({ months: 1 }))
      },
      focusPreviousMonth(params) {
        const { context } = params
        setFocusedValue(params, context.get("focusedValue").subtract({ months: 1 }))
      },
      setDateValue({ context, event, prop }) {
        if (!Array.isArray(event.value)) return
        const value = event.value.map((date: DateValue) => constrainValue(date, prop("min"), prop("max")))
        context.set("value", value)
      },
      clearDateValue({ context }) {
        context.set("value", [])
      },
      setSelectedDate(params) {
        const { context, event } = params
        const values = Array.from(context.get("value"))
        values[context.get("activeIndex")] = normalizeValue(params, event.value ?? context.get("focusedValue"))
        context.set("value", adjustStartAndEndDate(values))
      },
      resetSelection(params) {
        const { context, event } = params
        const value = normalizeValue(params, event.value ?? context.get("focusedValue"))
        context.set("value", [value])
      },
      toggleSelectedDate(params) {
        const { context, event } = params
        const currentValue = normalizeValue(params, event.value ?? context.get("focusedValue"))
        const index = context.get("value").findIndex((date) => isDateEqual(date, currentValue))

        if (index === -1) {
          const values = [...context.get("value"), currentValue]
          context.set("value", sortDates(values))
        } else {
          const values = Array.from(context.get("value"))
          values.splice(index, 1)
          context.set("value", sortDates(values))
        }
      },
      setHoveredDate({ context, event }) {
        context.set("hoveredValue", event.value)
      },
      clearHoveredDate({ context }) {
        context.set("hoveredValue", null)
      },
      selectFocusedDate({ context, computed }) {
        const values = Array.from(context.get("value"))
        const activeIndex = context.get("activeIndex")
        values[activeIndex] = context.get("focusedValue").copy()
        context.set("value", adjustStartAndEndDate(values))

        // always sync the input value, even if the selecteddate is not changed
        // e.g. selected value is 02/28/2024, and the input value changed to 02/28
        const valueAsString = computed("valueAsString")
        context.set("inputValue", valueAsString[activeIndex])
      },
      focusPreviousDay(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").subtract({ days: 1 })
        setFocusedValue(params, nextValue)
      },
      focusNextDay(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").add({ days: 1 })
        setFocusedValue(params, nextValue)
      },
      focusPreviousWeek(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").subtract({ weeks: 1 })
        setFocusedValue(params, nextValue)
      },
      focusNextWeek(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").add({ weeks: 1 })
        setFocusedValue(params, nextValue)
      },
      focusNextPage(params) {
        const { context, computed, prop } = params
        const nextPage = getNextPage(
          context.get("focusedValue"),
          context.get("startValue"),
          computed("visibleDuration"),
          prop("locale"),
          prop("min"),
          prop("max"),
        )

        setAdjustedValue(params, nextPage)
      },
      focusPreviousPage(params) {
        const { context, computed, prop } = params
        const previousPage = getPreviousPage(
          context.get("focusedValue"),
          context.get("startValue"),
          computed("visibleDuration"),
          prop("locale"),
          prop("min"),
          prop("max"),
        )

        setAdjustedValue(params, previousPage)
      },
      focusSectionStart(params) {
        const { context } = params
        setFocusedValue(params, context.get("startValue").copy())
      },
      focusSectionEnd(params) {
        const { computed } = params
        setFocusedValue(params, computed("endValue").copy())
      },
      focusNextSection(params) {
        const { context, event, computed, prop } = params
        const nextSection = getNextSection(
          context.get("focusedValue"),
          context.get("startValue"),
          event.larger,
          computed("visibleDuration"),
          prop("locale"),
          prop("min"),
          prop("max"),
        )

        if (!nextSection) return
        setAdjustedValue(params, nextSection)
      },
      focusPreviousSection(params) {
        const { context, event, computed, prop } = params
        const previousSection = getPreviousSection(
          context.get("focusedValue"),
          context.get("startValue"),
          event.larger,
          computed("visibleDuration"),
          prop("locale"),
          prop("min"),
          prop("max"),
        )

        if (!previousSection) return
        setAdjustedValue(params, previousSection)
      },
      focusNextYear(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").add({ years: 1 })
        setFocusedValue(params, nextValue)
      },
      focusPreviousYear(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").subtract({ years: 1 })
        setFocusedValue(params, nextValue)
      },
      focusNextDecade(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").add({ years: 10 })
        setFocusedValue(params, nextValue)
      },
      focusPreviousDecade(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").subtract({ years: 10 })
        setFocusedValue(params, nextValue)
      },
      clearFocusedDate(params) {
        const { prop } = params
        setFocusedValue(params, getTodayDate(prop("timeZone")))
      },
      focusPreviousMonthColumn(params) {
        const { context, event } = params
        const nextValue = context.get("focusedValue").subtract({ months: event.columns })
        setFocusedValue(params, nextValue)
      },
      focusNextMonthColumn(params) {
        const { context, event } = params
        const nextValue = context.get("focusedValue").add({ months: event.columns })
        setFocusedValue(params, nextValue)
      },
      focusPreviousYearColumn(params) {
        const { context, event } = params
        const nextValue = context.get("focusedValue").subtract({ years: event.columns })
        setFocusedValue(params, nextValue)
      },
      focusNextYearColumn(params) {
        const { context, event } = params
        const nextValue = context.get("focusedValue").add({ years: event.columns })
        setFocusedValue(params, nextValue)
      },
      focusFirstMonth(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").set({ month: 1 })
        setFocusedValue(params, nextValue)
      },
      focusLastMonth(params) {
        const { context } = params
        const nextValue = context.get("focusedValue").set({ month: 12 })
        setFocusedValue(params, nextValue)
      },
      focusFirstYear(params) {
        const { context } = params
        const range = getDecadeRange(context.get("focusedValue").year)
        const nextValue = context.get("focusedValue").set({ year: range[0] })
        setFocusedValue(params, nextValue)
      },
      focusLastYear(params) {
        const { context } = params
        const range = getDecadeRange(context.get("focusedValue").year)
        const nextValue = context.get("focusedValue").set({ year: range[range.length - 1] })
        setFocusedValue(params, nextValue)
      },
      setActiveIndex({ context, event }) {
        context.set("activeIndex", event.index)
      },
      setActiveIndexToEnd({ context }) {
        context.set("activeIndex", 1)
      },
      setActiveIndexToStart({ context }) {
        context.set("activeIndex", 0)
      },
      focusActiveCell({ scope, context }) {
        raf(() => {
          const view = context.get("view")
          dom.getFocusedCell(scope, view)?.focus({ preventScroll: true })
        })
      },
      focusActiveCellIfNeeded({ scope, context, event }) {
        if (!event.focus) return
        raf(() => {
          const view = context.get("view")
          dom.getFocusedCell(scope, view)?.focus({ preventScroll: true })
        })
      },
      setHoveredValueIfKeyboard({ context, event, prop }) {
        if (
          !event.type.startsWith("TABLE.ARROW") ||
          prop("selectionMode") !== "range" ||
          context.get("activeIndex") === 0
        )
          return
        context.set("hoveredValue", context.get("focusedValue").copy())
      },
      focusTriggerElement({ scope }) {
        raf(() => {
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        })
      },
      focusFirstInputElement({ scope }) {
        raf(() => {
          const [inputEl] = dom.getInputEls(scope)
          inputEl?.focus({ preventScroll: true })
        })
      },
      focusInputElement({ scope }) {
        raf(() => {
          const inputEls = dom.getInputEls(scope)

          const lastIndexWithValue = inputEls.findLastIndex((inputEl) => inputEl.value !== "")
          const indexToFocus = Math.max(lastIndexWithValue, 0)

          const inputEl = inputEls[indexToFocus]
          inputEl?.focus({ preventScroll: true })
          // move cursor to the end
          inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length)
        })
      },

      syncMonthSelectElement({ scope, context }) {
        const monthSelectEl = dom.getMonthSelectEl(scope)
        setElementValue(monthSelectEl, context.get("startValue").month.toString())
      },

      syncYearSelectElement({ scope, context }) {
        const yearSelectEl = dom.getYearSelectEl(scope)
        setElementValue(yearSelectEl, context.get("startValue").year.toString())
      },

      setInputValue({ context, event }) {
        if (context.get("activeIndex") !== event.index) return
        context.set("inputValue", event.value)
      },

      syncInputValue({ scope, context, event }) {
        queueMicrotask(() => {
          const inputEls = dom.getInputEls(scope)
          const idx = event.index ?? context.get("activeIndex")
          setElementValue(inputEls[idx], context.get("inputValue"))
        })
      },

      focusParsedDate(params) {
        const { event, prop } = params

        if (event.index == null) return
        const parse = prop("parse")

        const date = parse(event.value, { locale: prop("locale"), timeZone: prop("timeZone") })
        if (!date || !isValidDate(date)) return

        setFocusedValue(params, date)
      },

      selectParsedDate({ context, event, prop }) {
        if (event.index == null) return

        const parse = prop("parse")
        let date = parse(event.value, { locale: prop("locale"), timeZone: prop("timeZone") })

        // reset to last valid date
        if (!date || !isValidDate(date)) {
          if (event.value) {
            date = context.get("focusedValue").copy()
          }
        }

        if (!date) return

        // constrain date to min/max range
        date = constrainValue(date, prop("min"), prop("max"))

        const values = Array.from(context.get("value"))
        values[event.index] = date

        context.set("value", values)

        // always sync the input value, even if the selecteddate is not changed
        // e.g. selected value is 02/28/2024, and the input value changed to 02/28
        const valueAsString = getValueAsString(values, prop)
        context.set("inputValue", valueAsString[event.index])
      },

      resetView({ context }) {
        context.set("view", context.initial("view"))
      },

      setStartValue({ context, computed, prop }) {
        const focusedValue = context.get("focusedValue")

        const outside = isDateOutsideRange(focusedValue, context.get("startValue"), computed("endValue"))
        if (!outside) return

        const startValue = alignDate(focusedValue, "start", { months: prop("numOfMonths") }, prop("locale"))
        context.set("startValue", startValue)
      },

      invokeOnOpen({ prop }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: false })
      },

      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },

      // SEGMENT

      setActiveSegmentIndex({ context, event }) {
        context.set("activeSegmentIndex", event.index)
      },

      focusFirstSegment({ scope }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const firstSegmentEl = segmentEls.find((el) => el.hasAttribute("data-editable"))
          firstSegmentEl?.focus({ preventScroll: true })
        })
      },

      focusNextSegment({ scope, context }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const nextSegmentEl = segmentEls
            .slice(context.get("activeSegmentIndex") + 1)
            .find((el) => el.hasAttribute("data-editable"))
          nextSegmentEl?.focus({ preventScroll: true })
        })
      },

      focusPreviousSegment({ scope, context }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const prevSegmentEl = segmentEls
            .slice(0, context.get("activeSegmentIndex"))
            .reverse()
            .find((el) => el.hasAttribute("data-editable"))
          prevSegmentEl?.focus({ preventScroll: true })
        })
      },

      focusActiveSegment({ scope, context }) {
        raf(() => {
          const segmentEls = dom.getSegmentEls(scope)
          const activeSegmentEl = segmentEls[context.get("activeSegmentIndex")]
          activeSegmentEl?.focus({ preventScroll: true })
        })
      },

      clearSegmentValue(params) {
        const { event, prop } = params
        const { segment } = event
        if (segment.isPlaceholder) {
          // focus previous segment if the current segment is already a placeholder
          return
        }

        const displayValue = getDisplayValue(params)
        const formatter = prop("formatter")

        const newValue = segment.text.slice(0, -1)

        if (newValue === "") {
          // clear segment value and mark as placeholder
          markSegmentInvalid(params, segment.type as DateSegment["type"])
          setValue(params, displayValue)
        } else {
          setValue(
            params,
            setSegment(displayValue, segment.type as DateSegment["type"], newValue, formatter.resolvedOptions()),
          )
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
          setValue(params, displayValue)
        } else {
          setValue(params, addSegment(displayValue, type, amount, formatter.resolvedOptions()))
        }
      },
    },
  },
})

const normalizeValue = (ctx: Params<DatePickerSchema>, value: number | DateValue) => {
  const { context, prop } = ctx
  const view = context.get("view")
  let dateValue = typeof value === "number" ? context.get("focusedValue").set({ [view]: value }) : value
  eachView((view) => {
    // normalize month and day
    if (isBelowMinView(view, prop("minView"))) {
      dateValue = dateValue.set({ [view]: view === "day" ? 1 : 0 })
    }
  })
  return dateValue
}

function setFocusedValue(ctx: Params<DatePickerSchema>, mixedValue: DateValue | number | undefined) {
  const { context, prop, computed } = ctx
  if (!mixedValue) return

  const value = normalizeValue(ctx, mixedValue)
  if (isDateEqual(context.get("focusedValue"), value)) return

  const adjustFn = getAdjustedDateFn(computed("visibleDuration"), prop("locale"), prop("min"), prop("max"))
  const adjustedValue = adjustFn({
    focusedDate: value,
    startDate: context.get("startValue"),
  })

  context.set("startValue", adjustedValue.startDate)
  context.set("focusedValue", adjustedValue.focusedDate)
}

function setAdjustedValue(ctx: Params<DatePickerSchema>, value: AdjustDateReturn) {
  const { context } = ctx
  context.set("startValue", value.startDate)
  const focusedValue = context.get("focusedValue")
  if (isDateEqual(focusedValue, value.focusedDate)) return
  context.set("focusedValue", value.focusedDate)
}

/**
 * If all segments are valid, use return value date, otherwise return the placeholder date.
 */
function getDisplayValue(ctx: Params<DatePickerSchema>) {
  const { context, prop } = ctx
  const index = context.get("activeIndex")
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const value = context.get("value")[index]
  const placeholderValue = context.get("placeholderValue")
  const activeValidSegments = validSegments[index]

  return value && Object.keys(activeValidSegments).length >= Object.keys(allSegments).length ? value : placeholderValue
}

function markSegmentInvalid(ctx: Params<DatePickerSchema>, segmentType: SegmentType) {
  const { context } = ctx
  const validSegments = context.get("validSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]

  if (activeValidSegments?.[segmentType]) {
    delete activeValidSegments[segmentType]
    context.set("validSegments", validSegments)
  }
}

function markSegmentValid(ctx: Params<DatePickerSchema>, segmentType: SegmentType) {
  const { context, prop } = ctx
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]

  if (!activeValidSegments?.[segmentType]) {
    activeValidSegments[segmentType] = true
    if (segmentType === "year" && allSegments.era) {
      activeValidSegments.era = true
    }
    context.set("validSegments", validSegments)
  }
}

function isAllSegmentsCompleted(ctx: Params<DatePickerSchema>) {
  const { context, prop } = ctx
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]
  const validKeys = Object.keys(activeValidSegments)
  const allKeys = Object.keys(allSegments)

  return (
    validKeys.length >= allKeys.length ||
    (validKeys.length === allKeys.length - 1 && allSegments.dayPeriod && !activeValidSegments.dayPeriod)
  )
}

function setValue(ctx: Params<DatePickerSchema>, value: DateValue) {
  const { context, prop } = ctx
  if (prop("disabled") || prop("readOnly")) return
  const validSegments = context.get("validSegments")
  const allSegments = prop("allSegments")
  const index = context.get("activeIndex")
  const activeValidSegments = validSegments[index]
  const validKeys = Object.keys(activeValidSegments)
  const date = constrainValue(value, prop("min"), prop("max"))

  // if all the segments are completed or a timefield with everything but am/pm set the time, also ignore when am/pm cleared
  if (value == null) {
    // setDate(null)
    // setPlaceholderDate(createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone))
    // setValidSegments({})
  } else if (
    // (validKeys.length === 0 && clearedSegment.current == null) || // FIXIT: figure out what is clearedSegment.current used for
    isAllSegmentsCompleted(ctx)
    // && clearedSegment.current !== "dayPeriod" // FIXIT: figure out what is clearedSegment.current used for
  ) {
    // If the field was empty (no valid segments) or all segments are completed, commit the new value.
    // When committing from an empty state, mark every segment as valid so value is committed.
    if (validKeys.length === 0) {
      validSegments[index] = { ...allSegments }
      context.set("validSegments", validSegments)
    }

    const values = Array.from(context.get("value"))
    values[index] = date
    context.set("value", values)
  } else {
    context.set("placeholderValue", date)
  }
  // clearedSegment.current = null // FIXIT: figure out what is clearedSegment.current used for
}
