import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { DateValue } from "@internationalized/date"

/* -----------------------------------------------------------------------------
 * Event data model
 * -----------------------------------------------------------------------------*/

export type SchedulerPayload = Record<string, any>

/**
 * Recurrence rule for an event. The `rrule` field follows RFC5545.
 *
 * Simple rules (`FREQ` + `INTERVAL` + `COUNT`/`UNTIL`) are expanded natively
 * by the machine. Rules using `BYDAY`, `BYMONTHDAY`, `BYSETPOS`, etc. require
 * the consumer to supply an `expandRecurrence` prop backed by a full RRULE
 * library (e.g. `rrule.js`).
 */
export interface Recurrence {
  /**
   * RFC5545 RRULE string, e.g. `"FREQ=WEEKLY;BYDAY=MO,WE;COUNT=16"`.
   */
  rrule: string
  /**
   * Dates to skip (excluded occurrences).
   */
  exdate?: DateValue[] | undefined
  /**
   * Explicit series start. Defaults to the event's `start`.
   */
  dtstart?: DateValue | undefined
}

export interface SchedulerEvent<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * Unique id.
   */
  id: string
  /**
   * Display title.
   */
  title: string
  /**
   * Start date/time.
   */
  start: DateValue
  /**
   * End date/time.
   */
  end: DateValue
  /**
   * Render as an all-day event.
   */
  allDay?: boolean | undefined
  /**
   * Surfaces as the `--event-color` CSS var.
   */
  color?: string | undefined
  /**
   * Recurrence rule (RFC5545 RRULE string + exclusions).
   */
  recurrence?: Recurrence | undefined
  /**
   * When true, the event cannot be clicked, dragged, or resized.
   */
  disabled?: boolean | undefined
  /**
   * Arbitrary typed metadata — flows through every callback detail.
   */
  payload?: T | undefined
}

/**
 * Expands a recurring event into concrete instances within a date range.
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

export interface SlotSelectDetails {
  /**
   * Start of the selected slot range.
   */
  start: DateValue
  /**
   * End of the selected slot range. For `action: "click"`, equals
   * `start + slotInterval` (timed cells) or `start + 1 day` (all-day / month).
   * For `action: "drag"`, the dragged bounds.
   */
  end: DateValue
  /**
   * Whether the selection originated in an all-day context (month cell or the
   * all-day row).
   */
  allDay: boolean
  /**
   * Which gesture produced the selection — lets consumers branch UX
   * (e.g. drag opens a popover, double-click opens a full dialog).
   */
  action: "click" | "drag"
}

export interface SlotDoubleClickDetails {
  start: DateValue
  end: DateValue
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

export interface DragState<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * Which gesture is in progress.
   */
  kind: "drag" | "resize"
  /**
   * The event being dragged or resized.
   */
  event: SchedulerEvent<T>
  /**
   * Current pointer-predicted start of the event (snapped to `slotInterval`).
   */
  start: DateValue
  /**
   * Current pointer-predicted end of the event.
   */
  end: DateValue
  /**
   * The event's start/end at the moment the gesture began — restore target
   * for escape-to-cancel, and anchor for the "origin" outline overlay.
   */
  origin: { start: DateValue; end: DateValue }
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
   * Fires when a user selects an empty slot — either by single click or by
   * drag-release. Discriminate via `details.action`. Use to open a quick-create
   * popover anchored to `selectedSlot`.
   */
  onSlotSelect?: ((details: SlotSelectDetails) => void) | undefined
  /**
   * Fires on double-click of an empty slot — the conventional "create event"
   * fast-path that bypasses slot selection (selectedSlot is not set).
   */
  onSlotDoubleClick?: ((details: SlotDoubleClickDetails) => void) | undefined
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
  | "timeZone"
  | "dir"
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
  formatters: {
    weekDayShort: Intl.DateTimeFormat
    weekDayLong: Intl.DateTimeFormat
    weekDayNarrow: Intl.DateTimeFormat
    time: Intl.DateTimeFormat
    range: Intl.DateTimeFormat
    longDate: Intl.DateTimeFormat
    month: Intl.DateTimeFormat
  }
  hourRange: HourRange
  isInteractive: boolean
}>

export interface SchedulerSchema<T extends SchedulerPayload = SchedulerPayload> {
  state: "idle" | "slot-selecting" | "event-dragging" | "event-resizing"
  props: RequiredBy<SchedulerProps<T>, PropsWithDefault>
  context: SchedulerContext
  refs: {
    dragOrigin: { x: number; y: number } | null
    dragStartSnapshot: { start: DateValue; end: DateValue } | null
    slotAnchor: DateValue | null
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
  /**
   * The date of the day cell.
   */
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

export interface EventProps<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * The event to render.
   */
  event: SchedulerEvent<T>
  /**
   * Rendering context for the event.
   * - `"grid"` (default): time-grid view — emits `position: absolute` and
   *   percentage-based `top`/`height`/`inset-inline` so the event tile positions
   *   itself within its day column.
   * - `"list"`: agenda / month-chip / other stacked layouts — emits no
   *   positioning so the element flows naturally as a list item. Use when the
   *   surrounding container handles layout (flex column, grid cell, etc).
   *
   * Ignored when `event.allDay` is true; all-day events always return minimal
   * style regardless of layout.
   */
  layout?: "grid" | "list"
}

export interface EventResizeHandleProps<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * The event to resize.
   */
  event: SchedulerEvent<T>
  /**
   * The edge of the event to resize.
   */
  edge: "start" | "end"
}

export interface MoreEventsProps {
  /**
   * The date of the day cell.
   */
  date: DateValue
  /**
   * The number of events to show.
   */
  count: number
}

