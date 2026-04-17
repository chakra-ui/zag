import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type {
  DayColumnProps,
  DayCellProps,
  EventProps,
  EventResizeHandleProps,
  MoreEventsProps,
  ResourceHeaderProps,
  SchedulerProps,
  TimeSlotProps,
} from "./scheduler.types"

export const props = createProps<SchedulerProps>()([
  "canDragEvent",
  "canResizeEvent",
  "date",
  "dayEndHour",
  "dayStartHour",
  "defaultDate",
  "defaultView",
  "events",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "onDateChange",
  "onEventClick",
  "onEventDrop",
  "onEventResize",
  "onSlotSelect",
  "onViewChange",
  "resources",
  "showCurrentTime",
  "showWeekNumbers",
  "slotInterval",
  "timeZone",
  "translations",
  "view",
  "workWeekDays",
])

export const splitProps = createSplitProps<Partial<SchedulerProps>>(props)

export const timeSlotProps = createProps<TimeSlotProps>()(["start", "end", "resourceId"])
export const splitTimeSlotProps = createSplitProps<TimeSlotProps>(timeSlotProps)

export const dayColumnProps = createProps<DayColumnProps>()(["date", "resourceId"])
export const splitDayColumnProps = createSplitProps<DayColumnProps>(dayColumnProps)

export const dayCellProps = createProps<DayCellProps>()(["date"])
export const splitDayCellProps = createSplitProps<DayCellProps>(dayCellProps)

export const eventProps = createProps<EventProps>()(["event"])
export const splitEventProps = createSplitProps<EventProps>(eventProps)

export const eventResizeHandleProps = createProps<EventResizeHandleProps>()(["event", "edge"])
export const splitEventResizeHandleProps = createSplitProps<EventResizeHandleProps>(eventResizeHandleProps)

export const moreEventsProps = createProps<MoreEventsProps>()(["date", "count"])
export const splitMoreEventsProps = createSplitProps<MoreEventsProps>(moreEventsProps)

export const resourceHeaderProps = createProps<ResourceHeaderProps>()(["resource"])
export const splitResourceHeaderProps = createSplitProps<ResourceHeaderProps>(resourceHeaderProps)
