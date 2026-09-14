import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type {
  DayColumnProps,
  DayCellProps,
  EventProps,
  EventResizeHandleProps,
  MoreEventsProps,
  SchedulerProps,
  TimeSlotProps,
  ViewItemProps,
} from "./scheduler.types"

export const props = createProps<SchedulerProps>()([
  "canDragEvent",
  "canResizeEvent",
  "canDropEvent",
  "date",
  "dayEndHour",
  "dayStartHour",
  "defaultDate",
  "defaultView",
  "dir",
  "disabled",
  "events",
  "groupBy",
  "expandRecurrence",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "resources",
  "onDateChange",
  "onEventClick",
  "onEventDrop",
  "onEventResize",
  "onDayActivate",
  "onSlotDoubleClick",
  "onSlotSelect",
  "onEventReceive",
  "dataTransferFormat",
  "onViewChange",
  "maxAllDayRows",
  "maxRecurrenceInstances",
  "showCurrentTime",
  "showWeekNumbers",
  "slotInterval",
  "timeZone",
  "translations",
  "view",
  "startOfWeek",
  "workWeekDays",
  "workWeekOnly",
])

export const splitProps = createSplitProps<Partial<SchedulerProps>>(props)

export const timeSlotProps = createProps<TimeSlotProps>()(["start", "end"])
export const splitTimeSlotProps = createSplitProps<TimeSlotProps>(timeSlotProps)

export const dayColumnProps = createProps<DayColumnProps>()(["date", "resource"])
export const splitDayColumnProps = createSplitProps<DayColumnProps>(dayColumnProps)

export const dayCellProps = createProps<DayCellProps>()(["date", "referenceDate", "allDay"])
export const splitDayCellProps = createSplitProps<DayCellProps>(dayCellProps)

export const eventProps = createProps<EventProps>()(["event", "layout", "segment"])
export const splitEventProps = createSplitProps<EventProps>(eventProps)

export const eventResizeHandleProps = createProps<EventResizeHandleProps>()(["event", "edge"])
export const splitEventResizeHandleProps = createSplitProps<EventResizeHandleProps>(eventResizeHandleProps)

export const moreEventsProps = createProps<MoreEventsProps>()(["date", "count"])
export const splitMoreEventsProps = createSplitProps<MoreEventsProps>(moreEventsProps)

export const viewItemProps = createProps<ViewItemProps>()(["view"])
export const splitViewItemProps = createSplitProps<ViewItemProps>(viewItemProps)
