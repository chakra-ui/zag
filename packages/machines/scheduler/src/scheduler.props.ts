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
  "date",
  "dayEndHour",
  "dayStartHour",
  "defaultDate",
  "defaultView",
  "dir",
  "disabled",
  "events",
  "expandRecurrence",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "onDateChange",
  "onEventClick",
  "onEventDrop",
  "onEventResize",
  "onSlotClick",
  "onSlotSelect",
  "onViewChange",
  "recurrenceExpansionLimit",
  "showCurrentTime",
  "showWeekNumbers",
  "slotInterval",
  "timeZone",
  "translations",
  "view",
  "weekStartDay",
  "workWeekDays",
])

export const splitProps = createSplitProps<Partial<SchedulerProps>>(props)

export const timeSlotProps = createProps<TimeSlotProps>()(["start", "end"])
export const splitTimeSlotProps = createSplitProps<TimeSlotProps>(timeSlotProps)

export const dayColumnProps = createProps<DayColumnProps>()(["date"])
export const splitDayColumnProps = createSplitProps<DayColumnProps>(dayColumnProps)

export const dayCellProps = createProps<DayCellProps>()(["date", "referenceDate"])
export const splitDayCellProps = createSplitProps<DayCellProps>(dayCellProps)

export const eventProps = createProps<EventProps>()(["event"])
export const splitEventProps = createSplitProps<EventProps>(eventProps)

export const eventResizeHandleProps = createProps<EventResizeHandleProps>()(["event", "edge"])
export const splitEventResizeHandleProps = createSplitProps<EventResizeHandleProps>(eventResizeHandleProps)

export const moreEventsProps = createProps<MoreEventsProps>()(["date", "count"])
export const splitMoreEventsProps = createSplitProps<MoreEventsProps>(moreEventsProps)

export const viewItemProps = createProps<ViewItemProps>()(["view"])
export const splitViewItemProps = createSplitProps<ViewItemProps>(viewItemProps)
