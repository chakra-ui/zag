import type { CalendarDate, DateDuration, DateValue } from "@internationalized/date"
import type { StateMachine as S } from "@zag-js/core"
import type { DateAdjustFn } from "@zag-js/date-utils"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type PublicContext = DirectionProperty &
  CommonProperties & {
    locale: string
    timeZone: string
    disabled?: boolean
    readonly?: boolean
    min?: CalendarDate
    max?: CalendarDate
    value: CalendarDate | null
    focusedValue: CalendarDate
    numOfMonths?: number
    firstDayOfWeek?: number
    onChange?: (details: { value: CalendarDate }) => void
    onFocusChange?: (details: { value: CalendarDate }) => void
    onViewChange?: (details: { value: DateView }) => void
    isDateUnavailable?: (date: DateValue) => boolean
  }

type DateView = "date" | "month" | "year"

type PrivateContext = Context<{
  view: DateView
  startValue: CalendarDate
  hasFocus?: boolean
  announcer?: LiveRegion
  valueText: string
}>

type ComputedContext = Readonly<{
  endValue: CalendarDate
  weeks: (CalendarDate | null)[][]
  isInteractive: boolean
  visibleDuration: DateDuration
  visibleRange: { start: CalendarDate; end: CalendarDate }
  isNextVisibleRangeValid: boolean
  isPrevVisibleRangeValid: boolean
  visibleRangeText: string
  adjustFn: DateAdjustFn
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type CellProps = {
  date: CalendarDate
  disabled?: boolean
}

export type MachineState = {
  tags: "open" | "closed"
  value: "idle" | "focused" | "focused:spinning" | "open"
}
