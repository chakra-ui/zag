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
import { getFormatterFn } from "./date-formatter"
import { dom } from "./date-picker.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"

function getInitialState(ctx: UserDefinedContext) {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const numOfMonths = ctx.numOfMonths || 1
  const visibleDuration = { months: numOfMonths }
  const focusedValue = getTodayDate(timeZone)
  const startValue = alignDate(focusedValue, "start", visibleDuration, locale)
  return {
    id: "",
    view: "date",
    locale,
    timeZone,
    numOfMonths,
    focusedValue,
    startValue,
    value: focusedValue,
    valueText: "",
  } as MachineContext
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: "focused",
      context: getInitialState(ctx),
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
        focusedValue: ["focusCell", "adjustStartDate"],
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
        "GOTO.NEXT": {
          actions: ["focusPreviousPage"],
        },
        "GOTO.PREV": {
          actions: ["focusNextPage"],
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
              actions: ["setViewToDate", "focusSelectedDateIfNeeded"],
            },
            "FIELD.TYPE": {},
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
            "TRIGGER.CLICK": {
              target: "focused",
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        setupLiveRegion(ctx) {
          ctx.announcer = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
          return () => ctx.announcer?.destroy?.()
        },
      },
      actions: {
        setValueText(ctx) {
          if (!ctx.value) return
          ctx.valueText = formatSelectedDate(ctx.value, null, getFormatterFn(ctx.locale), false, ctx.timeZone)
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
        focusSelectedDateIfNeeded(ctx) {
          if (!ctx.value) return
          ctx.focusedValue = ctx.value
        },
        setFocusedDate(ctx, evt) {
          ctx.focusedValue = evt.date
        },
        setSelectedDate(ctx, evt) {
          ctx.value = evt.date
        },
        selectFocusedDate(ctx) {
          ctx.value = ctx.focusedValue.copy()
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
      },
      compareFns: {
        startValue: (a, b) => a.toString() === b.toString(),
        focusedValue: (a, b) => a.toString() === b.toString(),
        value: (a, b) => a?.toString() === b?.toString(),
      },
    },
  )
}
