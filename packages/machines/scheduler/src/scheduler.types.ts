import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { DateValue } from "@internationalized/date"

/* -----------------------------------------------------------------------------
 * Event data model
 * -----------------------------------------------------------------------------*/

/**
 * Base type for event payloads. Defaults to `any` so the generic-threading
 * pattern `scheduler.machine as scheduler.Machine<MyPayload>` works without
 * coercing through `unknown`. Matches the `CollectionItem = any` convention
 * used by select / combobox / listbox / gridlist / tree-view.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchedulerPayload = any

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly"

/**
 * Structured recurrence the machine can expand natively — no user code needed.
 * For rules beyond freq + interval + count/until + exdate, use the `rrule`
 * variant and supply an `expandRecurrence` prop.
 */
export interface RecurrenceRule {
  /**
   * Repeat frequency.
   */
  freq: RecurrenceFrequency
  /**
   * Repeat every N units of `freq`.
   * @default 1
   */
  interval?: number | undefined
  /**
   * Stop after this many instances (inclusive of the original).
   */
  count?: number | undefined
  /**
   * Last date (inclusive) at which instances may occur.
   */
  until?: DateValue | undefined
  /**
   * Dates to skip.
   */
  exdate?: DateValue[] | undefined
}

/**
 * Legacy rrule-string form — user supplies their own RRULE library via `expandRecurrence`.
 */
export interface RRuleRecurrence {
  /**
   * The rrule string. For example, "RRULE:FREQ=DAILY;INTERVAL=1".
   */
  rrule: string
  /**
   * Dates to skip.
   */
  exdate?: DateValue[] | undefined
}

export interface SchedulerEvent<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * The event id.
   */
  id: string
  /**
   * The event title.
   */
  title: string
  /**
   * The event start date.
   */
  start: DateValue
  /**
   * The event end date.
   */
  end: DateValue
  /**
   * Whether the event is all-day.
   */
  allDay?: boolean | undefined
  /**
   * The event color.
   */
  color?: string | undefined
  /**
   * The event recurrence.
   */
  recurrence?: RecurrenceRule | RRuleRecurrence | undefined
  /**
   * Whether the event is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Arbitrary typed metadata attached to the event (attendees, location, links…).
   */
  payload?: T | undefined
}

/**
 * Expands a recurring event into concrete instances within a date range.
 * Consumers provide their preferred RRULE library (rrule.js, rrule-alt, etc.).
 */
export type RecurrenceExpander<T extends SchedulerPayload = SchedulerPayload> = (
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

export interface SlotRangeSelectDetails {
  start: DateValue
  end: DateValue
}

export interface SlotClickDetails {
  /**
   * The single slot that was clicked (no drag).
   */
  start: DateValue
  /**
   * End of the clicked slot — `start + slotInterval` for time-grid clicks,
   * `start + 1 day` for day-cell / all-day-cell clicks.
   */
  end: DateValue
  /**
   * Whether the click originated in an all-day context (month cell or the
   * all-day row). Lets consumers branch create-flow semantics on day vs time.
   */
  allDay: boolean
}

export interface EventClickDetails<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
}

export interface EventDropDetails<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
  newStart: DateValue
  newEnd: DateValue
}

