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
import { getPlacement } from "@zag-js/popper"
import { disableTextSelection, restoreTextSelection } from "@zag-js/text-selection"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./date-picker.dom"
import type { DateValue, DateView, MachineContext, MachineState, UserDefinedContext } from "./date-picker.types"
import { adjustStartAndEndDate, formatValue, sortDates } from "./date-picker.utils"

const { and } = guards

const transformContext = (ctx: Partial<MachineContext>): MachineContext => {
  const locale = ctx.locale || "en-US"
  const timeZone = ctx.timeZone || "UTC"
  const selectionMode = ctx.selectionMode || "single"
  const numOfMonths = ctx.numOfMonths || 1

  // sort and constrain dates
  let value = sortDates(ctx.value || [])
  value = value.map((date) => constrainValue(date, ctx.min, ctx.max))

  // get initial focused value
  let focusedValue = value[0] || ctx.focusedValue || getTodayDate(timeZone)
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
    hoveredValue: null,
    closeOnSelect: true,
    ...ctx,
    positioning: {
      placement: "bottom",
      ...ctx.positioning,
    },
  } as MachineContext
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "datepicker",
      initial: ctx.open ? "open" : "idle",
      context: transformContext(ctx),
      computed: {
        valueAsString: (ctx) => ctx.value.map((date) => formatSelectedDate(date, null, ctx.locale, ctx.timeZone)),
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
        ],
        value: ["setInputValue"],
        valueAsString: ["announceValueText"],
        inputValue: ["syncInputElement"],
        view: ["focusActiveCell"],
        open: ["toggleVisibility"],
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
              actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },

        focused: {
          tags: "closed",
          on: {
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["setViewToDay", "focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"],
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
              actions: ["setView", "focusActiveCell", "invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },

        open: {
          tags: "open",
          activities: ["trackDismissableElement", "trackPositioning"],
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
              // === Grouped transitions (based on `closeOnSelect`) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
                target: "focused",
                actions: [
                  "setFocusedDate",
                  "setSelectedDate",
                  "setStartIndex",
                  "clearHoveredDate",
                  "focusInputElement",
                  "invokeOnClose",
                ],
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate"],
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
              // === Grouped transitions (based on `closeOnSelect`) ===
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["setFocusedDate", "setSelectedDate", "focusInputElement", "invokeOnClose"],
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
            "TABLE.ESCAPE": {
              target: "focused",
              actions: ["setViewToDay", "focusFirstSelectedDate", "focusTriggerElement", "invokeOnClose"],
            },
            "TABLE.ENTER": [
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
              // === Grouped transitions (based on `closeOnSelect`) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
                target: "focused",
                actions: ["setSelectedDate", "setStartIndex", "focusInputElement", "invokeOnClose"],
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setSelectedDate", "setStartIndex"],
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
              // === Grouped transitions (based on `closeOnSelect`) ===
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectFocusedDate", "focusInputElement", "invokeOnClose"],
              },
              {
                actions: ["selectFocusedDate"],
              },
              // ===
            ],
            "TABLE.ARROW_RIGHT": [
              { guard: "isMonthView", actions: "focusNextMonth" },
              { guard: "isYearView", actions: "focusNextYear" },
              { actions: ["focusNextDay", "setHoveredDate"] },
            ],
            "TABLE.ARROW_LEFT": [
              { guard: "isMonthView", actions: "focusPreviousMonth" },
              { guard: "isYearView", actions: "focusPreviousYear" },
              { actions: ["focusPreviousDay"] },
            ],
            "TABLE.ARROW_UP": [
              { guard: "isMonthView", actions: "focusPreviousMonthColumn" },
              { guard: "isYearView", actions: "focusPreviousYearColumn" },
              { actions: ["focusPreviousWeek"] },
            ],
            "TABLE.ARROW_DOWN": [
              { guard: "isMonthView", actions: "focusNextMonthColumn" },
              { guard: "isYearView", actions: "focusNextYearColumn" },
              { actions: ["focusNextWeek"] },
            ],
            "TABLE.PAGE_UP": {
              actions: ["focusPreviousSection"],
            },
            "TABLE.PAGE_DOWN": {
              actions: ["focusNextSection"],
            },
            "TABLE.HOME": [
              { guard: "isMonthView", actions: ["focusFirstMonth"] },
              { guard: "isYearView", actions: ["focusFirstYear"] },
              { actions: ["focusSectionStart"] },
            ],
            "TABLE.END": [
              { guard: "isMonthView", actions: ["focusLastMonth"] },
              { guard: "isYearView", actions: ["focusLastYear"] },
              { actions: ["focusSectionEnd"] },
            ],
            "TRIGGER.CLICK": {
              target: "focused",
              actions: ["invokeOnClose"],
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
                actions: ["setStartIndex", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["focusTriggerElement", "setStartIndex", "invokeOnClose"],
              },
            ],
            CLOSE: {
              target: "idle",
              actions: ["setStartIndex", "invokeOnClose"],
            },
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
        closeOnSelect: (ctx) => !!ctx.closeOnSelect,
      },
      activities: {
        trackPositioning(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const anchorEl = dom.getControlEl(ctx)
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(anchorEl, getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        setupLiveRegion(ctx) {
          const doc = dom.getDoc(ctx)
          ctx.announcer = createLiveRegion({ level: "assertive", document: doc })
          return () => ctx.announcer?.destroy?.()
        },
        trackDismissableElement(ctx, _evt, { send }) {
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
              send({ type: "TABLE.ESCAPE", src: "dismissable" })
            },
          })
        },
      },
      actions: {
        setViewToDay(ctx) {
          set.view(ctx, "day")
        },
        setViewToMonth(ctx) {
          set.view(ctx, "month")
        },
        setViewToYear(ctx) {
          set.view(ctx, "year")
        },
        setView(ctx, evt) {
          set.view(ctx, evt.cell)
        },
        announceValueText(ctx) {
          ctx.announcer?.announce(ctx.valueAsString.join(","), 3000)
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
          set.focusedValue(ctx, ctx.value[0])
        },
        setInputValue(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input) return
          ctx.inputValue = ctx.format?.(ctx.value) ?? formatValue(ctx)
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl || inputEl.value === ctx.inputValue) return
          raf(() => {
            // move cursor to the end
            inputEl.value = ctx.inputValue
            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
          })
        },
        setFocusedDate(ctx, evt) {
          const value = Array.isArray(evt.value) ? evt.value[0] : evt.value
          set.focusedValue(ctx, constrainValue(value, ctx.min, ctx.max))
        },
        setFocusedMonth(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.set({ month: evt.value }))
        },
        focusNextMonth(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add({ months: 1 }))
        },
        focusPreviousMonth(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ months: 1 }))
        },
        setFocusedYear(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.set({ year: evt.value }))
        },
        setSelectedDate(ctx, evt) {
          const values = [...ctx.value]
          values[ctx.activeIndex] = evt.value ?? ctx.focusedValue
          set.value(ctx, adjustStartAndEndDate(values))
        },
        toggleSelectedDate(ctx, evt) {
          const currentValue = evt.value ?? ctx.focusedValue
          const index = ctx.value.findIndex((date) => isDateEqual(date, currentValue))

          if (index === -1) {
            const values = [...ctx.value, currentValue]
            set.value(ctx, sortDates(values))
          } else {
            const values = [...ctx.value]
            values.splice(index, 1)
            set.value(ctx, sortDates(values))
          }
        },
        setHoveredDate(ctx, evt) {
          ctx.hoveredValue = evt.value
        },
        clearHoveredDate(ctx) {
          ctx.hoveredValue = null
        },
        selectFocusedDate(ctx) {
          const values = [...ctx.value]
          values[ctx.activeIndex] = ctx.focusedValue.copy()
          set.value(ctx, adjustStartAndEndDate(values))
        },
        adjustStartDate(ctx) {
          const adjust = getAdjustedDateFn(ctx.visibleDuration, ctx.locale, ctx.min, ctx.max)
          const { startDate, focusedDate } = adjust({ focusedDate: ctx.focusedValue, startDate: ctx.startValue })
          ctx.startValue = startDate
          set.focusedValue(ctx, focusedDate)
        },
        setPreviousDate(ctx) {
          set.focusedValue(ctx, getPreviousDay(ctx.focusedValue))
        },
        setNextDate(ctx) {
          set.focusedValue(ctx, getNextDay(ctx.focusedValue))
        },
        focusPreviousDay(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ days: 1 }))
        },
        focusNextDay(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add({ days: 1 }))
        },
        focusPreviousWeek(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ weeks: 1 }))
        },
        focusNextWeek(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add({ weeks: 1 }))
        },
        focusNextPage(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add(ctx.visibleDuration))
        },
        focusPreviousPage(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract(ctx.visibleDuration))
        },
        focusSectionStart(ctx) {
          set.focusedValue(ctx, ctx.startValue.copy())
        },
        focusSectionEnd(ctx) {
          set.focusedValue(ctx, ctx.endValue.copy())
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
          set.focusedValue(ctx, section.focusedDate)
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
          set.focusedValue(ctx, section.focusedDate)
        },
        focusNextYear(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add({ years: 1 }))
        },
        focusPreviousYear(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ years: 1 }))
        },
        focusNextDecade(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.add({ years: 10 }))
        },
        focusPreviousDecade(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ years: 10 }))
        },
        clearSelectedDate(ctx) {
          set.value(ctx, [])
        },
        clearFocusedDate(ctx) {
          set.focusedValue(ctx, getTodayDate(ctx.timeZone))
        },
        focusPreviousMonthColumn(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ months: evt.columns }))
        },
        focusNextMonthColumn(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.add({ months: evt.columns }))
        },
        focusPreviousYearColumn(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.subtract({ years: evt.columns }))
        },
        focusNextYearColumn(ctx, evt) {
          set.focusedValue(ctx, ctx.focusedValue.add({ years: evt.columns }))
        },
        focusFirstMonth(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.set({ month: 0 }))
        },
        focusLastMonth(ctx) {
          set.focusedValue(ctx, ctx.focusedValue.set({ month: 12 }))
        },
        focusFirstYear(ctx) {
          const range = getDecadeRange(ctx.focusedValue.year)
          set.focusedValue(ctx, ctx.focusedValue.set({ year: range.at(0) }))
        },
        focusLastYear(ctx) {
          const range = getDecadeRange(ctx.focusedValue.year)
          set.focusedValue(ctx, ctx.focusedValue.set({ year: range.at(-1) }))
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
          if (!evt.type.startsWith("TABLE.ARROW") || ctx.selectionMode !== "range" || ctx.activeIndex === 0) return
          ctx.hoveredValue = ctx.focusedValue.copy()
        },
        focusTriggerElement(ctx) {
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusInputElement(ctx) {
          raf(() => {
            dom.getInputEl(ctx)?.focus({ preventScroll: true })
          })
        },
        syncMonthSelectElement(ctx) {
          const monthSelectEl = dom.getMonthSelectEl(ctx)
          if (!monthSelectEl) return
          monthSelectEl.value = ctx.focusedValue.month.toString()
        },
        syncYearSelectElement(ctx) {
          const yearSelectEl = dom.getYearSelectEl(ctx)
          if (!yearSelectEl) return
          yearSelectEl.value = ctx.focusedValue.year.toString()
        },
        focusParsedDate(ctx, evt) {
          ctx.inputValue = evt.value
          const date = parseDateString(ctx.inputValue, ctx.locale, ctx.timeZone)
          set.focusedValue(ctx, date)
        },
        resetView(ctx, _evt, { initialContext }) {
          set.view(ctx, initialContext.view)
        },
        setStartValue(ctx) {
          const startValue = alignDate(ctx.focusedValue, "start", { months: ctx.numOfMonths }, ctx.locale)
          ctx.startValue = startValue
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
      },
      transformContext(ctx) {
        Object.assign(ctx, transformContext(ctx))
      },
      compareFns: {
        startValue: isDateEqual,
        focusedValue: isDateEqual,
        value: isDateEqualFn,
      },
    },
  )
}

