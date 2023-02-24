import { DateFormatter } from "@internationalized/date"
import { createMachine } from "@zag-js/core"
import {
  alignDate,
  createPlaceholderDate,
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

function getInitialState(ctx: UserDefinedContext) {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const numOfMonths = ctx.numOfMonths || 1
  const visibleDuration = { months: numOfMonths }

  const focusedValue = getTodayDate(timeZone)
  const startValue = alignDate(focusedValue, "start", visibleDuration, locale)
  const placeholderValue = createPlaceholderDate("day", timeZone)

  const getDateFormatter: MachineContext["getDateFormatter"] = (options) => {
    return new DateFormatter(locale, options)
  }

  return {
    id: "",
    view: "date",
    locale,
    timeZone,
    numOfMonths,
    focusedValue,
    startValue,
    placeholderValue,
    getDateFormatter,
    valueText: "",
    dateFormatter: new DateFormatter(locale, { timeZone }),
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
        dayFormatter: memoize((ctx) => new DateFormatter(ctx.locale, { weekday: "short", timeZone: ctx.timeZone })),
        weeks: memoize((ctx) => getMonthDates(ctx.startValue, ctx.visibleDuration, ctx.locale)),
        visibleRange: (ctx) => ({ start: ctx.startValue, end: ctx.endValue }),
        isPrevVisibleRangeValid: (ctx) => {
          return isPreviousVisibleRangeInvalid(ctx.startValue, ctx.min, ctx.max)
        },
        isNextVisibleRangeValid(ctx) {
          return isNextVisibleRangeInvalid(ctx.endValue, ctx.min, ctx.max)
        },
      },

      activities: ["setupAnnouncer"],

      watch: {
        focusedValue: ["focusFocusedCell"],
        visibleRange: ["announceVisibleRange"],
        value: ["setValueText", "announceValueText"],
        locale: ["setFormatter"],
      },

      on: {
        POINTER_DOWN: {
          actions: ["disableTextSelection"],
        },
        POINTER_UP: {
          actions: ["enableTextSelection"],
        },
        SET_VALUE: {
          actions: ["setSelectedDate"],
        },
        CLICK_PREV: {
          actions: ["focusPreviousPage"],
        },
        CLICK_NEXT: {
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
            CLICK_TRIGGER: {
              target: "open",
              actions: ["setViewToDate", "focusSelectedDateIfNeeded"],
            },
            INPUT: {},
          },
        },

        open: {
          tags: "open",
          on: {
            FOCUS_CELL: {
              actions: ["setFocusedDate"],
            },
            ENTER: {
              actions: ["selectFocusedDate"],
            },
            CLICK_CELL: {
              actions: ["setFocusedDate", "setSelectedDate"],
            },
            ARROW_RIGHT: {
              actions: ["focusNextDay"],
            },
            ARROW_LEFT: {
              actions: ["focusPreviousDay"],
            },
            ARROW_UP: {
              actions: ["focusPreviousWeek"],
            },
            ARROW_DOWN: {
              actions: ["focusNextWeek"],
            },
            PAGE_UP: {
              actions: ["focusPreviousSection"],
            },
            PAGE_DOWN: {
              actions: ["focusNextSection"],
            },

            CLICK_TRIGGER: {
              target: "focused",
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        setupAnnouncer(ctx) {
          ctx.announcer = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
          return () => ctx.announcer?.destroy?.()
        },
      },
      actions: {
        setFormatter(ctx) {
          ctx.getDateFormatter = (options) => new DateFormatter(ctx.locale, options)
        },
        setValueText(ctx) {
          if (!ctx.value) return
          ctx.valueText = formatSelectedDate(ctx.value, null, ctx.getDateFormatter, false, ctx.timeZone)
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
        focusFocusedCell(ctx) {
          raf(() => {
            const cell = dom.getFocusedCell(ctx)
            cell?.focus({ preventScroll: true })
          })
        },
        setPreviousDate(ctx) {
          ctx.startValue = getPreviousDay(ctx.startValue)
          ctx.focusedValue = getPreviousDay(ctx.focusedValue)
        },
        setNextDate(ctx) {
          ctx.startValue = getNextDay(ctx.startValue)
          ctx.focusedValue = getNextDay(ctx.focusedValue)
        },
        focusPreviousDay(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.subtract({ days: 1 }),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        focusNextDay(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.add({ days: 1 }),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        focusPreviousWeek(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.subtract({ weeks: 1 }),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        focusNextWeek(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.add({ weeks: 1 }),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        focusNextPage(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.add(ctx.visibleDuration),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
        },
        focusPreviousPage(ctx) {
          const { startDate, focusedDate } = ctx.adjustFn({
            focusedDate: ctx.focusedValue.subtract(ctx.visibleDuration),
            startDate: ctx.startValue,
          })
          ctx.startValue = startDate
          ctx.focusedValue = focusedDate
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
          ctx.startValue = section.startDate
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
          ctx.startValue = section.startDate
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
