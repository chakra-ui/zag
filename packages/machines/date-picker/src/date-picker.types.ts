import type { CalendarDate, DateDuration, DateValue } from "@internationalized/date"
import type { StateMachine as S } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ChangeDetails = {
  value: CalendarDate
}

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The `name` attribute of the input element.
     */
    name?: string
    /**
     * The locale to use when formatting the date.
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
    min?: CalendarDate
    /**
     * The maximum date that can be selected.
     */
    max?: CalendarDate
    /**
     * The index of the currently active date.
     * Used in range selection mode.
     */
    activeIndex: number
    /**
     * Whether the calendar should be displayed inline.
     */
    inline?: boolean
    /**
     * The selected date(s).
     */
    value: CalendarDate[]
    /**
     * The focused date.
     */
    focusedValue: CalendarDate
    /**
     * The number of months to display.
     */
    numOfMonths?: number
    /**
     * The first day of the week.
     */
    startOfWeek?: number
    /**
     * Function called when the value changes.
     */
    onChange?: (details: ChangeDetails) => void
    /**
     * Function called when the focused date changes.
     */
    onFocusChange?: (details: ChangeDetails) => void
    /**
     * Function called when the view changes.
     */
    onViewChange?: (details: { value: DateView }) => void
    /**
     * Returns whether a date of the calendar is available.
     */
    isDateUnavailable?: (date: DateValue) => boolean
    /**
     * The selection mode of the calendar.
     * - `single` - only one date can be selected
     * - `multiple` - multiple dates can be selected
     * - `range` - a range of dates can be selected
     */
    selectionMode: "single" | "multiple" | "range"
  }

export type DateView = "day" | "month" | "year"

export type TriggerProps = {
  view?: DateView
}

type PrivateContext = Context<{
  view: DateView
  startValue: CalendarDate
  hasFocus?: boolean
  announcer?: LiveRegion
  valueText: string
}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * The end date of the current visible duration.
   */
  endValue: CalendarDate
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
  visibleRange: { start: CalendarDate; end: CalendarDate }
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
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type DayCellProps = {
  value: CalendarDate
  disabled?: boolean
}

export type MachineState = {
  tags: "open" | "closed"
  value: "idle" | "focused" | "open"
}
