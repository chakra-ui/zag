import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"
import type { CalendarDateTime } from "@internationalized/date"

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
  exdate?: CalendarDateTime[] | undefined
  /**
   * Explicit series start. Defaults to the event's `start`.
   */
  dtstart?: CalendarDateTime | undefined
}

export interface SchedulerResource<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * Unique id. Events point at this through `resourceId`.
   */
  id: string
  /**
   * Display title, rendered in the column header.
   */
  title: string
  /**
   * Surfaces as the `--resource-color` CSS var on the column and its events.
   */
  color?: string | undefined
  /**
   * When true, the column rejects drops and its events cannot be dragged or resized.
   */
  disabled?: boolean | undefined
  /**
   * Arbitrary typed metadata - flows through every callback detail.
   */
  payload?: T | undefined
}

/**
 * A rendered column. `resource` is set only when grouping by resource.
 */
export interface SchedulerColumn<T extends SchedulerPayload = SchedulerPayload> {
  date: CalendarDateTime
  resource?: SchedulerResource<T> | undefined
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
  start: CalendarDateTime
  /**
   * End date/time.
   */
  end: CalendarDateTime
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
   * Id of the resource this event belongs to. Ignored unless `groupBy` is `"resource"`.
   */
  resourceId?: string | undefined
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
  range: { start: CalendarDateTime; end: CalendarDateTime },
) => SchedulerEvent<T>[]

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type ViewType = "day" | "week" | "month" | "year" | "agenda" | "timeline"

export type GroupBy = "date" | "resource"

/** One bucket along the timeline's horizontal axis. */
export interface TimelineSlot {
  start: CalendarDateTime
  end: CalendarDateTime
  label: string
  /** Fraction of the visible range where this slot starts, 0-1. */
  offset: number
  /** Fraction of the visible range this slot spans, 0-1. */
  size: number
}

/** One all-day event laid out as a single bar across the visible days. */
export interface AllDaySegment<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
  /** Zero-based index of the first visible day the bar covers. */
  column: number
  /** How many visible days it spans. */
  span: number
  /** False when the event began before the range — that end is clipped, so it has no handle. */
  isStart: boolean
  /** False when it continues past the range. */
  isEnd: boolean
  /** True while this bar is the one being dragged or resized. */
  dragging: boolean
  /** Stacking row, so overlapping bars don't collide. */
  level: number
}

/** Rows and slots for the timeline view. */
export interface TimelineState<T extends SchedulerPayload = SchedulerPayload> {
  /** Lanes down the timeline — one per resource, or a single lane when there are none. */
  rows: TimelineRow<T>[]
  /** Buckets along the horizontal axis, one per visible day. */
  slots: TimelineSlot[]
}

/** One lane down the timeline. Backed by a resource, or a single unnamed lane. */
export interface TimelineRow<T extends SchedulerPayload = SchedulerPayload> {
  id: string
  title: string
  resource?: SchedulerResource<T> | undefined
}

export interface TimelineRowProps<T extends SchedulerPayload = SchedulerPayload> {
  row: TimelineRow<T>
}

export interface TimelineSlotProps {
  slot: TimelineSlot
}

export interface ViewChangeDetails {
  view: ViewType
}

export interface DateChangeDetails {
  date: CalendarDateTime
}

export interface EventReceiveDetails<T extends SchedulerPayload = SchedulerPayload> {
  /**
   * Slot the item was dropped on, snapped to `slotInterval`.
   */
  start: CalendarDateTime
  end: CalendarDateTime
  /**
   * The resource whose column received the drop, when grouping by resource.
   */
  resource?: SchedulerResource<T> | undefined
  /**
   * Whatever the drag carried. Read from `dataTransfer` using `dataTransferFormat`,
   * so the consumer decides the payload's shape.
   */
  data: string
}

export interface SlotSelectDetails {
  /**
   * Start of the selected slot range.
   */
  start: CalendarDateTime
  /**
   * End of the selected slot range. For `action: "click"`, equals
   * `start + slotInterval` (timed cells) or `start + 1 day` (all-day / month).
   * For `action: "drag"`, the dragged bounds.
   */
  end: CalendarDateTime
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
  /**
   * The resource whose column the gesture happened in. Set only when grouping
   * by resource.
   */
  resource?: SchedulerResource | undefined
}

export interface SlotDoubleClickDetails {
  start: CalendarDateTime
  end: CalendarDateTime
  allDay: boolean
  /**
   * The resource whose column the gesture happened in. Set only when grouping
   * by resource.
   */
  resource?: SchedulerResource | undefined
}

export interface DayActivateDetails {
  /**
   * The date that was activated (clicked, or Enter/Space while focused).
   */
  date: CalendarDateTime
}

