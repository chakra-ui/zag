import type {
  Calendar,
  CalendarDate,
  CalendarDateTime,
  DateDuration,
  DateFormatter,
  DateValue,
  ZonedDateTime,
} from "@internationalized/date"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { StateMachine as S } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { matchView } from "./date-picker.utils"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

interface ValueChangeDetails {
  value: DateValue[]
  view: DateView
}

interface FocusChangeDetails extends ValueChangeDetails {
  focusedValue: DateValue
  view: DateView
}

interface ViewChangeDetails {
  view: DateView
}

interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type DateView = "day" | "month" | "year"

export type SelectionMode = "single" | "multiple" | "range"

interface IntlMessages {
  placeholder: (locale: string) => { year: string; month: string; day: string }
}

type ElementIds = Partial<{
  grid(id: string): string
  header: string
  content: string
  cellTrigger(id: string): string
  prevTrigger(view: DateView): string
  nextTrigger(view: DateView): string
  viewTrigger(view: DateView): string
  clearTrigger: string
  control: string
  input: string
  trigger: string
  monthSelect: string
  yearSelect: string
  positioner: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The localized messages to use.
     */
    messages?: IntlMessages
    /**
     * The ids of the elements in the date picker. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The `name` attribute of the input element.
     */
    name?: string
    /**
     * The locale (BCP 47 language tag) to use when formatting the date.
     */
    locale: string
    /**
     * The time zone to use
     */
    timeZone: string
    /**
     * Whether the calendar is disabled.
     */
    disabled?: boolean
    /**
     * Whether the calendar is read-only.
     */
    readOnly?: boolean
    /**
     * The minimum date that can be selected.
     */
    min?: DateValue
    /**
     * The maximum date that can be selected.
     */
    max?: DateValue
    /**
     * Whether the calendar should be displayed inline.
     */
    inline?: boolean
    /**
     * The selected date(s).
     */
    value: DateValue[]
    /**
     * The focused date.
     */
    focusedValue: DateValue
    /**
     * The number of months to display.
     */
    numOfMonths: number
    /**
     * The first day of the week.
     *  `0` - Sunday
     *  `1` - Monday
     *  `2` - Tuesday
     *  `3` - Wednesday
     *  `4` - Thursday
     *  `5` - Friday
     *  `6` - Saturday
     */
    startOfWeek?: number
    /**
     * Whether the calendar should have a fixed number of weeks.
     * This renders the calendar with 6 weeks instead of 5 or 6.
     */
    fixedWeeks?: boolean
    /**
     * Function called when the value changes.
     */
    onValueChange?: (details: ValueChangeDetails) => void
    /**
     * Function called when the focused date changes.
     */
    onFocusChange?: (details: FocusChangeDetails) => void
    /**
     * Function called when the view changes.
     */
    onViewChange?: (details: ViewChangeDetails) => void
    /**
     * Function called when the calendar opens or closes.
     */
    onOpenChange?: (details: OpenChangeDetails) => void
    /**
     * Returns whether a date of the calendar is available.
     */
    isDateUnavailable?: (date: DateValue, locale: string) => boolean
    /**
     * The selection mode of the calendar.
     * - `single` - only one date can be selected
     * - `multiple` - multiple dates can be selected
     * - `range` - a range of dates can be selected
     */
    selectionMode: SelectionMode
    /**
     * The format of the date to display in the input.
     */
    format?: (date: DateValue[]) => string
    /**
     * The format of the date to display in the input.
     */
    parse?: (value: string) => DateValue[]
    /**
     * The view of the calendar
     * @default "day"
     */
    view: DateView
    /**
     * Whether the calendar should be modal. This means that the calendar will
     * block interaction with the rest of the page, and trap focus within it.
     */
    modal?: boolean
    /**
     * The user provided options used to position the date picker content
     */
    positioning: PositioningOptions
  }

