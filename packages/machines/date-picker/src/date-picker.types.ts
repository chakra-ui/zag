import type { CalendarDate, DateDuration, DateFormatter, DateValue } from "@zag-js/date-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"
import { LiveRegion } from "@zag-js/live-region"

type ElementIds = Partial<{
  root: string
  grid: string
  cell(id: string): string
  cellTrigger(id: string): string
  control: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    ids?: ElementIds
    locale: string
    timeZone: string
    disabled?: boolean
    readonly?: boolean
    min?: CalendarDate
    max?: CalendarDate
    value?: CalendarDate
    focusedValue: CalendarDate
    duration: DateDuration
    startValue: CalendarDate
    onChange?: (details: { value: CalendarDate }) => void
    isDateUnavailable?: (date: DateValue) => boolean
  }

type DateFormatterFn = (options: Intl.DateTimeFormatOptions) => DateFormatter

type PrivateContext = Context<{
  hasFocus?: boolean
  annoucer?: LiveRegion
  formatter: DateFormatterFn
}>

type ComputedContext = Readonly<{
  dayFormatter: DateFormatter
  endValue: CalendarDate
  weeks: (CalendarDate | null)[][]
  isInteractive: boolean
  visibleRange: { start: CalendarDate; end: CalendarDate }
  isNextVisibleRangeValid: boolean
  isPrevVisibleRangeValid: boolean
  selectedDateDescription: string
  visibleRangeDescription: string
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
  value: "idle" | "focused" | "open:month" | "open:year"
}
