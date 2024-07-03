import type {
  Calendar,
  CalendarDate,
  CalendarDateTime,
  DateDuration,
  DateFormatter,
  DateValue,
  ZonedDateTime,
} from "@internationalized/date"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { DateRangePreset } from "@zag-js/date-utils"
import type { LiveRegion } from "@zag-js/live-region"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type DateView = "day" | "month" | "year"

export interface ValueChangeDetails {
  value: DateValue[]
  valueAsString: string[]
  view: DateView
}

export interface FocusChangeDetails extends ValueChangeDetails {
  focusedValue: DateValue
  view: DateView
}

export interface ViewChangeDetails {
  view: DateView
}

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type SelectionMode = "single" | "multiple" | "range"

export interface IntlTranslations {
  dayCell(state: DayTableCellState): string
  nextTrigger(view: DateView): string
  monthSelect: string
  yearSelect: string
  viewTrigger(view: DateView): string
  prevTrigger(view: DateView): string
  presetTrigger(value: string[]): string
  clearTrigger: string
  trigger(open: boolean): string
  content: string
  placeholder: (locale: string) => { year: string; month: string; day: string }
}

export type ElementIds = Partial<{
  root: string
  label: string
  table(id: string): string
  tableHeader(id: string): string
  tableBody(id: string): string
  tableRow(id: string): string
  content: string
  cellTrigger(id: string): string
  prevTrigger(view: DateView): string
  nextTrigger(view: DateView): string
  viewTrigger(view: DateView): string
  clearTrigger: string
  control: string
  input(index: number): string
  trigger: string
  monthSelect: string
  yearSelect: string
  positioner: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The locale (BCP 47 language tag) to use when formatting the date.
   * @default "en-US"
   */
  locale: string
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations
  /**
   * The ids of the elements in the date picker. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The `name` attribute of the input element.
   */
  name?: string
  /**
   * The time zone to use
   * @default "UTC"
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
   * Whether the calendar should close after the date selection is complete.
   * This is ignored when the selection mode is `multiple`.
   * @default true
   */
  closeOnSelect?: boolean
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
   *
   * @default "single"
   */
  selectionMode: SelectionMode
  /**
   * The format of the date to display in the input.
   */
  format?: (date: DateValue) => string
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
  /**
   * Whether the datepicker is open
   */
  open?: boolean
  /**
   * Whether the datepicker open state is controlled by the user
   */
  "open.controlled"?: boolean
}

interface PrivateContext {
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
  /**
   * @internal
   * Whether the calendar should restore focus to the input when it closes.
   */
  restoreFocus?: boolean
}

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
  valueAsString: string[]
  /**
   * @internal
   * The input element's value
   */
  formattedValue: string[]
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed"
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface Range<T> {
  start: T
  end: T
}

export type VisibleRange = Range<DateValue>

export interface DateValueOffset {
  visibleRange: VisibleRange
  weeks: DateValue[][]
}

export interface TableCellProps {
  disabled?: boolean
  value: number
  columns?: number
}

export interface TableCellState {
  focused: boolean
  selectable: boolean
  selected: boolean
  valueText: string
  readonly disabled: boolean
}

export interface DayTableCellProps {
  value: DateValue
  disabled?: boolean
  visibleRange?: VisibleRange
}

export interface DayTableCellState {
  invalid: boolean
  disabled: boolean
  selected: boolean
  unavailable: boolean
  outsideRange: boolean
  inRange: boolean
  firstInRange: boolean
  lastInRange: boolean
  today: boolean
  weekend: boolean
  formattedDate: string
  readonly focused: boolean
  readonly ariaLabel: string
  readonly selectable: boolean
}

export interface TableProps {
  view?: DateView
  columns?: number
  id?: string
}

export type PresetTriggerValue = DateValue[] | DateRangePreset

export interface PresetTriggerProps {
  value: PresetTriggerValue
}

export interface ViewProps {
  view?: DateView
}

export interface InputProps {
  index?: number
}

export interface MonthGridProps {
  columns?: number
  format?: "short" | "long"
}

export interface Cell {
  label: string
  value: number
}

export type MonthGridValue = Cell[][]

export interface YearGridProps {
  columns?: number
}

