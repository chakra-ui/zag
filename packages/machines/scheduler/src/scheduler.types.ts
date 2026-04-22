import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { DateValue } from "@internationalized/date"

/* -----------------------------------------------------------------------------
 * Event data model
 * -----------------------------------------------------------------------------*/

export interface SchedulerEvent<T = Record<string, unknown>> {
  id: string
  title: string
  start: DateValue
  end: DateValue
  allDay?: boolean | undefined
  color?: string | undefined
  recurrence?: { rrule: string; exdate?: DateValue[] | undefined } | undefined
  disabled?: boolean | undefined
  /** Arbitrary typed metadata attached to the event (attendees, location, links…). */
  payload?: T | undefined
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
}

export interface SlotClickDetails {
  /** The single slot that was clicked (no drag). */
  start: DateValue
  /** slotInterval after `start`, for convenience when creating an event. */
  end: DateValue
}

export interface EventClickDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
}

export interface EventDropDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
  /** Index of the event in the `events` prop array (-1 if not found). */
  index: number
  newStart: DateValue
  newEnd: DateValue
  /**
   * Returns a new events array with this event's `start`/`end` updated.
   * Lets consumers write `setEvents(d.apply)` instead of mapping by hand.
   */
  apply: (events: SchedulerEvent<T>[]) => SchedulerEvent<T>[]
}

export interface EventResizeDetails<T = Record<string, unknown>> {
  event: SchedulerEvent<T>
  /** Index of the event in the `events` prop array (-1 if not found). */
  index: number
  newStart: DateValue
  newEnd: DateValue
  edge: "start" | "end"
  /**
   * Returns a new events array with this event's `start`/`end` updated.
   * Lets consumers write `setEvents(d.apply)` instead of mapping by hand.
   */
  apply: (events: SchedulerEvent<T>[]) => SchedulerEvent<T>[]
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

export interface SchedulerProps<T = Record<string, unknown>> extends CommonProperties, DirectionProperty {
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
  /** Minutes per time slot — 15, 30, or 60. @default 30 */
  slotInterval?: 15 | 30 | 60 | undefined
  /** First hour shown in day/week time grid. @default 0 */
  dayStartHour?: number | undefined
  /** Last hour shown in day/week time grid. @default 24 */
  dayEndHour?: number | undefined
  /** Days of week to show in work-week mode, 0=Sun…6=Sat. @default [1,2,3,4,5] */
  workWeekDays?: number[] | undefined
  onSlotSelect?: ((details: SlotSelectDetails) => void) | undefined
  /** Fires when an empty slot is clicked without dragging (use to open a "new event" popover). */
  onSlotClick?: ((details: SlotClickDetails) => void) | undefined
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
  // TODO: Consider renamining this to something more intuitive like `maxExpandedInstances` or `recurrenceInstanceLimit`
  /** Upper bound on expanded recurring instances per visible range. @default 2000 */
  maxRecurrenceInstances?: number | undefined
  /** Called on each recurring event to expand instances within the visible range. */
  expandRecurrence?: RecurrenceExpander<T> | undefined
  translations?: SchedulerTranslations | undefined
  disabled?: boolean | undefined

