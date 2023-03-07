import { DateFormatter } from "@internationalized/date"
import { createMachine, guards } from "@zag-js/core"
import {
  alignDate,
  formatSelectedDate,
  formatVisibleRange,
  getAdjustedDateFn,
  getEndDate,
  getFormatter,
  getNextDay,
  getNextSection,
  getPreviousDay,
  getPreviousSection,
  getTodayDate,
  isDateEqual,
  isNextVisibleRangeInvalid,
  isPreviousVisibleRangeInvalid,
  parseDateString,
} from "@zag-js/date-utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import { disableTextSelection, restoreTextSelection } from "@zag-js/text-selection"
import { compact } from "@zag-js/utils"
import { dom } from "./date-picker.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"
import { adjustStartAndEndDate, sortDates } from "./date-picker.utils"

const { and } = guards

function getContext(ctx: UserDefinedContext) {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const numOfMonths = ctx.numOfMonths || 1
  const visibleDuration = { months: numOfMonths, weeks: 6 }
  const focusedValue = getTodayDate(timeZone)
  const startValue = alignDate(focusedValue, "start", visibleDuration, locale)

  return {
    id: "1",
    view: "day" as const,
    locale,
    timeZone,
    numOfMonths,
    focusedValue,
    startValue,
    activeIndex: 0,
    highlightedRange: null,
    value: [],
    valueText: "",
    hoveredValue: null,
    inputValue: "",
    selectionMode: "single" as const,
    ...(ctx as any),
  }
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: ctx.inline ? "open" : "idle",
      context: getContext(ctx),
      computed: {
        isInteractive: (ctx) => !ctx.disabled && !ctx.readOnly,
        visibleDuration: (ctx) => ({ months: ctx.numOfMonths }),
        endValue: (ctx) => getEndDate(ctx.startValue, ctx.visibleDuration),
        visibleRange: (ctx) => ({ start: ctx.startValue, end: ctx.endValue }),
        visibleRangeText(ctx) {
          const formatter = getFormatter(ctx.locale, { month: "long", year: "numeric", timeZone: ctx.timeZone })
          const start = formatter.format(ctx.startValue.toDate(ctx.timeZone))
          const end = formatter.format(ctx.endValue.toDate(ctx.timeZone))
          return { start, end, formatted: formatVisibleRange(ctx.startValue, ctx.endValue, ctx.locale, ctx.timeZone) }
        },
        isPrevVisibleRangeValid: (ctx) => !isPreviousVisibleRangeInvalid(ctx.startValue, ctx.min, ctx.max),
        isNextVisibleRangeValid: (ctx) => !isNextVisibleRangeInvalid(ctx.endValue, ctx.min, ctx.max),
      },

      activities: ["setupLiveRegion"],

      watch: {
        focusedValue: ["adjustStartDate", "syncSelectElements", "focusActiveCellIfNeeded", "invokeOnFocusChange"],
        value: ["setValueText", "announceValueText"],
        view: ["focusActiveCell", "invokeOnViewChange"],
      },

      on: {
        "VALUE.SET": {
          actions: ["setSelectedDate", "setFocusedDate"],
        },
        "FOCUS.SET": {
          actions: ["setFocusedDate"],
        },
        "VALUE.CLEAR": {
          target: "focused",
          actions: ["clearSelectedDate", "clearFocusedDate", "focusInputElement"],
        },
        "GOTO.NEXT": [
          { guard: "isYearView", actions: ["focusNextDecade", "announceVisibleRange"] },
          { guard: "isMonthView", actions: ["focusNextYear", "announceVisibleRange"] },
          { actions: ["focusNextPage"] },
        ],
        "GOTO.PREV": [
          { guard: "isYearView", actions: ["focusPreviousDecade", "announceVisibleRange"] },
          { guard: "isMonthView", actions: ["focusPreviousYear", "announceVisibleRange"] },
          { actions: ["focusPreviousPage"] },
        ],
      },

      states: {
        idle: {
          tags: "closed",
          on: {
            "INPUT.FOCUS": {
              target: "focused",
            },
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["setViewToDay", "focusFirstSelectedDate"],
            },
          },
        },

        focused: {
          tags: "closed",
          on: {
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["setViewToDay", "focusFirstSelectedDate"],
            },
            "INPUT.CHANGE": {
              actions: ["parseInputValue"],
            },
            "INPUT.ENTER": {
              actions: ["parseInputValue", "selectFocusedDate"],
            },
          },
        },

        open: {
          tags: "open",
          activities: ["trackDismissableElement"],
          entry: ["focusActiveCell"],
          exit: ["clearHoveredDate"],
          on: {
            "CELL.CLICK": [
              {
                guard: "isMonthView",
                actions: ["setFocusedMonth", "setViewToDay"],
              },
              {
                guard: "isYearView",
                actions: ["setFocusedYear", "setViewToMonth"],
              },
              {
                guard: and("isRangePicker", "isRangeSelected"),
                actions: ["resetIndex", "clearSelectedDate", "setFocusedDate", "setSelectedDate", "setEndIndex"],
              },
              {
                target: "focused",
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setFocusedDate", "setSelectedDate", "resetIndex", "clearHoveredDate", "focusInputElement"],
              },
              {
                guard: "isRangePicker",
                actions: ["setFocusedDate", "setSelectedDate", "setEndIndex"],
              },
              {
                guard: "isMultiPicker",
                actions: ["setFocusedDate", "toggleSelectedDate"],
              },
              {
                target: "focused",
                actions: ["setFocusedDate", "setSelectedDate", "focusInputElement"],
              },
            ],
            "CELL.FOCUS": {
              guard: "isDayView",
              actions: ["setFocusedDate"],
            },
            "CELL.POINTER_ENTER": {
              guard: and("isRangePicker", "isSelectingEndDate"),
              actions: ["setHoveredDate"],
            },
            "GRID.POINTER_LEAVE": {
              guard: "isRangePicker",
              actions: ["clearHoveredDate"],
            },
            "GRID.POINTER_DOWN": {
              actions: ["disableTextSelection"],
            },
            "GRID.POINTER_UP": {
              actions: ["enableTextSelection"],
            },
            "GRID.ESCAPE": {
              target: "focused",
              actions: ["setViewToDay", "focusFirstSelectedDate", "focusTriggerElement"],
            },
            "GRID.ENTER": [
              {
                guard: "isMonthView",
                actions: "setViewToDay",
              },
              {
                guard: "isYearView",
                actions: "setViewToMonth",
              },
              {
                guard: "isMultiPicker",
                actions: "toggleSelectedDate",
              },
              {
                target: "focused",
                actions: ["selectFocusedDate", "focusInputElement"],
              },
            ],
            "GRID.ARROW_RIGHT": [
              { guard: "isMonthView", actions: "focusNextMonth" },
              { guard: "isYearView", actions: "focusNextYear" },
              { actions: "focusNextDay" },
            ],
            "GRID.ARROW_LEFT": [
              { guard: "isMonthView", actions: "focusPreviousMonth" },
              { guard: "isYearView", actions: "focusPreviousYear" },
              { actions: ["focusPreviousDay"] },
            ],
            "GRID.ARROW_UP": [
              { guard: "isMonthView", actions: "focusPreviousMonthColumn" },
              { guard: "isYearView", actions: "focusPreviousYearColumn" },
              { actions: ["focusPreviousWeek"] },
            ],
            "GRID.ARROW_DOWN": [
              { guard: "isMonthView", actions: "focusNextMonthColumn" },
              { guard: "isYearView", actions: "focusNextYearColumn" },
              { actions: ["focusNextWeek"] },
            ],
            "GRID.PAGE_UP": {
              actions: ["focusPreviousSection"],
            },
            "GRID.PAGE_DOWN": {
              actions: ["focusNextSection"],
            },
            "GRID.HOME": [
              { guard: "isMonthView", actions: ["focusMonthStart"] },
              { guard: "isYearView", actions: ["focusYearStart"] },
              { actions: ["focusSectionStart"] },
            ],
            "GRID.END": [
              { guard: "isMonthView", actions: ["focusMonthEnd"] },
              { guard: "isYearView", actions: ["focusYearEnd"] },
              { actions: ["focusSectionEnd"] },
            ],
            "TRIGGER.CLICK": {
              target: "focused",
            },
            "VIEW.CHANGE": [
              {
                guard: "isDayView",
                actions: ["setViewToMonth"],
              },
              {
                guard: "isMonthView",
                actions: ["setViewToYear"],
              },
            ],
            DISMISS: [
              { guard: "isTargetFocusable", target: "idle" },
              { target: "focused", actions: ["focusTriggerElement"] },
            ],
          },
        },
      },
    },
    {
      guards: {
        isDayView: (ctx, evt) => (evt.view || ctx.view) === "day",
        isMonthView: (ctx, evt) => (evt.view || ctx.view) === "month",
        isYearView: (ctx, evt) => (evt.view || ctx.view) === "year",
        isRangePicker: (ctx) => ctx.selectionMode === "range",
        isRangeSelected: (ctx) => ctx.value.length === 2,
        isMultiPicker: (ctx) => ctx.selectionMode === "multiple",
        isTargetFocusable: (_ctx, evt) => evt.focusable,
        isSelectingEndDate: (ctx) => ctx.activeIndex === 1,
      },
      activities: {
        setupLiveRegion(ctx) {
          const doc = dom.getDoc(ctx)
          ctx.announcer = createLiveRegion({ level: "assertive", document: doc })
          return () => ctx.announcer?.destroy?.()
        },
        trackDismissableElement(ctx, _evt, { send }) {
          if (ctx.inline) return
          let focusable = false
          return trackDismissableElement(dom.getContentEl(ctx), {
            exclude: [dom.getInputEl(ctx), dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onInteractOutside(event) {
              focusable = event.detail.focusable
            },
            onDismiss() {
              send({ type: "DISMISS", src: "dismissable", focusable })
            },
            onEscapeKeyDown(event) {
              event.preventDefault()
              send({ type: "GRID.ESCAPE", src: "dismissable" })
            },
          })
        },
      },
      actions: {
        setViewToDay(ctx) {
          ctx.view = "day"
        },
        setViewToMonth(ctx) {
          ctx.view = "month"
        },
        setViewToYear(ctx) {
          ctx.view = "year"
        },
        setValueText(ctx) {
          if (!ctx.value.length) return
          ctx.valueText = ctx.value.map((date) => formatSelectedDate(date, null, ctx.locale, ctx.timeZone)).join(", ")
        },
        announceValueText(ctx) {
          ctx.announcer?.announce(ctx.valueText, 3000)
        },
        announceVisibleRange(ctx) {
          const { formatted } = ctx.visibleRangeText
          ctx.announcer?.announce(formatted)
        },
        disableTextSelection(ctx) {
          disableTextSelection({ target: dom.getGridEl(ctx)!, doc: dom.getDoc(ctx) })
        },
        enableTextSelection(ctx) {
          restoreTextSelection({ doc: dom.getDoc(ctx), target: dom.getGridEl(ctx)! })
        },
        focusFirstSelectedDate(ctx) {
          if (!ctx.value.length) return
          ctx.focusedValue = ctx.value[0]
        },
        setFocusedDate(ctx, evt) {
          ctx.focusedValue = evt.value
        },
        setFocusedMonth(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.set({ month: evt.value })
        },
        focusNextMonth(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ months: 1 })
        },
        focusPreviousMonth(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract({ months: 1 })
        },
        setFocusedYear(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.set({ year: evt.value })
        },
        setSelectedDate(ctx, evt) {
          const nextValue = [...ctx.value]
          nextValue[ctx.activeIndex] = evt.value
          ctx.value = adjustStartAndEndDate(nextValue)
        },
        toggleSelectedDate(ctx, evt) {
          const currentValue = evt.value ?? ctx.focusedValue
          const index = ctx.value.findIndex((date) => isDateEqual(date, currentValue))
          if (index === -1) {
            const nextValues = [...ctx.value, currentValue]
            ctx.value = sortDates(nextValues)
          } else {
            const nextValues = [...ctx.value]
            nextValues.splice(index, 1)
            ctx.value = sortDates(nextValues)
          }
        },
        setHoveredDate(ctx, evt) {
          ctx.hoveredValue = evt.value
        },
        clearHoveredDate(ctx) {
          ctx.hoveredValue = null
        },
        selectFocusedDate(ctx) {
          const nextValue = [...ctx.value]
          nextValue[ctx.activeIndex] = ctx.focusedValue.copy()
          ctx.value = adjustStartAndEndDate(nextValue)
        },
        adjustStartDate(ctx) {
          const adjust = getAdjustedDateFn(ctx.visibleDuration, ctx.locale, ctx.min, ctx.max)
          const { startDate, focusedDate } = adjust({ focusedDate: ctx.focusedValue, startDate: ctx.startValue })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        setPreviousDate(ctx) {
          ctx.focusedValue = getPreviousDay(ctx.focusedValue)
        },
        setNextDate(ctx) {
          ctx.focusedValue = getNextDay(ctx.focusedValue)
        },
        focusPreviousDay(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract({ days: 1 })
        },
        focusNextDay(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ days: 1 })
        },
        focusPreviousWeek(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract({ weeks: 1 })
        },
        focusNextWeek(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ weeks: 1 })
        },
        focusNextPage(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ months: 1 })
        },
        focusPreviousPage(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract(ctx.visibleDuration)
        },
        focusSectionStart(ctx) {
          ctx.focusedValue = ctx.startValue.copy()
        },
        focusSectionEnd(ctx) {
          ctx.focusedValue = ctx.endValue.copy()
        },
        focusNextSection(ctx, evt) {
          const section = getNextSection(
            ctx.focusedValue,
            ctx.startValue,
            evt.larger,
            ctx.visibleDuration,
            ctx.locale,
            ctx.min,
            ctx.max,
          )

          if (!section) return
          ctx.focusedValue = section.focusedDate
        },
        focusPreviousSection(ctx, evt) {
          const section = getPreviousSection(
            ctx.focusedValue,
            ctx.startValue,
            evt.larger,
            ctx.visibleDuration,
            ctx.locale,
            ctx.min,
            ctx.max,
          )

          if (!section) return
          ctx.focusedValue = section.focusedDate
        },
        focusNextYear(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ years: 1 })
        },
        focusPreviousYear(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract({ years: 1 })
        },
        focusNextDecade(ctx) {
          ctx.focusedValue = ctx.focusedValue.add({ years: 10 })
        },
        focusPreviousDecade(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract({ years: 10 })
        },
        clearSelectedDate(ctx) {
          ctx.value = []
        },
        clearFocusedDate(ctx) {
          ctx.focusedValue = getTodayDate(ctx.timeZone)
        },
        focusPreviousMonthColumn(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.subtract({ months: evt.columns })
        },
        focusNextMonthColumn(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.add({ months: evt.columns })
        },
        focusPreviousYearColumn(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.subtract({ years: evt.columns })
        },
        focusNextYearColumn(ctx, evt) {
          ctx.focusedValue = ctx.focusedValue.add({ years: evt.columns })
        },
        focusMonthStart(ctx) {
          ctx.focusedValue = ctx.focusedValue.set({ month: 1 })
        },
        focusMonthEnd(ctx) {
          ctx.focusedValue = ctx.focusedValue.set({ month: 12 })
        },
        setEndIndex(ctx) {
          ctx.activeIndex = 1
        },
        resetIndex(ctx) {
          ctx.activeIndex = 0
        },
        formatInputValue(ctx) {
          const o = new DateFormatter(ctx.locale)
          const formatted = o.format(ctx.value[0].toDate(ctx.timeZone))
          console.log(formatted)
        },
        focusActiveCell(ctx) {
          raf(() => {
            dom.getFocusedCell(ctx)?.focus({ preventScroll: true })
          })
        },
        focusActiveCellIfNeeded(ctx, evt) {
          if (!evt.focus) return
          raf(() => {
            dom.getFocusedCell(ctx)?.focus({ preventScroll: true })
          })
        },
        focusTriggerElement(ctx) {
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusInputElement(ctx) {
          raf(() => {
            dom.getInputEl(ctx)?.focus()
          })
        },
        syncSelectElements(ctx) {
          const year = dom.getYearSelectEl(ctx)
          if (year) year.value = ctx.focusedValue.year.toString()

          const month = dom.getMonthSelectEl(ctx)
          if (month) month.value = ctx.focusedValue.month.toString()
        },
        invokeOnFocusChange(ctx) {
          ctx.onFocusChange?.({ value: ctx.focusedValue })
        },
        invokeOnViewChange(ctx) {
          ctx.onViewChange?.({ value: ctx.view })
        },
        parseInputValue(ctx, evt) {
          ctx.inputValue = evt.value
          const parsedValue = parseDateString(ctx.inputValue)
          if (!parsedValue) return
          ctx.focusedValue = parsedValue
        },
      },
      compareFns: {
        startValue: (a, b) => a.toString() === b.toString(),
        focusedValue: (a, b) => a.toString() === b.toString(),
        value: (a, b) => a?.toString() === b?.toString(),
      },
    },
  )
}
