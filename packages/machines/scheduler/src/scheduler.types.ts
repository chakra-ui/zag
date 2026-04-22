import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"
import type { DateValue } from "@internationalized/date"

/* -----------------------------------------------------------------------------
 * Event / Resource data models
 * -----------------------------------------------------------------------------*/

export interface SchedulerEvent<T = Record<string, unknown>> {
  id: string
  title: string
  start: DateValue
  end: DateValue
  allDay?: boolean | undefined
  color?: string | undefined
  resourceId?: string | undefined
  recurrence?: { rrule: string; exdate?: DateValue[] | undefined } | undefined
  disabled?: boolean | undefined
  display?: "default" | "background" | undefined
  payload?: T | undefined
}

export interface Resource {
  id: string
  title: string
  color?: string | undefined
  children?: Resource[] | undefined
}

/**
 * Expands a recurring event into concrete instances within a date range.
 * Consumers provide their preferred RRULE library (rrule.js, rrule-alt, etc.).
 */
export type RecurrenceExpander<T = Record<string, unknown>> = (
  event: SchedulerEvent<T>,
  range: { start: DateValue; end: DateValue },
) => SchedulerEvent<T>[]

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type ViewType = "day" | "week" | "month" | "year" | "agenda"

export interface ViewChangeDetails {
  view: ViewType
}

export interface DateChangeDetails {
  date: DateValue
}

export interface SlotSelectDetails {
  start: DateValue
  end: DateValue
  resourceId?: string | undefined
}

export interface EventClickDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
}

export interface EventDropDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
  newStart: DateValue
  newEnd: DateValue
  newResourceId?: string | undefined
}

export interface EventResizeDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
  newStart: DateValue
  newEnd: DateValue
  edge: "start" | "end"
}

/* -----------------------------------------------------------------------------
 * Props
 * -----------------------------------------------------------------------------*/

export interface SchedulerTranslations {
  prevTriggerLabel: string
  nextTriggerLabel: string
  todayTriggerLabel: string
  viewLabels: Record<ViewType, string>
}

export type ElementIds = Partial<{
  root: string
  grid: string
  event: (id: string) => string
  timeSlot: (key: string) => string
  dayColumn: (key: string) => string
  dayCell: (key: string) => string
}>

export interface SchedulerProps<T = Record<string, unknown>> extends CommonProperties {
  ids?: ElementIds | undefined
  /** Current view mode */
  view?: ViewType | undefined
  /** Initial view mode when uncontrolled */
  defaultView?: ViewType | undefined
  onViewChange?: ((details: ViewChangeDetails) => void) | undefined
  /** Current focused date */
  date?: DateValue | undefined
  /** Initial focused date when uncontrolled */
  defaultDate?: DateValue | undefined
  onDateChange?: ((details: DateChangeDetails) => void) | undefined
  /** Flat list of events (expand recurring events before passing) */
  events?: SchedulerEvent<T>[] | undefined
  resources?: Resource[] | undefined
  /** Minutes per time slot — 15, 30, or 60. @default 30 */
  slotInterval?: 15 | 30 | 60 | undefined
  /** First hour shown in day/week time grid. @default 0 */
  dayStartHour?: number | undefined
  /** Last hour shown in day/week time grid. @default 24 */
  dayEndHour?: number | undefined
  /** Days of week to show in work-week mode, 0=Sun…6=Sat. @default [1,2,3,4,5] */
  workWeekDays?: number[] | undefined
  onSlotSelect?: ((details: SlotSelectDetails) => void) | undefined
  onEventClick?: ((details: EventClickDetails<T>) => void) | undefined
  onEventDrop?: ((details: EventDropDetails<T>) => void) | undefined
  onEventResize?: ((details: EventResizeDetails<T>) => void) | undefined
  /** Return false to prevent dragging an event. Gates entry to event-dragging state. */
  canDragEvent?: ((event: SchedulerEvent<T>) => boolean) | undefined
  /** Return false to prevent resizing an event. Gates entry to event-resizing state. */
  canResizeEvent?: ((event: SchedulerEvent<T>) => boolean) | undefined
  /** BCP 47 locale used for week-start day and date formatting. @default "en-US" */
  locale?: string | undefined
  /** IANA timezone string. Defaults to local timezone. */
  timeZone?: string | undefined
  /** Override the first day of the week (0=Sun…6=Sat). Falls back to locale default. */
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
  showWeekNumbers?: boolean | undefined
  /** Show a line at the current time in day/week views. @default true */
  showCurrentTime?: boolean | undefined
  /** Upper bound on expanded recurring instances per visible range. @default 2000 */
  recurrenceExpansionLimit?: number | undefined
  /** Called on each recurring event to expand instances within the visible range. */
  expandRecurrence?: RecurrenceExpander<T> | undefined
  translations?: SchedulerTranslations | undefined
  disabled?: boolean | undefined
}

type PropsWithDefault =
  | "defaultView"
  | "slotInterval"
  | "dayStartHour"
  | "dayEndHour"
  | "workWeekDays"
  | "locale"
  | "showCurrentTime"
  | "showWeekNumbers"
  | "recurrenceExpansionLimit"