type PrivateContext = Context<{
  /**
   * @internal
   * The start date of the current visible duration.
   */
  startValue: DateValue
  /**
   * @internal
   * Whether the calendar has focus
   */
  hasFocus?: boolean
  /**
   * @internal
   * The live region to announce changes
   */
  announcer?: LiveRegion
  /**
   * @internal
   * The input element's value
   */
  inputValue: string
  /**
   * @internal
   * The current hovered date. Useful for range selection mode.
   */
  hoveredValue: DateValue | null
  /**
   * @internal
   * The index of the currently active date.
   * Used in range selection mode.
   */
  activeIndex: number
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * The end date of the current visible duration.
   */
  endValue: DateValue
  /**
   * @computed
   * Whether the calendar is interactive.
   */
  isInteractive: boolean
  /**
   * @computed
   * The duration of the visible range.
   */
  visibleDuration: DateDuration
  /**
   * @computed
   * The start/end date of the current visible duration.
   */
  visibleRange: { start: DateValue; end: DateValue }
  /**
   * @computed
   * The text to announce when the visible range changes.
   */
  visibleRangeText: { start: string; end: string; formatted: string }
  /**
   * @computed
   * Whether the next visible range is valid.
   */
  isNextVisibleRangeValid: boolean
  /**
   * @computed
   * Whether the previous visible range is valid.
   */
  isPrevVisibleRangeValid: boolean
  /**
   * @computed
   * The value text to display in the input.
   */
  valueText: string
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed"
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export interface Offset {
  amount: number
  visibleRange: { start: DateValue; end: DateValue }
}

export interface CellProps {
  disabled?: boolean
  value: number
}

export interface CellState {
  isFocused: boolean
  isSelectable: boolean
  isSelected: boolean
  valueText: string
  readonly isDisabled: boolean
}

export interface DayCellProps {
  value: DateValue
  disabled?: boolean
  offset?: Offset
}

export interface DayCellState {
  isInvalid: boolean
  isDisabled: boolean
  isSelected: boolean
  isUnavailable: boolean
  isOutsideRange: boolean
  isInRange: boolean
  isFirstInRange: boolean
  isLastInRange: boolean
  isToday: boolean
  isWeekend: boolean
  formattedDate: string
  readonly isFocused: boolean
  readonly ariaLabel: string
  readonly isSelectable: boolean
}

export interface GridProps {
  view?: DateView
  columns?: number
  id?: string
}

export interface ViewProps {
  view?: DateView
}

export interface MonthGridProps {
  columns?: number
  format?: "short" | "long"
}

interface GridItem {
  label: string
  value: number
}

export type MonthGridValue = GridItem[][]

export interface YearGridProps {
  columns?: number
}

export type YearGridValue = GridItem[][]

/* -----------------------------------------------------------------------------
 * API types
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused
   */
  isFocused: boolean
  /**
   * Whether the date picker is open
   */
  isOpen: boolean | undefined
  /**
   * The current view of the date picker
   */
  view: DateView
  /**
   * Matcher for the current view of the date picker
   */
  matchView: typeof matchView
  /**
   * Returns an array of days in the week index counted from the provided start date, or the first visible date if not given.
   */
  getDaysInWeek(weekIndex: number, from?: DateValue): DateValue[]
  /**
   * Returns the offset of the month based on the provided number of months.
   */
  getOffset(months: number): {
    amount: number
    visibleRange: {
      start: CalendarDate | CalendarDateTime | ZonedDateTime
      end: CalendarDate | CalendarDateTime | ZonedDateTime
    }
    weeks: DateValue[][]
  }
  /**
   * Returns the weeks of the month from the provided date. Represented as an array of arrays of dates.
   */
  getMonthDays(from?: DateValue): DateValue[][]
  /**
   * Returns whether the provided date is available (or can be selected)
   */
  isUnavailable(date: DateValue): boolean
  /**
   * The weeks of the month. Represented as an array of arrays of dates.
   */
  readonly weeks: DateValue[][]
  /**
   * The days of the week. Represented as an array of strings.
   */
  weekDays: {
    value: CalendarDate | CalendarDateTime | ZonedDateTime
    short: string
    long: string
    narrow: string
  }[]
  /**
   * The human readable text for the visible range of dates.
   */
  visibleRangeText: {
    start: string
    end: string
    formatted: string
  }
  /**
   * The selected date.
   */
  value: DateValue[]
  /**
   * The selected date as a Date object.
   */
  valueAsDate: Date[]
  /**
   * The selected date as a string.
   */
  valueAsString: string[]
  /**
   * The focused date.
   */
  focusedValue: DateValue
  /**
   * The focused date as a Date object.
   */
  focusedValueAsDate: Date
  /**
   * The focused date as a string.
   */
  focusedValueAsString: string
  /**
   * Sets the selected date to today.
   */
  selectToday(): void
  /**
   * Sets the selected date to the given date.
   */
  setValue(values: CalendarDate[]): void
  /**
   * Sets the focused date to the given date.
   */
  setFocusedValue(value: CalendarDate): void
  /**
   * Clears the selected date(s).
   */
  clearValue(): void
  /**
   * Function to open the calendar.
   */
  open(): void
  /**
   * Function to close the calendar.
   */
  close(): void
  /**
   * Function to set the selected month.
   */
  focusMonth(month: number): void
  /**
   * Function to set the selected year.
   */
  focusYear(year: number): void
  /**
   * The visible range of dates.
   */
  visibleRange: {
    start: DateValue
    end: DateValue
  }
  /**
   * Returns the months of the year
   */
  getYears(): GridItem[]
  /**
   * Returns the years of the decade based on the columns.
   * Represented as an array of arrays of years.
   */
  getYearsGrid(props?: YearGridProps): YearGridValue
  /**
   * Returns the start and end years of the decade.
   */
  getDecade(): {
    start: number | undefined
    end: number | undefined
  }
  /**
   * Returns the months of the year
   */
  getMonths(props?: { format?: "short" | "long" }): GridItem[]
  /**
   * Returns the months of the year based on the columns.
   * Represented as an array of arrays of months.
   */
  getMonthsGrid(props?: MonthGridProps): MonthGridValue
  /**
   * Formats the given date value based on the provided options.
   */
  format(value: CalendarDate, opts?: Intl.DateTimeFormatOptions): string
  /**
   * Sets the view of the date picker.
   */
  setView(view: DateView): void
  /**
   * Goes to the next month/year/decade.
   */
  goToNext(): void
  /**
   * Goes to the previous month/year/decade.
   */
  goToPrev(): void
  /**
   * Returns the state details for a given cell.
   */
  getDayCellState(props: DayCellProps): DayCellState
  /**
   * Returns the state details for a given month cell.
   */
  getMonthCellState(props: CellProps): CellState

  controlProps: T["element"]
  contentProps: T["element"]
  positionerProps: T["element"]
  getGridProps(props?: GridProps): T["element"]
  getDayCellProps(props: DayCellProps): T["element"]
  getDayCellTriggerProps(props: DayCellProps): T["element"]
  getMonthCellProps(props: CellProps): T["element"]
  getMonthCellTriggerProps(props: CellProps): T["element"]
  getYearCellState(props: CellProps): CellState
  getYearCellProps(props: CellProps): T["element"]
  getYearCellTriggerProps(props: CellProps): T["element"]
  getNextTriggerProps(props?: ViewProps): T["button"]
  getPrevTriggerProps(props?: ViewProps): T["button"]
  getHeaderProps(props?: ViewProps): T["element"]
  clearTriggerProps: T["button"]
  triggerProps: T["button"]
  getViewTriggerProps(props?: ViewProps): T["button"]
  inputProps: T["input"]
  monthSelectProps: T["select"]
  yearSelectProps: T["select"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Calendar, CalendarDate, CalendarDateTime, DateDuration, DateFormatter, DateValue, ZonedDateTime }
