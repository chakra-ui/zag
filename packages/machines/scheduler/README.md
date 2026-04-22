# @zag-js/scheduler

Framework-agnostic scheduler machine for building calendar and time-grid UIs. It emits headless render data (positions, visible ranges, prop-getters, drag state) so you own every piece of markup and every pixel of style.

## Install

```bash
pnpm add @zag-js/scheduler @zag-js/react
# or
npm install @zag-js/scheduler @zag-js/react
# or
yarn add @zag-js/scheduler @zag-js/react
```

Adapters also exist for `@zag-js/solid`, `@zag-js/vue`, `@zag-js/svelte`, and `@zag-js/preact`.

## Quick start

```tsx
import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Design review",
    start: TODAY.set({ hour: 10, minute: 0 }),
    end: TODAY.set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
]

export function Calendar() {
  const [events, setEvents] = useState(INITIAL)
  const service = useMachine(scheduler.machine, {
    id: useId(),
    events,
    onEventDrop: (d) => setEvents(d.apply),
    onEventResize: (d) => setEvents(d.apply),
  })
  const api = scheduler.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getHeaderProps()}>
        <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
        <button {...api.getTodayTriggerProps()}>Today</button>
        <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
        <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
      </div>
      <div {...api.getGridProps()}>
        <div {...api.getTimeGutterProps()}>
          {api.hourRange.hours.map((h) => (
            <div key={h.value} style={h.style}>{h.label}</div>
          ))}
        </div>
        {api.visibleDays.map((d) => (
          <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
            {api.getEventsForDay(d).map((event) => (
              <div key={event.id} {...api.getEventProps({ event })}>
                {event.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Event model

```ts
interface SchedulerEvent<T = Record<string, unknown>> {
  id: string
  title: string
  start: DateValue
  end: DateValue
  allDay?: boolean
  color?: string
  recurrence?: { rrule: string; exdate?: DateValue[] }
  disabled?: boolean
  payload?: T
}
```

| Field | Notes |
| --- | --- |
| `id` | Stable unique key. Powers O(1) lookups and drag tracking. |
| `title` | Display label. The machine doesn't format or truncate it. |
| `start` / `end` | `DateValue` from `@internationalized/date` (CalendarDate or CalendarDateTime). |
| `allDay` | When true, `getEventStyle` is skipped — render in your own all-day row. |
| `color` | Surfaced as `--event-color` on event style so CSS can pick it up. |
| `recurrence` | An RRULE string (and optional exdates). Only read if you pass `expandRecurrence`. |
| `disabled` | Blocks drag and resize for that event. |
| `payload` | Arbitrary typed metadata. |

The `payload` slot is typed via the generic parameter:

```ts
type Meeting = SchedulerEvent<{ attendees: string[]; meetingUrl: string }>