export type YearGridValue = Cell[][]

export interface WeekDay {
  value: DateValue
  short: string
  long: string
  narrow: string
}

export interface MonthFormatOptions {
  format?: "short" | "long"
}

export interface VisibleRangeText extends Range<string> {
  formatted: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused
   */
  focused: boolean
  /**
   * Whether the date picker is open
   */
  open: boolean
  /**
   * The current view of the date picker
   */
  view: DateView
  /**
   * Returns an array of days in the week index counted from the provided start date, or the first visible date if not given.
   */
  getDaysInWeek(week: number, from?: DateValue): DateValue[]
  /**
   * Returns the offset of the month based on the provided number of months.
   */
  getOffset(duration: DateDuration): DateValueOffset
  /**
   * Returns the range of dates based on the provided date range preset.
   */
  getRangePresetValue(value: DateRangePreset): DateValue[]
  /**
   * Returns the weeks of the month from the provided date. Represented as an array of arrays of dates.
   */
  getMonthWeeks(from?: DateValue): DateValue[][]
  /**
   * Returns whether the provided date is available (or can be selected)
   */
  isUnavailable(date: DateValue): boolean
  /**
   * The weeks of the month. Represented as an array of arrays of dates.
   */
  weeks: DateValue[][]
  /**
   * The days of the week. Represented as an array of strings.
   */
  weekDays: WeekDay[]
  /**
   * The visible range of dates.
   */
  visibleRange: VisibleRange
  /**
   * The human readable text for the visible range of dates.
   */
  visibleRangeText: VisibleRangeText
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
   * Function to open or close the calendar.
   */
  setOpen(open: boolean): void
  /**
   * Function to set the selected month.
   */
  focusMonth(month: number): void
  /**
   * Function to set the selected year.
   */
  focusYear(year: number): void
  /**
   * Returns the months of the year
   */
  getYears(): Cell[]
  /**
   * Returns the years of the decade based on the columns.
   * Represented as an array of arrays of years.
   */
  getYearsGrid(props?: YearGridProps): YearGridValue
  /**
   * Returns the start and end years of the decade.
   */
  getDecade(): Range<number | undefined>
  /**
   * Returns the months of the year
   */
  getMonths(props?: MonthFormatOptions): Cell[]
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
  getDayTableCellState(props: DayTableCellProps): DayTableCellState
  /**
   * Returns the state details for a given month cell.
   */
  getMonthTableCellState(props: TableCellProps): TableCellState
  /**
   * Returns the state details for a given year cell.
   */
  getYearTableCellState(props: TableCellProps): TableCellState

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getControlProps(): T["element"]
  getContentProps(): T["element"]
  getPositionerProps(): T["element"]
  getRangeTextProps(): T["element"]

  getTableProps(props?: TableProps): T["element"]
  getTableHeadProps(props?: TableProps): T["element"]
  getTableHeaderProps(props?: TableProps): T["element"]
  getTableBodyProps(props?: TableProps): T["element"]
  getTableRowProps(props?: TableProps): T["element"]

  getDayTableCellProps(props: DayTableCellProps): T["element"]
  getDayTableCellTriggerProps(props: DayTableCellProps): T["element"]

  getMonthTableCellProps(props: TableCellProps): T["element"]
  getMonthTableCellTriggerProps(props: TableCellProps): T["element"]

  getYearTableCellProps(props: TableCellProps): T["element"]
  getYearTableCellTriggerProps(props: TableCellProps): T["element"]

  getNextTriggerProps(props?: ViewProps): T["button"]
  getPrevTriggerProps(props?: ViewProps): T["button"]

  getClearTriggerProps(): T["button"]
  getTriggerProps(): T["button"]
  getPresetTriggerProps(props: PresetTriggerProps): T["button"]
  getViewTriggerProps(props?: ViewProps): T["button"]
  getViewControlProps(props?: ViewProps): T["element"]
  getInputProps(props?: InputProps): T["input"]
  getMonthSelectProps(): T["select"]
  getYearSelectProps(): T["select"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type {
  Calendar,
  CalendarDate,
  CalendarDateTime,
  DateDuration,
  DateFormatter,
  DateRangePreset,
  DateValue,
  PositioningOptions,
  ZonedDateTime,
}