const invoke = {
  change(ctx: MachineContext) {
    const value = Array.from(ctx.value)
    const valueAsString = value.map((date) => date.toString())
    ctx.onValueChange?.({
      value,
      valueAsString,
      view: ctx.view,
    })
  },
  focusChange(ctx: MachineContext) {
    const value = Array.from(ctx.value)
    const valueAsString = value.map((date) => date.toString())
    ctx.onFocusChange?.({
      focusedValue: ctx.focusedValue,
      value,
      valueAsString,
      view: ctx.view,
    })
  },
  viewChange(ctx: MachineContext) {
    ctx.onViewChange?.({ view: ctx.view })
  },
}

const isDateEqualFn = (a: DateValue[], b: DateValue[]) => {
  if (a.length !== b.length) return false
  return a.every((date, index) => isDateEqual(date, b[index]))
}

const set = {
  value(ctx: MachineContext, value: DateValue[]) {
    if (isDateEqualFn(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
  focusedValue(ctx: MachineContext, value: DateValue | undefined) {
    if (!value || isDateEqual(ctx.focusedValue, value)) return
    ctx.focusedValue = value
    invoke.focusChange(ctx)
  },
  view(ctx: MachineContext, value: DateView) {
    if (isEqual(ctx.view, value)) return
    ctx.view = value
    invoke.viewChange(ctx)
  },
}