/* -----------------------------------------------------------------------------
 * Machine schema
 * -----------------------------------------------------------------------------*/

interface LiveDrag {
  eventId: string
  kind: "drag" | "resize"
  edge: "start" | "end" | null
  start: DateValue
  end: DateValue
}

interface LiveSlot {
  start: DateValue
  end: DateValue
  resourceId?: string
}

interface SchedulerContext {
  view: ViewType
  date: DateValue
  focusedEventId: string | null
  selectedEventId: string | null
  selectedSlot: { start: DateValue; end: DateValue; resourceId?: string } | null
  liveDrag: LiveDrag | null
  liveSlot: LiveSlot | null
}

type Computed = Readonly<{
  visibleRange: { start: DateValue; end: DateValue }
  isInteractive: boolean
}>

export interface SchedulerSchema<T = Record<string, unknown>> {
  state: "idle" | "slot-selecting" | "event-dragging" | "event-resizing"
  props: RequiredBy<SchedulerProps<T>, PropsWithDefault>
  context: SchedulerContext
  refs: {
    dragEventId: string | null
    dragOrigin: { x: number; y: number } | null
    dragEdge: "start" | "end" | null
    dragStartSnapshot: { start: DateValue; end: DateValue } | null
    dragCurrentStart: DateValue | null
    dragCurrentEnd: DateValue | null
    dragSlotStart: DateValue | null
    dragSlotEnd: DateValue | null
  }
  computed: Computed
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type SchedulerService<T = Record<string, unknown>> = Service<SchedulerSchema<T>>
export type SchedulerMachine<T = Record<string, unknown>> = Machine<SchedulerSchema<T>>

/* -----------------------------------------------------------------------------
 * Connect API types
 * -----------------------------------------------------------------------------*/

export interface EventPosition {
  /** 0–1 fraction of the day column. Multiply by 100 for %, or by container height for px. */
  top: number
  height: number
  left: number
  width: number
  column: number
  totalColumns: number
}

export interface EventStateDetail {
  dragging: boolean
  resizing: boolean
  focused: boolean
  selected: boolean
  conflict: boolean
}

export interface TimeSlotProps {
  start: DateValue
  end: DateValue
  resourceId?: string | undefined
}

export interface DayColumnProps {
  date: DateValue
  resourceId?: string | undefined
}

export interface DayCellProps {
  date: DateValue
}

export interface ResourceHeaderProps {
  resource: Resource
}

export interface EventProps<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
}

export interface EventResizeHandleProps<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
  edge: "start" | "end"
}

export interface MoreEventsProps {
  date: DateValue
  count: number
}

export interface ViewItemProps {
  view: ViewType
}

export interface SchedulerApi<T extends PropTypes = PropTypes, E = Record<string, unknown>> {
  view: ViewType
  date: DateValue
  visibleRange: { start: DateValue; end: DateValue }
  /** All events (recurring instances expanded against the visible range). */
  events: SchedulerEvent<E>[]
  resources: Resource[]
  isDragging: boolean
  isSlotSelecting: boolean
  isResizing: boolean
  /** Live preview of the event being dragged — null when not dragging. */
  dragPreview: { eventId: string; start: DateValue | null; end: DateValue | null } | null

  setView: (view: ViewType) => void
  setDate: (date: DateValue) => void
  goToToday: () => void
  goToNext: () => void
  goToPrev: () => void

  getEventState: (id: string) => EventStateDetail
  getEventPosition: (event: SchedulerEvent<E>) => EventPosition
  getEventsForDay: (date: DateValue) => SchedulerEvent<E>[]
  getEventsForSlot: (start: DateValue, end: DateValue, resourceId?: string) => SchedulerEvent<E>[]
  hasConflict: (event: SchedulerEvent<E>) => boolean

  getRootProps: () => T["element"]
  getHeaderProps: () => T["element"]
  getHeaderTitleProps: () => T["element"]
  getPrevTriggerProps: () => T["button"]
  getNextTriggerProps: () => T["button"]
  getTodayTriggerProps: () => T["button"]
  getViewSelectProps: () => T["element"]
  getViewItemProps: (props: ViewItemProps) => T["button"]
  getGridProps: () => T["element"]
  getAllDayRowProps: () => T["element"]
  getTimeSlotProps: (props: TimeSlotProps) => T["element"]
  getTimeGutterProps: () => T["element"]
  getDayColumnProps: (props: DayColumnProps) => T["element"]
  getDayCellProps: (props: DayCellProps) => T["element"]
  getResourceHeaderProps: (props: ResourceHeaderProps) => T["element"]
  getEventProps: (props: EventProps<E>) => T["element"]
  getEventResizeHandleProps: (props: EventResizeHandleProps<E>) => T["element"]
  getCurrentTimeIndicatorProps: () => T["element"]
  getMoreEventsProps: (props: MoreEventsProps) => T["button"]
}