export interface EventClickDetails<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
}

export interface EventDropDetails<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
  newStart: CalendarDateTime
  newEnd: CalendarDateTime
  /**
   * Which region received the drop. Compare with `event.allDay` to detect a conversion —
   * the machine reports it but never rewrites the event for you.
   */
  allDay: boolean
  /**
   * How far the event moved, split into whole days plus a time-of-day shift.
   * Apply it to other events to move a whole series.
   */
  delta: { days: number; minutes: number }
  /**
   * The resource the event was dropped on. Set only when grouping by resource, and
   * differs from `event.resourceId` when the event moved between columns.
   */
  resource?: SchedulerResource<T> | undefined
}

export interface EventResizeDetails<T extends SchedulerPayload = SchedulerPayload> {
  event: SchedulerEvent<T>
  newStart: CalendarDateTime
  newEnd: CalendarDateTime
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
  start: CalendarDateTime
  /**
   * Current pointer-predicted end of the event.
   */
  end: CalendarDateTime
  /**
   * The event's start/end at the moment the gesture began — restore target
   * for escape-to-cancel, and anchor for the "origin" outline overlay.
   */
  origin: { start: CalendarDateTime; end: CalendarDateTime }
  /**
   * Whether the gesture currently targets the all-day row. Overlays in the time
   * grid should hide when this is true.
   */
  allDay: boolean
}

/* -----------------------------------------------------------------------------
 * Props
 * -----------------------------------------------------------------------------*/

export interface SchedulerTranslations {
  prevTriggerLabel?: string | undefined
  nextTriggerLabel?: string | undefined
  todayTriggerLabel?: string | undefined
  viewSelectLabel?: string | undefined
  viewText?: Partial<Record<ViewType, string>> | undefined
}

export type ElementIds = Partial<{
  root: string
  grid: string
  gridRow: string
  columnHeaders: string
  allDayRow: string
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
  date?: CalendarDateTime | undefined
  /**
   * Initial focused date when uncontrolled
   */
  defaultDate?: CalendarDateTime | undefined
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
   * Resources (people, rooms, equipment) to schedule against. Each event points at one
   * through `resourceId`.
   */
  resources?: SchedulerResource<T>[] | undefined
  /**
   * What each column represents. `"resource"` splits every visible day into one column
   * per resource, and is ignored when `resources` is empty.
   * @default "date"
   */
  groupBy?: GroupBy | undefined
  /**
   * Fires when a user selects an empty slot — either by single click or by
   * drag-release. Discriminate via `details.action`. Use to open a quick-create
   * popover anchored to `selectedSlot`.
   */
  onSlotSelect?: ((details: SlotSelectDetails) => void) | undefined
  /**
   * Fires when an item dragged from outside the scheduler is dropped on a slot.
   * Without it the scheduler refuses external drops entirely.
   */
  onEventReceive?: ((details: EventReceiveDetails<T>) => void) | undefined
  /**
   * `dataTransfer` format read on an external drop.
   * @default "text/plain"
   */
  dataTransferFormat?: string | undefined
  /**
   * Fires on double-click of an empty slot — the conventional "create event"
   * fast-path that bypasses slot selection (selectedSlot is not set).
   */
  onSlotDoubleClick?: ((details: SlotDoubleClickDetails) => void) | undefined
  /**
   * Fires when a day cell is activated via click, Enter, or Space while focused.
   * Typically used in month or year views to navigate to that day's detail view
   * or open a quick-add dialog.
   */
  onDayActivate?: ((details: DayActivateDetails) => void) | undefined
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
   * Decides whether a drag or resize may commit at its current position. Called live
   * during the gesture, so the rejected position can be styled through `data-invalid`,
   * and again on release — a rejected release restores the event instead of moving it.
   *
   * Use for overlap rules, business hours, or per-resource constraints.
   */
  canDropEvent?: ((details: EventDropDetails<T>) => boolean) | undefined
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
  | "events"
  | "resources"
  | "groupBy"
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
  start: CalendarDateTime
  end: CalendarDateTime
  /** Whether the pointer is currently over the all-day row rather than the time grid. */
  allDay: boolean
  /** Whether `canDropEvent` rejects the current position. */
  invalid?: boolean | undefined
}

interface LiveSlot {
  start: CalendarDateTime
  end: CalendarDateTime
  resource?: SchedulerResource | undefined
}

interface SchedulerContext {
  view: ViewType
  date: CalendarDateTime
  focusedEventId: string | null
  focusedDate: CalendarDateTime | null
  selectedEventId: string | null
  selectedSlot: { start: CalendarDateTime; end: CalendarDateTime } | null
  liveDrag: LiveDrag | null
  liveSlot: LiveSlot | null
}

