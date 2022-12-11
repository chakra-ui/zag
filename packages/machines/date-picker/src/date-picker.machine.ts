import { createMachine } from "@zag-js/core"
import {
  DateFormatter,
  getCalendarState,
  getSegmentState,
  getSelectedDateDescription,
  getVisibleRangeDescription,
} from "@zag-js/date-utils"
import { disableTextSelection, raf, restoreTextSelection } from "@zag-js/dom-utils"
import { createLiveRegion } from "@zag-js/live-region"
import { compact } from "@zag-js/utils"
import memo from "proxy-memoize"
import { dom } from "./date-picker.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"

function getInitialContext(context: UserDefinedContext) {
  const ctx = context as MachineContext
  const calendar = getCalendarState(ctx)
  const focusedValue = calendar.getToday()
  const startValue = calendar.setAlignment(focusedValue, "start")

  const contextValue = {
    focusedValue,
    startValue,
    getDateFormatter: (options) => new DateFormatter(ctx.locale, options),
    selectedDateDescription: "",
    getPlaceholder({ field }) {
      return { day: "dd", month: "mm", year: "yyyy" }[field]
    },
    ...context,
  } as MachineContext

  const segments = getSegmentState(contextValue)
  const allSegments = segments.getAllSegments()

  return {
    ...contextValue,
    allSegments,
    validSegments: { ...allSegments },
  }
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "date-picker",
      initial: "open:month",
      context: getInitialContext({
        locale: "en-US",
        timeZone: "UTC",
        duration: { months: 1 },
        ...ctx,
      }),

      created: ["adjustSegments"],

      computed: {
        isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
        endValue: (ctx) => getCalendarState(ctx).getEndDate(ctx.startValue),
        dayFormatter: memo((ctx) => new DateFormatter(ctx.locale, { weekday: "short", timeZone: ctx.timeZone })),
        weeks: memo((ctx) => getCalendarState(ctx).getMonthDates(ctx.startValue)),
        visibleRange: (ctx) => ({ start: ctx.startValue, end: ctx.endValue }),
        isPrevVisibleRangeValid: (ctx) => {
          return getCalendarState(ctx).isPreviousVisibleRangeInvalid(ctx.startValue)
        },
        isNextVisibleRangeValid(ctx) {
          return getCalendarState(ctx).isNextVisibleRangeInvalid(ctx.startValue)
        },
        visibleRangeDescription: (ctx) => {
          return getVisibleRangeDescription({
            getDateFormatter: ctx.getDateFormatter,
            start: ctx.startValue,
            locale: ctx.locale,
            timeZone: ctx.timeZone,
            stringify({ start, end }) {
              return `${start} - ${end}`
            },
          })
        },
        validSegmentDetails(ctx) {
          const keys = Object.keys(ctx.validSegments)
          const allKeys = Object.keys(ctx.allSegments)
          return {
            keys,
            exceeds: keys.length >= allKeys.length,
            complete: keys.length === allKeys.length,
          }
        },
      },

      activities: ["setupAnnouncer"],

      watch: {
        focusedValue: ["adjustStartDate", "focusFocusedCell"],
        visibleRange: ["announceVisibleRange"],
        value: ["adjustSegments", "setSelectedDateDescription", "announceSelectedDate"],
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
      },

      states: {
        idle: {
          tags: "closed",
        },
        focused: {
          tags: "closed",
          on: {
            FOCUS_SEGMENT: {
              actions: ["setFocusedSegment"],
            },
          },
        },
        "open:month": {
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
            CLICK_PREV: {
              actions: ["focusPreviousPage"],
            },
            CLICK_NEXT: {
              actions: ["focusNextPage"],
            },
          },
        },
        "open:year": {
          tags: "open",
        },
      },
    },
    {
      activities: {
        setupAnnouncer(ctx) {
          ctx.annoucer = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
          return () => ctx.annoucer?.destroy?.()
        },
      },
      actions: {
        setFormatter(ctx) {
          ctx.getDateFormatter = (options) => new DateFormatter(ctx.locale, options)
        },
        setSelectedDateDescription(ctx) {
          ctx.selectedDateDescription = getSelectedDateDescription({
            getDateFormatter: ctx.getDateFormatter,
            start: ctx.value,
            locale: ctx.locale,
            timeZone: ctx.timeZone,
            stringify({ start, end }) {
              return `${start} - ${end}`
            },
          })
        },
        announceSelectedDate(ctx) {
          ctx.annoucer?.announce(ctx.selectedDateDescription, 3000)
        },
        announceVisibleRange(ctx) {
          ctx.annoucer?.announce(ctx.visibleRangeDescription)
        },
        disableTextSelection(ctx) {
          disableTextSelection({ target: dom.getGridEl(ctx)!, doc: dom.getDoc(ctx) })
        },
        enableTextSelection(ctx) {
          restoreTextSelection({ doc: dom.getDoc(ctx), target: dom.getGridEl(ctx)! })
        },
        focusFocusedCell(ctx) {
          raf(() => {
            const cell = dom.getFocusedCell(ctx)
            cell?.focus({ preventScroll: true })
          })
        },
        setPreviousDate(ctx) {
          const calendar = getCalendarState(ctx)
          ctx.startValue = calendar.getPreviousDay(ctx.startValue)
          ctx.focusedValue = calendar.getPreviousDay(ctx.focusedValue)
        },
        setNextDate(ctx) {
          const calendar = getCalendarState(ctx)
          ctx.startValue = calendar.getNextDay(ctx.startValue)
          ctx.focusedValue = calendar.getNextDay(ctx.focusedValue)
        },
        adjustStartDate(ctx) {
          const calendar = getCalendarState(ctx)
          if (calendar.isInvalid(ctx.focusedValue)) {
            ctx.focusedValue = calendar.clamp(ctx.focusedValue)
          } else {
            ctx.startValue = calendar.getAdjustedStartDate(ctx.focusedValue, ctx.startValue, ctx.endValue)
          }
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
          ctx.focusedValue = ctx.focusedValue.add(ctx.duration)
        },
        focusPreviousPage(ctx) {
          ctx.focusedValue = ctx.focusedValue.subtract(ctx.duration)
        },
        focusNextSection(ctx, evt) {
          const calendar = getCalendarState(ctx)
          const focusedValue = calendar.getNextSection(ctx.focusedValue, evt.larger)
          if (focusedValue) {
            ctx.focusedValue = focusedValue
          }
        },
        focusPreviousSection(ctx, evt) {
          const calendar = getCalendarState(ctx)
          const focusedValue = calendar.getPreviousSection(ctx.focusedValue, evt.larger)
          if (focusedValue) {
            ctx.focusedValue = focusedValue
          }
        },
        adjustSegments(ctx) {
          if (!ctx.value && ctx.validSegmentDetails.complete) {
            ctx.validSegments = {}
            return
          }

          if (ctx.value && !ctx.validSegmentDetails.complete) {
            ctx.validSegments = { ...ctx.allSegments }
            return
          }
        },
        setFocusedSegment(ctx, evt) {
          ctx.focusedSegment = evt.segment
        },
      },
    },
  )
}