  // TODO: Implement RTL layout support, then add a control/example for RTL mode.
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
  | "maxRecurrenceInstances"

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
}

interface SchedulerContext {
  view: ViewType
  date: DateValue
  focusedEventId: string | null
  selectedEventId: string | null
  selectedSlot: { start: DateValue; end: DateValue } | null
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
}

export interface DayColumnProps {
  date: DateValue
}

export interface DayCellProps {
  date: DateValue
  /**
   * Reference date for month-based layouts — used to decide whether the cell is
   * "outside" the current month (greys it out). Defaults to `api.date`.
   */
  referenceDate?: DateValue
}

/**
 * A single day in a month-grid rendering. Produced by `api.getMonthGrid`.
 * Data attributes are already surfaced via `getDayCellProps` — this shape is
 * for when consumers need the booleans directly (e.g. to render a dot for
 * events, or a custom className).
 */
export interface MonthGridDay {
  date: DateValue
  /** Whether this day falls inside the reference month (false = leading/trailing filler). */
  inMonth: boolean
  /** Whether this day is today (locale/timezone aware). */
  isToday: boolean
  /** Whether this day is a Saturday or Sunday. */
  isWeekend: boolean
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

export interface WeekDay {
  /** The date of this weekday in the current visible week. */
  value: DateValue
  /** Localized short label, e.g. "Mon". */
  short: string
  /** Localized long label, e.g. "Monday". */
  long: string
  /** Localized narrow label, e.g. "M". */
  narrow: string
}

export interface VisibleRangeText {
  start: string
  end: string
  /** Single localized string suitable for a header title, e.g. "Apr 13 – 19, 2026". */
  formatted: string
}

export interface HourEntry {
  /** Hour value, 0–24. */
  value: number
  /** Localized label, e.g. "09:00" / "9 AM" depending on locale. */
  label: string
  /** 0..1 vertical position within the visible grid. */
  percent: number
  /** Ready-to-spread style with `top` already computed. */
  style: { top: string }
}

export interface HourRange {
  /** Inclusive start hour (0–24). */
  start: number
  /** Exclusive end hour (0–24). */
  end: number
  /**
   * Hours from start..end inclusive, each with its localized label and grid
   * position pre-computed. Replaces manual `(h - start) / (end - start)` math.
   */
  hours: HourEntry[]
}

export interface EventStyle {
  position: "absolute"
  top: string
  height: string
  insetInlineStart: string
  insetInlineEnd: string
  /** `--event-color` is always present so consumers can reference it in CSS. */
  "--event-color"?: string | undefined
  [key: string]: string | undefined
}

export interface SchedulerApi<T extends PropTypes = PropTypes, E = Record<string, unknown>> {
  /** Current view. */
  view: ViewType
  /** Focused date (drives which range is visible). */
  date: DateValue
  /** Locale/timezone-aware "today" date — useful for highlighting current day. */
  today: DateValue
  /** Raw start/end of the currently visible range. */
  visibleRange: { start: DateValue; end: DateValue }
  /** Localized text for the visible range — prefer this over formatting by hand. */
  visibleRangeText: VisibleRangeText
  /** Enumerated dates from visibleRange.start to visibleRange.end, inclusive. */
  visibleDays: DateValue[]
  /** Day-of-week labels ordered by weekStartDay/locale. */
  weekDays: WeekDay[]
  /** Hour range shown in day/week time grids (honors dayStartHour/dayEndHour). */
  hourRange: HourRange
  /** Writing direction. */
  dir: "ltr" | "rtl"
  /** All events (recurring instances expanded against the visible range). */
  events: SchedulerEvent<E>[]
  isDragging: boolean
  isSlotSelecting: boolean
  isResizing: boolean
  /** Live preview of the event being dragged — null when not dragging. */
  dragPreview: { eventId: string; start: DateValue | null; end: DateValue | null } | null
  /** Where the active drag/resize started — use to render a "was here" ghost outline. */
  dragOrigin: { eventId: string; start: DateValue; end: DateValue } | null

  setView: (view: ViewType) => void
  setDate: (date: DateValue) => void
  goToToday: () => void
  goToNext: () => void
  goToPrev: () => void

  getEventState: (id: string) => EventStateDetail
  /** Numeric position within a day column — use for custom layouts. */
  getEventPosition: (event: SchedulerEvent<E>) => EventPosition
  /** Ready-to-spread CSS with logical props (RTL-safe) — use for default time-grid rendering. */
  getEventStyle: (event: SchedulerEvent<E>) => EventStyle
  /**
   * Returns the drag ghost for a day column (the floating preview at the
   * predicted drop position), or null when nothing should render there.
   * Spread `style` onto your ghost element; `event` is the source event so you
   * can pull its title/color.
   */
  getDragGhost: (params: { date: DateValue }) => { style: EventStyle; event: SchedulerEvent<E> } | null
  /**
   * Returns the origin outline for a day column (the "was here" marker at the
   * gesture's starting bounds), or null when nothing should render there.
   */
  getDragOrigin: (params: { date: DateValue }) => { style: EventStyle; event: SchedulerEvent<E> } | null
  /** 0..1 fraction of the visible day range corresponding to the given date's time-of-day. */
  getTimePercent: (date: DateValue) => number
  /** Localized full month name for the given date, e.g. "April". */
  getMonthName: (date: DateValue) => string
  /** Twelve localized month names in order. */
  monthNames: string[]
  /**
   * Weeks × days covering the month that contains `date`, padded to full weeks.
   * Use for month grids and mini-month cells.
   */
  getMonthGrid: (date?: DateValue) => MonthGridDay[][]
  /** O(1) event lookup by id (reads from the current events list). */
  getEventById: (id: string) => SchedulerEvent<E> | undefined
  getEventsForDay: (date: DateValue) => SchedulerEvent<E>[]
  getEventsForSlot: (start: DateValue, end: DateValue) => SchedulerEvent<E>[]
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
  getEventProps: (props: EventProps<E>) => T["element"]
  getEventResizeHandleProps: (props: EventResizeHandleProps<E>) => T["element"]
  getCurrentTimeIndicatorProps: () => T["element"]
  getMoreEventsProps: (props: MoreEventsProps) => T["button"]
}