type Computed = Readonly<{
  visibleRange: { start: CalendarDateTime; end: CalendarDateTime }
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
  dayCellLabels: Map<string, string>
  isInteractive: boolean
}>

export interface SchedulerSchema<T extends SchedulerPayload = SchedulerPayload> {
  state: "idle" | "slot-selecting" | "event-dragging" | "event-resizing"
  props: SchedulerProps<T>
  defaultPropKey: PropsWithDefault
  context: SchedulerContext
  refs: {
    dragOrigin: { x: number; y: number } | null
    dragStartSnapshot: { start: CalendarDateTime; end: CalendarDateTime } | null
    slotAnchor: CalendarDateTime | null
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

export interface RootState {
  /**
   * The current view
   */
  view: ViewType
  /**
   * Whether the user is currently dragging an event
   */
  dragging: boolean
  /**
   * Whether the user is currently resizing an event
   */
  resizing: boolean
  /**
   * Whether the user is currently selecting a slot
   */
  selectingSlot: boolean
}

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
  /** `canDropEvent` rejects the position this event is currently being dragged to. */
  invalid: boolean
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
  start: CalendarDateTime
  end: CalendarDateTime
}

export interface DayColumnProps<T extends SchedulerPayload = SchedulerPayload> {
  date: CalendarDateTime
  /**
   * The resource this column represents. Required when grouping by resource so the
   * column can filter its events and report the drop target.
   */
  resource?: SchedulerResource<T> | undefined
}

export interface DayCellTriggerProps {
  /**
   * The date of the cell.
   */
  date: CalendarDateTime
  /**
   * Reference date for the containing month grid. When the cell's date falls
   * outside this month (leading/trailing filler), the trigger is marked as
   * not-in-month via `data-in-month="false"`. The machine uses this to route
   * keyboard focus to the in-month instance when the same date appears in
   * two adjacent mini-grids.
   */
  referenceDate?: CalendarDateTime
}

export interface MonthGridProps {
  /**
   * Reference date whose month the grid represents. The grid's aria-label is
   * derived from this (e.g. "January 2026").
   */
  date: CalendarDateTime
}

export interface WeekdayHeaderCellProps {
  /**
   * Weekday entry from `api.getWeekDays()`.
   */
  day: WeekDay
}

export interface DayCellProps {
  /**
   * The date of the day cell.
   */
  date: CalendarDateTime
  /**
   * Reference date for month-based layouts — used to decide whether the cell is
   * "outside" the current month (greys it out). Defaults to `api.date`.
   */
  referenceDate?: CalendarDateTime
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
   * - `"timeline"`: timeline view — time runs horizontally, so this emits
   *   percentage-based `inset-inline-start`/`width` across the visible range.
   *
   * - `"all-day"`: the all-day row — pass `segment` alongside it and the event places
   *   itself as one continuous bar across the days it covers.
   */
  layout?: "grid" | "list" | "timeline" | "all-day"
  /**
   * The bar to place, from `getAllDaySegments()`. Only read when `layout` is `"all-day"`.
   */
  segment?: AllDaySegment<T> | undefined
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
  date: CalendarDateTime
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
  date: CalendarDateTime
}

export interface WeekDay {
  /**
   * The date of this weekday in the current visible week.
   */
  value: CalendarDateTime
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
  date: CalendarDateTime
  /**
   * Locale/timezone-aware "today" date — useful for highlighting current day.
   */
  today: CalendarDateTime
  /**
   * Raw start/end of the currently visible range.
   */
  visibleRange: { start: CalendarDateTime; end: CalendarDateTime }
  /**
   * Localized text for the visible range — prefer this over formatting by hand.
   */
  visibleRangeText: VisibleRangeText
  /**
   * Enumerated dates from visibleRange.start to visibleRange.end, inclusive.
   * When `workWeekOnly` is true and `view === "week"`, this is filtered down
   * to `workWeekDays`.
   */
  visibleDays: CalendarDateTime[]
  /**
   * The columns to render — one per visible day, or one per day × resource when
   * grouping by resource.
   */
  columns: SchedulerColumn<P>[]
  /**
   * Rows and slots for the timeline view. Only computed when called.
   */
  getTimelineState: () => TimelineState<P>
  /**
   * All-day events as continuous bars across the visible days, one per event. While a gesture is
   * in flight the dragged bar reports its live position.
   */
  getAllDaySegments: () => AllDaySegment<P>[]
  /**
   * The resources passed in, or an empty array.
   */
  resources: SchedulerResource<P>[]
  /**
   * Locale/timezone-aware hour+minute label, e.g. "09:30" / "9:30 AM".
   */
  formatTime: (date: CalendarDateTime) => string
  /**
   * Locale/timezone-aware time range, e.g. "09:30 – 11:00".
   */
  formatTimeRange: (start: CalendarDateTime, end: CalendarDateTime) => string
  /**
   * Locale/timezone-aware long date, e.g. "Friday, April 24".
   */
  formatLongDate: (date: CalendarDateTime) => string
  /**
   * Human-friendly duration between two dates, e.g. "1h 30m" / "45m".
   */
  formatDuration: (start: CalendarDateTime, end: CalendarDateTime) => string
  /**
   * Locale/timezone-aware weekday label for a specific date.
   * @default "short"
   */
  formatWeekDay: (date: CalendarDateTime, style?: "short" | "long" | "narrow") => string
  /**
   * Day-of-week labels ordered by startOfWeek/locale.
   */
  getWeekDays: () => WeekDay[]
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
  getAgendaGroups: () => { date: CalendarDateTime; events: SchedulerEvent<P>[] }[]
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
  selectedSlot: { start: CalendarDateTime; end: CalendarDateTime } | null
  /**
   * Day cell that currently has keyboard focus in a month/year grid. Drives the
   * roving tabindex emitted by `getDayCellTriggerProps`. `null` when focus
   * hasn't entered the grid yet — the cell matching `api.date` receives
   * `tabIndex=0` in that case.
   */
  focusedDate: CalendarDateTime | null
  /**
   * Imperatively move keyboard focus to a specific date. Use this to jump
   * focus from outside the grid (e.g. a "Today" button).
   */
  setFocusedDate: (date: CalendarDateTime) => void
  /**
   * Clear keyboard focus. Typically called on grid blur or Escape.
   */
  clearFocusedDate: () => void
  /**
   * Set the current view.
   */
  setView: (view: ViewType) => void
  /**
   * Set the current date.
   */
  setDate: (date: CalendarDateTime) => void
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
  getTimePercent: (date: CalendarDateTime) => number
  /**
   * Localized full month name for the given date, e.g. "April".
   */
  getMonthName: (date: CalendarDateTime) => string
  /**
   * Display text for a view, e.g. "Week". Render it as the view item's children.
   */
  getViewText: (view: ViewType) => string
  /**
   * Twelve localized month names in order.
   */
  getMonthNames: () => string[]
  /**
   * Weeks × days covering the month that contains `date`, padded to full weeks.
   * Use for month grids and mini-month cells.
   */
  getMonthGrid: (date?: CalendarDateTime) => CalendarDateTime[][]
  /**
   * O(1) event lookup by id (reads from the current events list).
   */
  getEventById: (id: string) => SchedulerEvent<P> | undefined
  /**
   * Get events for a given day.
   */
  getEventsForDay: (date: CalendarDateTime) => SchedulerEvent<P>[]
  /**
   * Events for a column — scoped to its resource when grouping by resource.
   */
  getEventsForColumn: (column: SchedulerColumn<P>) => SchedulerEvent<P>[]
  /**
   * Events for a timeline lane — scoped to its resource when the lane has one.
   */
  getEventsForRow: (row: TimelineRow<P>) => SchedulerEvent<P>[]
  /**
   * Get events for a given slot.
   */
  getEventsForSlot: (start: CalendarDateTime, end: CalendarDateTime) => SchedulerEvent<P>[]
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