export interface ViewItemProps {
  /**
   * The view type to render.
   */
  view: ViewType
}

export interface HourEntryProps {
  /**
   * A single hour entry from `api.hourRange.hours`.
   */
  hour: HourEntry
}

export interface AgendaGroupProps {
  /**
   * The date of the agenda group.
   */
  date: DateValue
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
  /**
   * Start date of the visible range.
   */
  start: string
  /**
   * End date of the visible range.
   */
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

export interface SchedulerApi<T extends PropTypes = PropTypes, P extends SchedulerPayload = SchedulerPayload> {
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
   * Locale/timezone-aware weekday label for a specific date.
   * @default "short"
   */
  formatWeekDay: (date: DateValue, style?: "short" | "long" | "narrow") => string
  /**
   * Day-of-week labels ordered by startOfWeek/locale.
   */
  weekDays: WeekDay[]
  /**
   * Hour range shown in day/week time grids (honors dayStartHour/dayEndHour).
   */
  hourRange: HourRange
  /**
   * All events (recurring instances expanded against the visible range).
   */
  events: SchedulerEvent<P>[]
  /**
   * Events whose range overlaps `visibleRange` — the set you actually render.
   */
  visibleEvents: SchedulerEvent<P>[]
  /**
   * Visible events grouped by day and sorted by start. Lazy — computed only
   * when called. Use for agenda / list layouts.
   */
  getAgendaGroups: () => { date: DateValue; events: SchedulerEvent<P>[] }[]
  /**
   * Whether the user is currently dragging an event.
   */
  isDragging: boolean
  /**
   * Whether the user is currently selecting a slot.
   */
  isSelectingSlot: boolean
  /**
   * Whether the user is currently resizing an event.
   */
  isResizing: boolean
  /**
   * State of the active drag or resize — null when idle. `start`/`end` track the
   * current pointer-predicted position; `origin` is where the gesture began.
   */
  dragState: DragState<P> | null
  /**
   * Slot the user selected (clicked or drag-selected). Clears on escape or new click.
   */
  selectedSlot: { start: DateValue; end: DateValue } | null
  /**
   * Set the current view.
   */
  setView: (view: ViewType) => void
  /**
   * Set the current date.
   */
  setDate: (date: DateValue) => void
  /**
   * Go to today.
   */
  goToToday: () => void
  /**
   * Go to next.
   */
  goToNext: () => void
  /**
   * Go to previous.
   */
  goToPrev: () => void
  /**
   * Dismiss the selected slot highlight (e.g. when a create dialog closes).
   */
  clearSelectedSlot: () => void
  /**
   * Get the state of the event.
   */
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
  getEventPosition: (event: SchedulerEvent<P>) => EventPosition
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
  getMonthGrid: (date?: DateValue) => DateValue[][]
  /**
   * O(1) event lookup by id (reads from the current events list).
   */
  getEventById: (id: string) => SchedulerEvent<P> | undefined
  /**
   * Get events for a given day.
   */
  getEventsForDay: (date: DateValue) => SchedulerEvent<P>[]
  /**
   * Get events for a given slot.
   */
  getEventsForSlot: (start: DateValue, end: DateValue) => SchedulerEvent<P>[]
  /**
   * Whether the event has a conflict.
   */
  hasConflict: (event: SchedulerEvent<P>) => boolean
  /**
   * The DOM element rendered by `getEventProps` for the given event id.
   * Useful for anchoring a popover/menu to a specific event from outside
   * React render cycles. Returns `null` if not yet mounted.
   */
  getEventEl: (id: string) => HTMLElement | null
  /**
   * The DOM element rendered by `getSelectedSlotProps` for the active
   * `selectedSlot` day. Useful for anchoring a popover to the selection
   * (e.g. click-to-create). Returns `null` when nothing is selected.
   */
  getSelectedSlotEl: () => HTMLElement | null

  getRootProps: () => T["element"]
  getHeaderProps: () => T["element"]
  getHeaderTitleProps: () => T["element"]
  getPrevTriggerProps: () => T["button"]
  getNextTriggerProps: () => T["button"]
  getTodayTriggerProps: () => T["button"]
  getViewSelectProps: () => T["element"]
  getViewItemProps: (props: ViewItemProps) => T["button"]
  getColumnHeadersProps: () => T["element"]
  getColumnHeaderProps: (props: DayColumnProps) => T["element"]
  getGridProps: () => T["element"]
  getAllDayRowProps: () => T["element"]
  getAllDayLabelProps: () => T["element"]
  getTimeSlotProps: (props: TimeSlotProps) => T["element"]
  getTimeGutterProps: () => T["element"]
  getHourLabelProps: (props: HourEntryProps) => T["element"]
  getHourLineProps: (props: HourEntryProps) => T["element"]
  getDayColumnProps: (props: DayColumnProps) => T["element"]
  getDayCellProps: (props: DayCellProps) => T["element"]
  getEventProps: (props: EventProps<P>) => T["element"]
  getEventResizeHandleProps: (props: EventResizeHandleProps<P>) => T["element"]
  getCurrentTimeIndicatorProps: (props: DayColumnProps) => T["element"]
  getMoreEventsProps: (props: MoreEventsProps) => T["button"]
  getDragPreviewProps: (props: DayColumnProps) => T["element"]
  getDragOriginProps: (props: DayColumnProps) => T["element"]
  getSelectedSlotProps: (props: DayColumnProps) => T["element"]
  getAgendaGroupProps: (props: AgendaGroupProps) => T["element"]
  getAgendaGroupTitleProps: (props: AgendaGroupProps) => T["element"]
}
