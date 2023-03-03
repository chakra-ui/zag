import { createMachine } from "@zag-js/core"
import {
  alignDate,
  formatSelectedDate,
  getAdjustedDateFn,
  getEndDate,
  getMonthDates,
  getNextDay,
  getNextSection,
  getPreviousDay,
  getPreviousSection,
  getTodayDate,
  isNextVisibleRangeInvalid,
  isPreviousVisibleRangeInvalid,
} from "@zag-js/date-utils"
import { raf } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import { disableTextSelection, restoreTextSelection } from "@zag-js/text-selection"
import { compact } from "@zag-js/utils"
import { memoize } from "proxy-memoize"
import { dom } from "./date-picker.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"

function getContext(ctx: UserDefinedContext) {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const numOfMonths = ctx.numOfMonths || 1
  const visibleDuration = { months: numOfMonths }
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
    value: [],
    valueText: "",
    selectionMode: "single" as const,
    ...(ctx as any),
  }
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: "open",
      context: getContext(ctx),
      computed: {
        adjustFn: (ctx) => getAdjustedDateFn(ctx.visibleDuration, ctx.locale, ctx.min, ctx.max),
        isInteractive: (ctx) => !ctx.disabled && !ctx.readonly,
        visibleDuration: (ctx) => ({ months: ctx.numOfMonths }),
        endValue: (ctx) => getEndDate(ctx.startValue, ctx.visibleDuration),
        weeks: memoize((ctx) => getMonthDates(ctx.startValue, ctx.visibleDuration, ctx.locale)),
        visibleRange: (ctx) => ({ start: ctx.startValue, end: ctx.endValue }),
        isPrevVisibleRangeValid: (ctx) => !isPreviousVisibleRangeInvalid(ctx.startValue, ctx.min, ctx.max),
        isNextVisibleRangeValid: (ctx) => !isNextVisibleRangeInvalid(ctx.endValue, ctx.min, ctx.max),
      },

      activities: ["setupLiveRegion"],

      watch: {
        focusedValue: ["adjustStartDate", "syncSelectElements"],
        visibleRange: ["announceVisibleRange"],
        value: ["setValueText", "announceValueText"],
        view: ["focusActiveCell"],
      },

      on: {
        "GRID.POINTER_DOWN": {
          actions: ["disableTextSelection"],
        },
        "GRID.POINTER_UP": {
          actions: ["enableTextSelection"],
        },
        "VALUE.SET": {
          actions: ["setSelectedDate", "setFocusedDate"],
        },
        "FOCUS.SET": {
          actions: ["setFocusedDate"],
        },
        "VALUE.CLEAR": {
          actions: ["clearSelectedDate", "clearFocusedDate"],
        },
        "GOTO.NEXT": [
          { guard: "isYearView", actions: ["focusNextDecade"] },
          { guard: "isMonthView", actions: ["focusNextYear"] },
          { actions: ["focusNextPage"] },
        ],
        "GOTO.PREV": [
          { guard: "isYearView", actions: ["focusPreviousDecade"] },
          { guard: "isMonthView", actions: ["focusPreviousYear"] },
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
              actions: ["setViewToDay", "focusSelectedDate"],
            },
          },
        },

        focused: {
          tags: "closed",
          on: {
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["setViewToDay", "focusSelectedDate"],
            },
            "INPUT.CHANGE": {
              actions: ["focusTypedDate"],
            },
            "INPUT.ENTER": {
              actions: ["selectFocusedDate"],
            },
          },
        },

        open: {
          tags: "open",
          on: {
            "CELL.CLICK": [
              { guard: "isMonthView", actions: ["setFocusedMonth", "setViewToDay"] },
              { guard: "isYearView", actions: ["setFocusedYear", "setViewToMonth"] },
              { actions: ["setFocusedDate", "setSelectedDate"] },
            ],
            "CELL.FOCUS": {
              guard: "isDayView",
              actions: ["setFocusedDate"],
            },
            "GRID.ENTER": [
              { guard: "isMonthView", actions: "setViewToDay" },
              { guard: "isYearView", actions: "setViewToMonth" },
              { actions: "selectFocusedDate" },
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
                actions: ["setViewToMonth", "invokeOnViewChange"],
              },
              {
                guard: "isMonthView",
                actions: ["setViewToYear", "invokeOnViewChange"],
              },
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
      },
      activities: {
        setupLiveRegion(ctx) {
          const doc = dom.getDoc(ctx)
          ctx.announcer = createLiveRegion({ level: "assertive", document: doc })
          return () => ctx.announcer?.destroy?.()
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
          ctx.announcer?.announce(ctx.visibleRangeText)
        },
        disableTextSelection(ctx) {
          disableTextSelection({ target: dom.getGridEl(ctx)!, doc: dom.getDoc(ctx) })
        },
        enableTextSelection(ctx) {
          restoreTextSelection({ doc: dom.getDoc(ctx), target: dom.getGridEl(ctx)! })
        },
        focusSelectedDate(ctx) {
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
          ctx.value[ctx.activeIndex] = evt.value
        },
        selectFocusedDate(ctx) {
          ctx.value[ctx.activeIndex] = ctx.focusedValue.copy()
        },
        adjustStartDate(ctx) {
          const { startDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue,
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
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
        focusActiveCell(ctx) {
          raf(() => {
            dom.getFocusedCell(ctx)?.focus()
          })
        },
        syncSelectElements(ctx) {
          const year = dom.getYearSelectEl(ctx)
          if (year) year.value = ctx.focusedValue.year.toString()

          const month = dom.getMonthSelectEl(ctx)
          if (month) month.value = ctx.focusedValue.month.toString()
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