const m: Meeting = {
  id: "1",
  title: "Design review",
  start, end,
  payload: { attendees: ["ada", "grace"], meetingUrl: "https://meet…" },
}
```

## Views

Pass via `view` / `defaultView`. The machine computes `api.visibleRange` per view.

| View | `visibleRange` covers |
| --- | --- |
| `day` | The single focused day. |
| `week` | 7 days, ordered by `weekStartDay` / locale. |
| `month` | Full month, padded to complete weeks (use `api.getMonthGrid`). |
| `year` | 12 months — iterate `api.monthNames` and render `api.getMonthGrid(date)` per month. |
| `agenda` | A rolling window from the focused date forward; render as a flat list. |

## API surface

### Data

| Name | Type | Description |
| --- | --- | --- |
| `view` | `ViewType` | Current view. |
| `date` | `DateValue` | Focused date. |
| `today` | `DateValue` | Locale/timezone-aware today. |
| `visibleRange` | `{ start; end }` | Raw bounds of the currently visible range. |
| `visibleRangeText` | `VisibleRangeText` | Pre-localized start / end / formatted title. |
| `visibleDays` | `DateValue[]` | Inclusive enumeration of `visibleRange`. |
| `weekDays` | `WeekDay[]` | 7 localized weekday headers, ordered by `weekStartDay`. |
| `hourRange` | `HourRange` | `start`, `end`, and `hours[]` with pre-computed labels + `style.top`. |
| `dir` | `"ltr" \| "rtl"` | Resolved writing direction. |
| `prevTriggerIcon` | `string` | Direction-aware previous arrow glyph. |
| `nextTriggerIcon` | `string` | Direction-aware next arrow glyph. |
| `events` | `SchedulerEvent<E>[]` | Flat list with recurring events expanded. |
| `dragPreview` | `{ eventId; start; end } \| null` | Live drag/resize bounds. |
| `dragOrigin` | `{ eventId; start; end } \| null` | Snapshot of where the gesture started. |
| `isDragging` | `boolean` | Machine is in `event-dragging`. |
| `isSlotSelecting` | `boolean` | Machine is in `slot-selecting`. |
| `isResizing` | `boolean` | Machine is in `event-resizing`. |
| `monthNames` | `string[]` | Twelve localized month names. |

### Lookups

| Name | Description |
| --- | --- |
| `getEventById(id)` | O(1) lookup against the expanded events list. |
| `getEventsForDay(date)` | O(1) bucket lookup for a day (multi-day events appear in each bucket). |
| `getEventsForSlot(start, end)` | Events intersecting a slot; scans only the start-day bucket. |
| `hasConflict(event)` | Whether the event overlaps another timed event. O(1), precomputed. |
| `getEventState(id)` | `{ dragging, resizing, focused, selected, conflict }`. |

### Layout

| Name | Description |
| --- | --- |
| `getEventPosition(event)` | Numeric `EventPosition` — `top`, `height`, `left`, `width`, `column`, `totalColumns`, each 0..1. |
| `getEventStyle(event)` | Ready-to-spread CSS with logical insets and `--event-color`. |
| `getTimePercent(date)` | 0..1 vertical position of a given time within the day grid. |
| `getMonthGrid(date?)` | `MonthGridDay[][]` — weeks × days, padded to full weeks. |
| `getMonthName(date)` | Localized full month name. |

### Drag overlays

| Name | Description |
| --- | --- |
| `getDragGhost({ date })` | `{ style, event }` for the floating preview on this day, or `null`. |
| `getDragOrigin({ date })` | `{ style, event }` for the "was here" outline on this day, or `null`. |

### Navigation

| Name | Description |
| --- | --- |
| `setView(view)` | Switch view (`day`/`week`/`month`/`year`/`agenda`). |
| `setDate(date)` | Focus a specific date. |
| `goToToday()` | Jump to today in the active timezone. |
| `goToNext()` | Advance by one view unit. |
| `goToPrev()` | Go back by one view unit. |

### Prop-getters

```
getRootProps                  getHeaderProps                getHeaderTitleProps
getPrevTriggerProps           getNextTriggerProps           getTodayTriggerProps
getViewSelectProps            getViewItemProps({ view })    getGridProps
getAllDayRowProps             getTimeSlotProps(slot)        getTimeGutterProps
getDayColumnProps({ date })   getDayCellProps({ date })     getEventProps({ event })
getEventResizeHandleProps({ event, edge })                  getCurrentTimeIndicatorProps
getMoreEventsProps({ date, count })
```

## Callbacks

```ts
useMachine(scheduler.machine, {
  events,
  onSlotClick: (d) => openCreate({ start: d.start, end: d.end }),
  onSlotSelect: (d) => openCreate({ start: d.start, end: d.end }),
  onEventClick: (d) => select(d.event),
  onEventDrop: (d) => setEvents(d.apply),
  onEventResize: (d) => setEvents(d.apply),
  onDateChange: (d) => setDate(d.date),
  onViewChange: (d) => setView(d.view),
})
```

| Callback | Fires when |
| --- | --- |
| `onSlotClick` | Pointer-down and up on the same slot (no drag). Use to open a "new event" popover. |
| `onSlotSelect` | Slot drag — `start`/`end` are always normalized (start ≤ end). |
| `onEventClick` | Event is clicked or activated by Enter/Space. |
| `onEventDrop` | After a drag that changed bounds. Includes `index` and `apply`. |
| `onEventResize` | After a resize that changed bounds. Includes `edge`, `index`, `apply`. |
| `onDateChange` | Focused date changed (nav buttons or `setDate`). |
| `onViewChange` | Active view changed. |

`EventDropDetails.apply` and `EventResizeDetails.apply` return a new events array with just this event's bounds updated:

```ts
onEventDrop: (d) => setEvents(d.apply),
// equivalent to:
onEventDrop: (d) =>
  setEvents((events) => events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
```

## Recurring events

The machine does not bundle an RRULE engine. You supply `expandRecurrence`, which is called for each event that carries a `recurrence` field and returns concrete instances for the visible range. Use `rrule.js`, `rrule-alt`, or your own implementation.

```ts
import { RRule } from "rrule"
import { CalendarDateTime } from "@internationalized/date"

const expandRecurrence: scheduler.RecurrenceExpander = (event, range) => {
  const rule = RRule.fromString(event.recurrence!.rrule)
  const durationMs =
    new Date(event.end.toString()).getTime() - new Date(event.start.toString()).getTime()
  return rule
    .between(new Date(range.start.toString()), new Date(range.end.toString()), true)
    .map((date, i) => {
      const endDate = new Date(date.getTime() + durationMs)
      const toCDT = (d: Date) =>
        new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes())
      return { ...event, id: `${event.id}:${i}`, start: toCDT(date), end: toCDT(endDate) }
    })
}

