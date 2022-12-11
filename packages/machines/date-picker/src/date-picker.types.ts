import type { CalendarDate, DateDuration, DateFormatter, DateValue, Granularity } from "@zag-js/date-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"
import { LiveRegion } from "@zag-js/live-region"

export interface DateSegment {
  type: keyof Intl.DateTimeFormatPartTypesRegistry
  text: string
  value?: number
  min?: number
  max?: number
  isPlaceholder: boolean
  placeholder: string
  isEditable: boolean
}

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
    granularity: Granularity
    onChange?: (details: { value: CalendarDate }) => void
    isDateUnavailable?: (date: DateValue) => boolean
    placeholderValue?: DateValue
  }

type PrivateContext = Context<{
  hasFocus?: boolean
  annoucer?: LiveRegion
  selectedDateDescription: string
  focusedSegment: DateSegment["type"] | null
  allSegments: Partial<Record<DateSegment["type"], boolean>>
  validSegments: Partial<Record<DateSegment["type"], boolean>>
  getDateFormatter: (options: Intl.DateTimeFormatOptions) => DateFormatter
  getPlaceholder: (ootions: { field: string; locale?: string }) => string
}>

type ComputedContext = Readonly<{
  dayFormatter: DateFormatter
  endValue: CalendarDate
  weeks: (CalendarDate | null)[][]
  isInteractive: boolean
  visibleRange: { start: CalendarDate; end: CalendarDate }
  isNextVisibleRangeValid: boolean
  isPrevVisibleRangeValid: boolean
  visibleRangeDescription: string
  validSegmentDetails: { complete: boolean; keys: string[]; exceeds: boolean }
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
  value: "idle" | "focused" | "focused:spin" | "open:month" | "open:year"
}
