import { CalendarDate, DateDuration, DateValue } from "@internationalized/date"

export type DateContext = DateValueRange & {
  locale: string
  timeZone: string
  duration: DateDuration
  isDateUnavailable?: (date: CalendarDate) => boolean
}

export type DateValueRange = {
  min?: DateValue
  max?: DateValue
}

export type DateSegmentContext = {}
