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
import { dispatchSelectValueEvent } from "@zag-js/form-utils"
import { memoize } from "proxy-memoize"
import { getFormatterFn } from "./date-formatter"
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
  }
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: "focused",
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
        focusedValue: ["focusCell", "adjustStartDate", "syncSelectElements"],
        visibleRange: ["announceVisibleRange"],
        value: ["setValueText", "announceValueText"],
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
        "GOTO.NEXT": {
          actions: ["focusNextPage"],
        },
        "GOTO.PREV": {
          actions: ["focusPreviousPage"],
        },
      },

      states: {
        idle: {
          tags: "closed",
        },

        focused: {
          tags: "closed",
          on: {
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["setViewToDay", "focusSelectedDate"],
            },
            "INPUT.TYPE": {},
          },
        },

        open: {
          tags: "open",
          on: {
            "CELL.FOCUS": {
              actions: ["setFocusedDate"],
            },
            "GRID.ENTER": {
              actions: ["selectFocusedDate"],
            },
            "CELL.CLICK": {
              actions: ["setFocusedDate", "setSelectedDate"],
            },
            "GRID.ARROW_RIGHT": {
              actions: ["focusNextDay"],
            },
            "GRID.ARROW_LEFT": {
              actions: ["focusPreviousDay"],
            },
            "GRID.ARROW_UP": {
              actions: ["focusPreviousWeek"],
            },
            "GRID.ARROW_DOWN": {
              actions: ["focusNextWeek"],
            },
            "GRID.PAGE_UP": {
              actions: ["focusPreviousSection"],
            },
            "GRID.PAGE_DOWN": {
              actions: ["focusNextSection"],
            },
            "GRID.HOME": {
              actions: ["focusFirstDay"],
            },
            "GRID.END": {
              actions: ["focusLastDay"],
            },
            "TRIGGER.CLICK": {
              target: "focused",
            },
          },
        },

        "open:range": {},
      },
    },
    {
      guards: {
        isDayView: (ctx) => ctx.view === "day",
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
          ctx.valueText = ctx.value
            .map((date) => formatSelectedDate(date, null, getFormatterFn(ctx.locale), false, ctx.timeZone))
            .join(", ")
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
          ctx.focusedValue = evt.date
        },
        setSelectedDate(ctx, evt) {
          ctx.value[ctx.activeIndex] = evt.date
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
        focusCell(ctx) {
          raf(() => {
            const cell = dom.getFocusedCell(ctx)
            cell?.focus({ preventScroll: true })
          })
        },
        setPreviousDate(ctx) {
          ctx.focusedValue = getPreviousDay(ctx.focusedValue)
        },
        setNextDate(ctx) {
          ctx.focusedValue = getNextDay(ctx.focusedValue)
        },
        focusFirstDay(ctx) {
          ctx.focusedValue = ctx.startValue.copy()
        },
        focusLastDay(ctx) {
          ctx.focusedValue = ctx.endValue.copy()
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
          ctx.focusedValue = ctx.focusedValue.add(ctx.visibleDuration)
        },
        focusPreviousPage(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract(ctx.visibleDuration)
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
        clearSelectedDate(ctx) {
          ctx.value = []
        },
        clearFocusedDate(ctx) {
          ctx.focusedValue = getTodayDate(ctx.timeZone)
        },
        syncSelectElements(ctx) {
          const yearSelect = dom.getYearSelectEl(ctx)
          dispatchSelectValueEvent(yearSelect, ctx.focusedValue.year.toString())

          const monthSelect = dom.getMonthSelectEl(ctx)
          dispatchSelectValueEvent(monthSelect, ctx.focusedValue.month.toString())
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