useMachine(scheduler.machine, {
  events,
  expandRecurrence,
  maxRecurrenceInstances: 500, // safety cap on total expanded events, default 2000
})
```

## Styling

The machine does not ship CSS. `getRootProps` sets three layout-critical custom properties on the root element:

| Variable | Value |
| --- | --- |
| `--scheduler-visible-days` | Number of columns in the current view. |
| `--scheduler-day-count` | Alias of the above. |
| `--scheduler-hour-count` | `dayEndHour - dayStartHour`. |

Consumer-overridable variables (not set by the machine):

| Variable | Purpose |
| --- | --- |
| `--scheduler-time-gutter-width` | Left time column width. |
| `--scheduler-hour-height` | Per-hour row height. |
| `--scheduler-grid-height` | Total grid height; defaults to `hours × hour-height`. |
| `--scheduler-event-inset` | Inline padding between ghost/origin overlays and the day column. |

`getEventStyle` returns logical properties (`insetInlineStart` / `insetInlineEnd`), so event layout mirrors correctly in RTL without extra work. Event color is exposed as `--event-color` inside the style so your CSS can reference `color-mix(in srgb, var(--event-color) 15%, white)` or similar.

## RTL

```tsx
useMachine(scheduler.machine, { dir: "rtl", events })
```

- `api.prevTriggerIcon` / `api.nextTriggerIcon` flip automatically.
- All emitted styles use logical properties — no separate RTL stylesheet needed.
- `api.dir` is exposed so you can mirror custom decorations.

## Performance notes

- `getEventById`, `getEventsForDay`, and `hasConflict` are O(1) — the connect layer prebuilds a Map by id, a Map of events bucketed by day key, and a sweep-line conflict set before returning.
- Event layout runs once as a single O(N log N) sweep (`computeEventLayout`), replacing a prior O(N²) per-event resolver.
- The `examples/next-ts/pages/scheduler/stress.tsx` example renders 1000–5000 events at steady 60fps with drag and resize enabled.

## Controlled vs uncontrolled

`view` and `date` are independently controllable. Pass `defaultView` / `defaultDate` for uncontrolled mode, or the `view` / `date` pair plus `onViewChange` / `onDateChange` for controlled mode.

```tsx
// Uncontrolled — the machine owns both
useMachine(scheduler.machine, { defaultView: "week", events })

// Controlled
const [view, setView] = useState<scheduler.ViewType>("week")
const [date, setDate] = useState<DateValue>(scheduler.getToday())
useMachine(scheduler.machine, {
  view,
  date,
  events,
  onViewChange: (d) => setView(d.view),
  onDateChange: (d) => setDate(d.date),
})
```

If `defaultDate` is omitted the machine defaults to today in `timeZone` (or the local timezone).