  /**
   * Returns the state of the root
   */
  getRootState: () => RootState
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
  getGridRowProps: () => T["element"]
  getTimelineProps: () => T["element"]
  getTimelineHeaderProps: () => T["element"]
  getTimelineSlotProps: (props: TimelineSlotProps) => T["element"]
  getTimelineRowProps: (props: TimelineRowProps<P>) => T["element"]
  getTimelineRowHeaderProps: (props: TimelineRowProps<P>) => T["element"]
  getTimelineTrackProps: (props: TimelineRowProps<P>) => T["element"]
  getAllDayRowProps: () => T["element"]
  getAllDayLabelProps: () => T["element"]
  getTimeSlotProps: (props: TimeSlotProps) => T["element"]
  getTimeGutterProps: () => T["element"]
  getHourLabelProps: (props: HourEntryProps) => T["element"]
  getHourLineProps: (props: HourEntryProps) => T["element"]
  getDayColumnProps: (props: DayColumnProps) => T["element"]
  getDayCellProps: (props: DayCellProps) => T["element"]
  getDayCellTriggerProps: (props: DayCellTriggerProps) => T["element"]
  getMonthGridProps: (props: MonthGridProps) => T["element"]
  getWeekRowProps: () => T["element"]
  getWeekdayHeaderRowProps: () => T["element"]
  getWeekdayHeaderCellProps: (props: WeekdayHeaderCellProps) => T["element"]
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
