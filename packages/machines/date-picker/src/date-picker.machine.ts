import { createMachine } from "@zag-js/core"
import { DateFormatter, getCalendarState } from "@zag-js/date-utils"
import { createLiveRegion } from "@zag-js/live-region"
import { raf } from "@zag-js/dom-utils"
import { compact } from "@zag-js/utils"
import memo from "proxy-memoize"
import { dom } from "./date-picker.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"

function getInitialContext(ctx: UserDefinedContext) {
  const _ctx = ctx as MachineContext
  const calendar = getCalendarState(_ctx)

  const focusedValue = calendar.getToday()
  const startValue = calendar.setAlignment(focusedValue, "start")

  return {
    focusedValue,
    startValue,
    formatter: (options) => new DateFormatter(_ctx.locale, options),
    ...ctx,
  } as MachineContext
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "date-picker",
      initial: "open:month",
      context: getInitialContext({
        locale: "en",
        timeZone: "GMT",
        duration: { months: 1 },
        ...ctx,
      }),

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
      },

      watch: {
        focusedValue: ["adjustStartDate", "focusFocusedCell"],
        visibleRange: ["announceVisibleRange"],
        value: ["announceSelectedDate"],
        locale: ["setFormatter"],
      },

      on: {
        POINTER_DOWN: {
          actions: ["disableTextSelection"],
        },
        POINTER_UP: {
          actions: ["enableTextSelection"],
        },
      },

      states: {
        idle: {
          tags: "closed",
        },
        focused: {
          tags: "closed",
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
      actions: {
        setupAnnouncer(ctx) {
          ctx.annoucer = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
        },
        setFormatter(ctx) {
          ctx.formatter = (options) => new DateFormatter(ctx.locale, options)
        },
        announceSelectedDate() {},
        announceVisibleRange() {},
        disableTextSelection() {},
        enableTextSelection() {},
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
      },
    },
  )
}
