import { DateFormatter } from "@internationalized/date"
import { createMachine, guards } from "@zag-js/core"
import {
  alignDate,
  constrainValue,
  formatSelectedDate,
  getAdjustedDateFn,
  getDecadeRange,
  getEndDate,
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
import { adjustStartAndEndDate, formatValue, sortDates } from "./date-picker.utils"

const { and, not } = guards

const getInitialContext = (ctx: Partial<MachineContext>): MachineContext => {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const selectionMode = ctx.selectionMode || "single"
  const numOfMonths = ctx.numOfMonths || 1

  // sort and constrain dates
  let value = sortDates(ctx.value || [])
  value = value.map((date) => constrainValue(date, ctx.min, ctx.max))

  // get initial focused value
  let focusedValue = value.at(0) || ctx.focusedValue || getTodayDate(timeZone)
  focusedValue = constrainValue(focusedValue, ctx.min, ctx.max)

  // get initial start value for visible range
  const startValue = alignDate(focusedValue, "start", { months: numOfMonths }, locale)

  // format input value
  const inputValue = ctx.format?.(value) ?? formatValue({ locale, timeZone, selectionMode, value })

  return {
    locale,
    numOfMonths,
    focusedValue,
    startValue,
    timeZone,
    value,
    inputValue,
    selectionMode,
    view: "day",
    activeIndex: 0,
    valueText: "",
    hoveredValue: null,
    ...ctx,
  } as MachineContext
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: ctx.inline ? "open" : "idle",
      context: getInitialContext(ctx),
      computed: {
        isInteractive: (ctx) => !ctx.disabled && !ctx.readOnly,
        visibleDuration: (ctx) => ({ months: ctx.numOfMonths }),
        endValue: (ctx) => getEndDate(ctx.startValue, ctx.visibleDuration),
        visibleRange: (ctx) => ({ start: ctx.startValue, end: ctx.endValue }),
        visibleRangeText(ctx) {
          const formatter = new DateFormatter(ctx.locale, { month: "long", year: "numeric", timeZone: ctx.timeZone })
          const start = formatter.format(ctx.startValue.toDate(ctx.timeZone))
          const end = formatter.format(ctx.endValue.toDate(ctx.timeZone))
          const formatted = ctx.selectionMode === "range" ? `${start} - ${end}` : start
          return { start, end, formatted }
        },
        isPrevVisibleRangeValid: (ctx) => !isPreviousVisibleRangeInvalid(ctx.startValue, ctx.min, ctx.max),
        isNextVisibleRangeValid: (ctx) => !isNextVisibleRangeInvalid(ctx.endValue, ctx.min, ctx.max),
      },

      activities: ["setupLiveRegion"],

      watch: {
        locale: ["setStartValue", "setInputValue"],
        focusedValue: [
          "adjustStartDate",
          "syncMonthSelectElement",
          "syncYearSelectElement",
          "focusActiveCellIfNeeded",
          "setHoveredValueIfKeyboard",
          "invokeOnFocusChange",
        ],
        value: ["setValueText", "announceValueText", "setInputValue"],
        inputValue: ["syncInputElement"],
        view: ["focusActiveCell", "invokeOnViewChange"],
      },

      on: {
        "VALUE.SET": {
          actions: ["setSelectedDate", "setFocusedDate"],
        },
        "VIEW.SET": {
          actions: ["setView"],
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
              actions: ["focusFirstSelectedDate"],
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
              actions: ["focusParsedDate"],
            },
            "INPUT.ENTER": {
              actions: ["focusParsedDate", "selectFocusedDate"],
            },
            "INPUT.BLUR": {
              target: "idle",
            },
            "CELL.FOCUS": {
              target: "open",
              actions: ["setView"],
            },
          },
        },

        open: {
          tags: "open",
          activities: ["trackDismissableElement"],
          entry: ctx.inline ? undefined : ["focusActiveCell"],
          exit: ["clearHoveredDate", "resetView"],
          on: {
            "INPUT.CHANGE": {
              actions: ["focusParsedDate"],
            },
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
                guard: and("isRangePicker", "hasSelectedRange"),
                actions: ["setStartIndex", "clearSelectedDate", "setFocusedDate", "setSelectedDate", "setEndIndex"],
              },
              // === Grouped transitions (based on isInline) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "isInline"),
                actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate"],
              },
              {
                target: "focused",
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: [
                  "setFocusedDate",
                  "setSelectedDate",
                  "setStartIndex",
                  "clearHoveredDate",
                  "focusInputElement",
                ],
              },
              // ===
              {
                guard: "isRangePicker",
                actions: ["setFocusedDate", "setSelectedDate", "setEndIndex"],
              },
              {
                guard: "isMultiPicker",
                actions: ["setFocusedDate", "toggleSelectedDate"],
              },
              // === Grouped transitions (based on isInline) ===
              {
                guard: "isInline",
                actions: ["setFocusedDate", "setSelectedDate"],
              },
              {
                target: "focused",
                actions: ["setFocusedDate", "setSelectedDate", "focusInputElement"],
              },
              // ===
            ],
            "CELL.POINTER_MOVE": {
              guard: and("isRangePicker", "isSelectingEndDate"),
              actions: ["setHoveredDate", "setFocusedDate"],
            },
            "GRID.POINTER_LEAVE": {
              guard: "isRangePicker",
              actions: ["clearHoveredDate"],
            },
            "GRID.POINTER_DOWN": {
              guard: not("isInline"),
              actions: ["disableTextSelection"],
            },
            "GRID.POINTER_UP": {
              guard: not("isInline"),
              actions: ["enableTextSelection"],
            },
            "GRID.ESCAPE": {
              guard: not("isInline"),
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
                guard: and("isRangePicker", "hasSelectedRange"),
                actions: ["setStartIndex", "clearSelectedDate", "setSelectedDate", "setEndIndex"],
              },
              // === Grouped transitions (based on isInline) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "isInline"),
                actions: ["setSelectedDate", "setStartIndex"],
              },
              {
                target: "focused",
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setSelectedDate", "setStartIndex", "focusInputElement"],
              },
              // ===
              {
                guard: "isRangePicker",
                actions: ["setSelectedDate", "setEndIndex", "focusNextDay"],
              },
              {
                guard: "isMultiPicker",
                actions: ["toggleSelectedDate"],
              },
              // === Grouped transitions (based on isInline) ===
              {
                guard: "isInline",
                actions: ["selectFocusedDate"],
              },
              {
                target: "focused",
                actions: ["selectFocusedDate", "focusInputElement"],
              },
              // ===
            ],
            "GRID.ARROW_RIGHT": [
              { guard: "isMonthView", actions: "focusNextMonth" },
              { guard: "isYearView", actions: "focusNextYear" },
              { actions: ["focusNextDay", "setHoveredDate"] },
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
              { guard: "isMonthView", actions: ["focusFirstMonth"] },
              { guard: "isYearView", actions: ["focusFirstYear"] },
              { actions: ["focusSectionStart"] },
            ],
            "GRID.END": [
              { guard: "isMonthView", actions: ["focusLastMonth"] },
              { guard: "isYearView", actions: ["focusLastYear"] },
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
              {
                guard: "isTargetFocusable",
                target: "idle",
                actions: ["setStartIndex"],
              },
              {
                target: "focused",
                actions: ["focusTriggerElement", "setStartIndex"],
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
        hasSelectedRange: (ctx) => ctx.value.length === 2,
        isMultiPicker: (ctx) => ctx.selectionMode === "multiple",
        isTargetFocusable: (_ctx, evt) => evt.focusable,
        isSelectingEndDate: (ctx) => ctx.activeIndex === 1,
        isInline: (ctx) => !!ctx.inline,
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
        setView(ctx, evt) {
          ctx.view = evt.cell
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
          disableTextSelection({ target: dom.getContentEl(ctx)!, doc: dom.getDoc(ctx) })
        },
        enableTextSelection(ctx) {
          restoreTextSelection({ doc: dom.getDoc(ctx), target: dom.getContentEl(ctx)! })
        },
        focusFirstSelectedDate(ctx) {
          if (!ctx.value.length) return
          ctx.focusedValue = ctx.value[0]
        },
        setInputValue(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input) return
          ctx.inputValue = ctx.format?.(ctx.value) ?? formatValue(ctx)
        },
        syncInputElement(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input || input.value === ctx.inputValue) return
          raf(() => {
            input.value = ctx.inputValue
            // move cursor to the end
            input.setSelectionRange(input.value.length, input.value.length)
          })
        },
        setFocusedDate(ctx, evt) {
          const value = Array.isArray(evt.value) ? evt.value[0] : evt.value
          ctx.focusedValue = constrainValue(value, ctx.min, ctx.max)
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
          nextValue[ctx.activeIndex] = evt.value ?? ctx.focusedValue
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
        focusFirstMonth(ctx) {
          ctx.focusedValue = ctx.focusedValue.set({ month: 0 })
        },
        focusLastMonth(ctx) {
          ctx.focusedValue = ctx.focusedValue.set({ month: 12 })
        },
        focusFirstYear(ctx) {
          const range = getDecadeRange(ctx.focusedValue.year)
          ctx.focusedValue = ctx.focusedValue.set({ year: range.at(0) })
        },
        focusLastYear(ctx) {
          const range = getDecadeRange(ctx.focusedValue.year)
          ctx.focusedValue = ctx.focusedValue.set({ year: range.at(-1) })
        },
        setEndIndex(ctx) {
          ctx.activeIndex = 1
        },
        setStartIndex(ctx) {
          ctx.activeIndex = 0
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
        setHoveredValueIfKeyboard(ctx, evt) {
          if (!evt.type.startsWith("GRID.ARROW") || ctx.selectionMode !== "range" || ctx.activeIndex === 0) return
          ctx.hoveredValue = ctx.focusedValue.copy()
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
        syncMonthSelectElement(ctx) {
          const month = dom.getMonthSelectEl(ctx)
          if (!month) return
          month.value = ctx.focusedValue.month.toString()
        },
        syncYearSelectElement(ctx) {
          const year = dom.getYearSelectEl(ctx)
          if (!year) return
          year.value = ctx.focusedValue.year.toString()
        },
        invokeOnFocusChange(ctx) {
          ctx.onFocusChange?.({ focusedValue: ctx.focusedValue, value: ctx.value, view: ctx.view })
        },
        invokeOnViewChange(ctx) {
          ctx.onViewChange?.({ view: ctx.view })
        },
        focusParsedDate(ctx, evt) {
          ctx.inputValue = evt.value
          const date = parseDateString(ctx.inputValue, ctx.locale, ctx.timeZone)
          if (!date) return
          ctx.focusedValue = date
        },
        resetView(ctx, _evt, { initialContext }) {
          ctx.view = initialContext.view
        },
        setStartValue(ctx) {
          const startValue = alignDate(ctx.focusedValue, "start", { months: ctx.numOfMonths }, ctx.locale)
          ctx.startValue = startValue
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
