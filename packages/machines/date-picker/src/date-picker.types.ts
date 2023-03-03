import type { CalendarDate, DateDuration, DateValue } from "@internationalized/date"
import type { StateMachine as S } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ChangeDetails = {
  value: CalendarDate
}

type PublicContext = DirectionProperty &
  CommonProperties & {
    locale: string
    timeZone: string
    disabled?: boolean
    readonly?: boolean
    min?: CalendarDate
    max?: CalendarDate
    activeIndex: number
    value: CalendarDate[]
    focusedValue: CalendarDate
    numOfMonths?: number
    onChange?: (details: ChangeDetails) => void
    onFocusChange?: (details: ChangeDetails) => void
    onViewChange?: (details: { value: DateView }) => void
    isDateUnavailable?: (date: DateValue) => boolean
    selectionMode: "single" | "multiple" | "range"
    parse?: (value: string) => CalendarDate[]
    format?: (value: CalendarDate[]) => string
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
  endValue: CalendarDate
  isInteractive: boolean
  visibleDuration: DateDuration
  visibleRange: { start: CalendarDate; end: CalendarDate }
  isNextVisibleRangeValid: boolean
  isPrevVisibleRangeValid: boolean
  visibleRangeText: string
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
  value: "idle" | "focused" | "open" | "open:range"
}