export interface EventResizeDetails<T extends SchedulerPayload = SchedulerPayload> {
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

export interface SchedulerProps<T extends SchedulerPayload = SchedulerPayload>
  extends CommonProperties, DirectionProperty {
  /**
   * Element IDs for the scheduler.
   */
  ids?: ElementIds | undefined
  /**
   * Current view mode
   */
  view?: ViewType | undefined
  /**
   * Initial view mode when uncontrolled
   */
  defaultView?: ViewType | undefined
  /**
   * Fires when the view mode changes.
   */
  onViewChange?: ((details: ViewChangeDetails) => void) | undefined
  /**
   * Current focused date
   */
  date?: DateValue | undefined
  /**
   * Initial focused date when uncontrolled
   */
  defaultDate?: DateValue | undefined
  /**
   * Fires when the focused date changes.
   */
  onDateChange?: ((details: DateChangeDetails) => void) | undefined
  /**
   * Flat list of events (expand recurring events before passing)
   */
  events?: SchedulerEvent<T>[] | undefined
  /**
   * Minutes per time slot — 15, 30, or 60.
   * @default 30
   */
  slotInterval?: 15 | 30 | 60 | undefined
  /**
   * First hour shown in day/week time grid.
   * @default 0
   */
  dayStartHour?: number | undefined
  /**
   * Last hour shown in day/week time grid.
   * @default 24
   */
  dayEndHour?: number | undefined
  /**
   * Days of week to show in work-week mode, 0=Sun…6=Sat.
   * @default [1,2,3,4,5]
   */
  workWeekDays?: number[] | undefined
  /**
   * When true, `api.visibleDays` in week view is filtered down to `workWeekDays`.
   * @default false
   */
  workWeekOnly?: boolean | undefined
  /**
   * Fires when the user drag-selects a slot range. `start`/`end` span the
   * dragged bounds — differs from `onSlotClick` (single slot, end = start +
   * slotInterval) and `onSlotDoubleClick` (create-intent on a single slot).
   */
  onSlotRangeSelect?: ((details: SlotRangeSelectDetails) => void) | undefined
  /**
   * Fires when an empty slot is clicked once — use to highlight/select the slot.
   */
  onSlotClick?: ((details: SlotClickDetails) => void) | undefined
  /**
   * Fires on double-click of an empty slot — the conventional "create event" trigger.
   */
  onSlotDoubleClick?: ((details: SlotClickDetails) => void) | undefined
  /**
   * Fires when an event is clicked.
   */
  onEventClick?: ((details: EventClickDetails<T>) => void) | undefined
  /**
   * Fires when an event is dropped.
   */
  onEventDrop?: ((details: EventDropDetails<T>) => void) | undefined
  /**
   * Fires when an event is resized.
   */
  onEventResize?: ((details: EventResizeDetails<T>) => void) | undefined
  /**
   * Return false to prevent dragging an event. Gates entry to event-dragging state.
   */
  canDragEvent?: ((event: SchedulerEvent<T>) => boolean) | undefined
  /**
   * Return false to prevent resizing an event. Gates entry to event-resizing state.
   */
  canResizeEvent?: ((event: SchedulerEvent<T>) => boolean) | undefined
  /**
   * BCP 47 locale used for week-start day and date formatting.
   * @default "en-US"
   */
  locale?: string | undefined
  /**
   * IANA timezone string. Defaults to local timezone.
   */
  timeZone?: string | undefined
  /**
   * Override the first day of the week (0=Sun…6=Sat). Falls back to locale default.
   */
  startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
  /**
   * Show week numbers in week view.
   * @default false
   */
  showWeekNumbers?: boolean | undefined
  /**
   * Show a line at the current time in day/week views.
   * @default true
   */
  showCurrentTime?: boolean | undefined
  /**
   * Upper bound on expanded recurring instances per visible range.
   * @default 2000
   */
  maxRecurrenceInstances?: number | undefined
  /**
   * Called on each recurring event to expand instances within the visible range.
   */
  expandRecurrence?: RecurrenceExpander<T> | undefined
  /**
   * Translations for the scheduler.
   */
  translations?: SchedulerTranslations | undefined
  /**
   * Disable all interaction.
   * @default false
   */
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

export interface SchedulerSchema<T extends SchedulerPayload = SchedulerPayload> {
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

export type SchedulerService<T extends SchedulerPayload = SchedulerPayload> = Service<SchedulerSchema<T>>
export type SchedulerMachine<T extends SchedulerPayload = SchedulerPayload> = Machine<SchedulerSchema<T>>

/* -----------------------------------------------------------------------------
 * Connect API types
 * -----------------------------------------------------------------------------*/

export interface EventPosition {
  /**
   * 0–1 fraction of the day column. Multiply by 100 for %, or by container height for px.
   */
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

export interface DayColumnState {
  /**
   * Whether this day is today (locale/timezone aware).
   */
  isToday: boolean
  /**
   * Whether this day is a Saturday or Sunday.
   */
  isWeekend: boolean
  /**
   * Whether a live drag is currently hovering this column.
   */
  isDropTarget: boolean
  /**
   * Whether the drag preview (floating ghost) renders in this column.
   */
  isDragPreviewDay: boolean
  /**
   * Whether the drag/resize gesture started in this column — i.e. the origin
   * outline renders here.
   */
  isDragOriginDay: boolean
  /**
   * Whether the selected slot highlight renders in this column.
   */
  isSelectedSlotDay: boolean
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
  /**
   * Marks the cell as part of the all-day row. Emits `data-all-day="true"`,
   * skips the "outside the reference month" check, and routes clicks with
   * `allDay: true` on the callback detail.
   * @default false
   */
  allDay?: boolean
}

/**
 * A single day in a month-grid rendering. Produced by `api.getMonthGrid`.
 * Data attributes are already surfaced via `getDayCellProps` — this shape is
 * for when consumers need the booleans directly (e.g. to render a dot for
 * events, or a custom className).
 */
export interface MonthGridDay {
  date: DateValue
  /**
   * Whether this day falls inside the reference month (false = leading/trailing filler).
   */
  inMonth: boolean
  /**
   * Whether this day is today (locale/timezone aware).
   */
  isToday: boolean
  /**
   * Whether this day is a Saturday or Sunday.
   */
  isWeekend: boolean
}

export interface EventProps<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
}

export interface EventResizeHandleProps<T extends SchedulerPayload = SchedulerPayload> {
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
  /**
   * The date of this weekday in the current visible week.
   */
  value: DateValue
  /**
   * Localized short label, e.g. "Mon".
   */
  short: string
  /**
   * Localized long label, e.g. "Monday".
   */
  long: string
  /**
   * Localized narrow label, e.g. "M".
   */
  narrow: string
}

export interface VisibleRangeText {
  start: string
  end: string
  /**
   * Single localized string suitable for a header title, e.g. "Apr 13 – 19, 2026".
   */
  formatted: string
}

export interface HourEntry {
  /**
   * Hour value, 0–24.
   */
  value: number
  /**
   * Localized label, e.g. "09:00" / "9 AM" depending on locale.
   */
  label: string
  /**
   * 0..1 vertical position within the visible grid.
   */
  percent: number
  /**
   * Ready-to-spread style with `top` already computed.
   */
  style: { top: string }
}

export interface HourRange {
  /**
   * Inclusive start hour (0–24).
   */
  start: number
  /**
   * Exclusive end hour (0–24).
   */
  end: number
  /**
   * Hours from start..end inclusive, each with its localized label and grid
   * position pre-computed. Replaces manual `(h - start) / (end - start)` math.
   */
  hours: HourEntry[]
}

export interface SchedulerApi<T extends PropTypes = PropTypes, E extends SchedulerPayload = SchedulerPayload> {
  /**
   * Current view.
   */
  view: ViewType
  /**
   * Focused date (drives which range is visible).
   */
  date: DateValue
  /**
   * Locale/timezone-aware "today" date — useful for highlighting current day.
   */
  today: DateValue
  /**
   * Raw start/end of the currently visible range.
   */
  visibleRange: { start: DateValue; end: DateValue }
  /**
   * Localized text for the visible range — prefer this over formatting by hand.
   */
  visibleRangeText: VisibleRangeText
  /**
   * Enumerated dates from visibleRange.start to visibleRange.end, inclusive.
   * When `workWeekOnly` is true and `view === "week"`, this is filtered down
   * to `workWeekDays`.
   */
  visibleDays: DateValue[]
  /**
   * Locale/timezone-aware hour+minute label, e.g. "09:30" / "9:30 AM".
   */
  formatTime: (date: DateValue) => string
  /**
   * Locale/timezone-aware time range, e.g. "09:30 – 11:00".
   */
  formatTimeRange: (start: DateValue, end: DateValue) => string
  /**
   * Locale/timezone-aware long date, e.g. "Friday, April 24".
   */
  formatLongDate: (date: DateValue) => string
  /**
   * Human-friendly duration between two dates, e.g. "1h 30m" / "45m".
   */
  formatDuration: (start: DateValue, end: DateValue) => string
  /**
   * Day-of-week labels ordered by startOfWeek/locale.
   */
  weekDays: WeekDay[]
  /**
   * Hour range shown in day/week time grids (honors dayStartHour/dayEndHour).
   */
  hourRange: HourRange
  /**
   * Writing direction.
   */
  dir: "ltr" | "rtl"
  /**
   * All events (recurring instances expanded against the visible range).
   */
  events: SchedulerEvent<E>[]
  /**
   * Events whose range overlaps `visibleRange` — the set you actually render.
   */
  visibleEvents: SchedulerEvent<E>[]
  /**
   * Visible events grouped by day and sorted by start. Use for agenda / list layouts.
   */
  agendaGroups: { date: DateValue; events: SchedulerEvent<E>[] }[]
  isDragging: boolean
  isSlotSelecting: boolean
  isResizing: boolean
  /**
   * State of the active drag or resize — null when idle. `start`/`end` track the
   * current pointer-predicted position; `origin` is where the gesture began.
   */
  dragState: {
    kind: "drag" | "resize"
    event: SchedulerEvent<E>
    start: DateValue
    end: DateValue
    origin: { start: DateValue; end: DateValue }
  } | null
  /**
   * Slot the user selected (clicked or drag-selected). Clears on escape or new click.
   */
  selectedSlot: { start: DateValue; end: DateValue } | null

  setView: (view: ViewType) => void
  setDate: (date: DateValue) => void
  goToToday: () => void
  goToNext: () => void
  goToPrev: () => void
  /**
   * Dismiss the selected slot highlight (e.g. when a create dialog closes).
   */
  clearSelectedSlot: () => void

  getEventState: (id: string) => EventStateDetail
  /**
   * Day-level flags for the given column — use to conditionally render custom
   * UI (drop-target hint, day-specific styling) without reconstructing the
   * comparisons from `dragState` / `selectedSlot`.
   */
  getDayColumnState: (props: DayColumnProps) => DayColumnState
  /**
   * Numeric position within a day column — use for custom layouts.
   */
  getEventPosition: (event: SchedulerEvent<E>) => EventPosition
  /**
   * 0..1 fraction of the visible day range corresponding to the given date's time-of-day.
   */
  getTimePercent: (date: DateValue) => number
  /**
   * Localized full month name for the given date, e.g. "April".
   */
  getMonthName: (date: DateValue) => string
  /**
   * Twelve localized month names in order.
   */
  monthNames: string[]
  /**
   * Weeks × days covering the month that contains `date`, padded to full weeks.
   * Use for month grids and mini-month cells.
   */
  getMonthGrid: (date?: DateValue) => MonthGridDay[][]
  /**
   * O(1) event lookup by id (reads from the current events list).
   */
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
  getCurrentTimeIndicatorProps: (props: DayColumnProps) => T["element"]
  getMoreEventsProps: (props: MoreEventsProps) => T["button"]
  /**
   * Drag preview overlay for a day column — floating box at the predicted drop
   * position. Always returns spreadable props; hidden when no drag is active or
   * the drag isn't in this column.
   */
  getDragPreviewProps: (props: DayColumnProps) => T["element"]
  /**
   * Drag origin outline for a day column — "was here" marker at the gesture's
   * starting bounds. Always returns spreadable props; hidden when no drag is
   * active or the drag didn't start in this column.
   */
  getDragOriginProps: (props: DayColumnProps) => T["element"]
  /**
   * Selected-slot highlight for a day column. Always returns spreadable props;
   * hidden when no slot is selected or the slot isn't in this column.
   */
  getSelectedSlotProps: (props: DayColumnProps) => T["element"]
}
