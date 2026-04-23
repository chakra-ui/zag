# @zag-js/scheduler

Framework-agnostic headless scheduler machine for building calendar / time-grid UIs. Emits render data (visible days, hours, positions, formatted labels, drag overlays); you own markup and styles.

- Day / week / month / year / agenda views
- Drag to move, resize from the bottom edge
- Click vs double-click disambiguation (select highlight vs create trigger)
- Native recurring events — no user-supplied RRULE expander needed for basic rules
- Conflict detection, keyboard navigation (`T` today, `D/W/M/Y` switch views, `Escape` cancel)
- First-class RTL via logical CSS properties and direction-aware arrows
- Locale-aware formatting via `Intl.DateTimeFormat`
- O(N log N) layout + O(1) per-day / conflict lookups — tested to 5000 events

## Install

```sh
pnpm add @zag-js/scheduler @zag-js/react @internationalized/date
```

Any `@zag-js/{react, solid, svelte, vue, preact}` works as the framework adapter.

## Quick start

```tsx
import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.set({ hour: 9, minute: 0 }),
    end: TODAY.set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
]

export function Calendar() {
  const [events, setEvents] = useState(INITIAL)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    events,
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getHeaderProps()}>
        <button {...api.getPrevTriggerProps()}><ChevronLeft /></button>
        <button {...api.getTodayTriggerProps()}>Today</button>
        <button {...api.getNextTriggerProps()}><ChevronRight /></button>
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
interface SchedulerEvent<T = any> {
  id: string
  title: string
  start: DateValue     // from @internationalized/date
  end: DateValue
  allDay?: boolean
  color?: string       // surfaces as --event-color CSS var
  disabled?: boolean
  recurrence?: RecurrenceRule | { rrule: string; exdate?: DateValue[] }
  payload?: T          // your own metadata; flows through every callback detail
}
```

Typed payload:

```tsx
interface MeetingPayload { attendees: string[]; location: string }
type Event = scheduler.SchedulerEvent<MeetingPayload>

const service = useMachine(scheduler.machine as scheduler.Machine<MeetingPayload>, {
  events,
  onEventClick: (d) => console.log(d.event.payload.attendees),
})
```

One cast at the machine boundary — `connect`'s return infers the payload type.

## Views

| view | visible range |
|---|---|
| `day` | focused date |
| `week` | start-of-week to end-of-week, honoring `startOfWeek` / locale |
| `month` | full weeks enclosing the focused month |
| `year` | January to December of focused year |
| `agenda` | 30-day rolling window from focused date |

Navigation: `setView`, `setDate`, `goToPrev`, `goToNext`, `goToToday`.

## Props

| name | type | default | description |
|---|---|---|---|
| `events` | `SchedulerEvent<T>[]` | `[]` | event list |
| `view` / `defaultView` | `ViewType` | `"week"` | controlled / uncontrolled view |
| `date` / `defaultDate` | `DateValue` | today | controlled / uncontrolled focused date |
| `slotInterval` | `15 \| 30 \| 60` | `30` | snap granularity for drag / resize |
| `dayStartHour` | `number` | `0` | first hour shown in day/week grid |
| `dayEndHour` | `number` | `24` | last hour shown |
| `workWeekDays` | `number[]` | `[1,2,3,4,5]` | `0`=Sun…`6`=Sat |
| `workWeekOnly` | `boolean` | `false` | in week view, filter `visibleDays` to `workWeekDays` |
| `startOfWeek` | `0–6` | locale default | override first day of week |
| `locale` | BCP 47 string | `"en-US"` | drives formatters + start-of-week |
| `timeZone` | IANA string | local | drives `today` + all formatters |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | writing direction; flips arrows + logical props |
| `showCurrentTime` | `boolean` | `true` | red line in day/week views |
| `showWeekNumbers` | `boolean` | `false` | |
| `translations` | `SchedulerTranslations` | | override `prevTriggerLabel`, `nextTriggerLabel`, `todayTriggerLabel`, `viewLabels` |
| `canDragEvent` | `(e) => boolean` | `() => true` | gate drag per event |
| `canResizeEvent` | `(e) => boolean` | `() => true` | gate resize per event |
| `disabled` | `boolean` | `false` | disable all interaction |
| `expandRecurrence` | `RecurrenceExpander<T>` | | user RRULE expander (only called for `{ rrule }` recurrences) |
| `maxRecurrenceInstances` | `number` | `2000` | cap on expanded events |

### Callbacks

| callback | fires when |
|---|---|
| `onSlotClick(d)` | empty slot clicked without drag — `d = { start, end }` (end = start + slotInterval) |
| `onSlotDoubleClick(d)` | empty slot double-clicked — the conventional "create event" trigger |
| `onSlotRangeSelect(d)` | drag-selection across multiple slots — `d = { start, end }` spans the drag |
| `onEventClick(d)` | `d.event` |
| `onEventDrop(d)` | `d = { event, newStart, newEnd }` |
| `onEventResize(d)` | `d = { event, newStart, newEnd, edge }` |
| `onViewChange(d)` | `d = { view }` |
| `onDateChange(d)` | `d = { date }` |

## api surface

### Data

| | |
|---|---|
| `view` | current view |
| `date` | focused date |
| `today` | locale / timezone-aware today |
| `visibleRange` | `{ start, end }` |
| `visibleRangeText` | `{ start, end, formatted }` localized |
| `visibleDays` | `DateValue[]` — honors `workWeekOnly` |
| `visibleEvents` | events filtered to `visibleRange` |
| `agendaGroups` | `[{ date, events }]` grouped by day |
| `weekDays` | 7 localized day labels `{ value, short, long, narrow }` |
| `hourRange.hours` | `[{ value, label, percent, style }]` |
| `events` | all events (recurring expanded, capped by `maxRecurrenceInstances`) |
| `monthNames` / `getMonthName(d)` | localized month names |
| `dir` | `"ltr" \| "rtl"` |
| `dragPreview` | live drag bounds: `{ eventId, start, end }` or null |
| `dragOrigin` | where the drag started: `{ eventId, start, end }` or null |
| `selectedSlot` | last-clicked slot: `{ start, end }` or null |
| `isDragging` / `isResizing` / `isSlotSelecting` | |

### Lookups (O(1))

| | |
|---|---|
| `getEventById(id)` | `SchedulerEvent \| undefined` |
| `getEventsForDay(date)` | multi-day events appear in every day they touch |
| `getEventsForSlot(start, end)` | |
| `hasConflict(event)` | pre-computed sweep |
| `getEventState(id)` | `{ dragging, resizing, focused, selected, conflict }` |

### Layout / positioning

| | |
|---|---|
| `getEventPosition(event)` | `{ top, height, left, width, column, totalColumns }` — 0–1 fractions |
| `getTimePercent(date)` | 0–1 within `dayStartHour..dayEndHour` |
| `getMonthGrid(date?)` | weeks × `MonthGridDay[]` — `{ date, inMonth, isToday, isWeekend }` |

### Drag / selection overlays

Each returns `{ props, event?, start?, end? }` or `null`. Spread `props` onto your element — the machine emits positioning + `data-scheduler-*` attrs.

| | renders when |
|---|---|
| `getDragGhost({ date })` | active drag; ghost follows the pointer |
| `getDragOrigin({ date })` | active drag / resize; "was here" outline |
| `getSelectedSlot({ date })` | slot was clicked once |

### Navigation / mutation

| | |
|---|---|
| `setView(v)` / `setDate(d)` | |
| `goToToday()` / `goToNext()` / `goToPrev()` | |
| `clearSelectedSlot()` | dismiss the highlight (e.g. on dialog close) |

### Formatters

All locale + timezone aware.

| | |
|---|---|
| `formatTime(date)` | `"09:30"` / `"9:30 AM"` per locale |
| `formatTimeRange(start, end)` | `"09:30 – 11:00"` |
| `formatLongDate(date)` | `"Friday, April 24"` |
| `formatDuration(start, end)` | `"1h 30m"` / `"45m"` |

### Prop-getters

`getRootProps`, `getHeaderProps`, `getHeaderTitleProps`, `getPrevTriggerProps`, `getNextTriggerProps`, `getTodayTriggerProps`, `getViewSelectProps`, `getViewItemProps({ view })`, `getGridProps`, `getAllDayRowProps`, `getTimeSlotProps({ start, end })`, `getTimeGutterProps`, `getDayColumnProps({ date })`, `getDayCellProps({ date, referenceDate? })`, `getEventProps({ event })`, `getEventResizeHandleProps({ event, edge })`, `getCurrentTimeIndicatorProps`, `getMoreEventsProps({ date, count })`.

### Static utilities

```ts
scheduler.getToday(timeZone?)           // CalendarDateTime at midnight
scheduler.getDurationMinutes(start, end)
```

## Recurring events

Native expansion for common rules — no user code needed:

```ts
{
  id: "standup",
  title: "Daily standup",
  start: today.set({ hour: 9 }),
  end: today.set({ hour: 9, minute: 30 }),
  recurrence: { freq: "daily", until: endOfMonth },   // or weekly / monthly / yearly
}
{
  recurrence: { freq: "weekly", interval: 2, count: 12 },  // biweekly × 12
}
{
  recurrence: { freq: "monthly", exdate: [holidayDate] },
}
```

For complex rules (BYDAY, BYMONTHDAY, …) supply your own expander:

```tsx
useMachine(scheduler.machine, {
  events,
  expandRecurrence: (event, range) => {
    // your rrule.js / rrule-alt call here
    // only invoked when event.recurrence has { rrule: string }
  },
})
```

## Styling

The machine ships headless — it emits `data-scheduler-*` attrs on every anatomy part and these CSS variables on the root element:

| var | meaning | default |
|---|---|---|
| `--scheduler-visible-days` | column count | — |
| `--scheduler-day-count` | alias | — |
| `--scheduler-hour-count` | `dayEndHour - dayStartHour` | — |
| `--scheduler-time-gutter-width` | left gutter width | `60px` |
| `--scheduler-hour-height` | per-hour row height | `56px` |
| `--scheduler-grid-height` | `hours × hour-height` | computed |
| `--scheduler-event-inset` | ghost / origin inline padding | `2px` |

Target parts via attribute selectors: `[data-scheduler-root]`, `[data-scheduler-event]`, `[data-scheduler-drag-ghost]`, etc. `getEventProps` uses logical properties (`inset-inline-start/end`) so RTL works without a separate stylesheet.

## RTL

Pass `dir="rtl"` on props. Flip your own arrow glyphs by reading `api.dir`. Every built-in style uses logical CSS properties (`border-inline-start`, `margin-inline-start`, `inset-inline-start/end`) — nothing to swap per locale. Latin content (hour labels, range titles) uses `unicode-bidi: plaintext` so numbers stay LTR inside an RTL grid.

## Performance

- `computeEventLayout` runs once per render (O(N log N) sweep-line + interval-graph coloring) — `getEventPosition` is a `Map.get` afterward.
- `getEventsForDay`, `getEventsForSlot`, `getEventById`, `hasConflict` are O(1) via pre-built Maps and Sets.
- Pointer-move dispatches are RAF-coalesced — at most one per frame on 120/240Hz pointers.
- Auto-scroll during drag kicks in when the pointer nears the scroll container edge.

The stress example (`examples/next-ts/pages/scheduler/stress.tsx`) generates 100–5000 events via a seeded PRNG and stays drag-interactive at 5000.

## Controlled vs uncontrolled

```tsx
// uncontrolled
useMachine(scheduler.machine, { defaultView: "week", defaultDate: today })

// controlled
const [view, setView] = useState<ViewType>("week")
useMachine(scheduler.machine, { view, onViewChange: (d) => setView(d.view) })
```

Same pattern for `date` / `defaultDate`.

## Composition

Scheduler composes with other zag machines — see `examples/next-ts/pages/scheduler/`:

- `click-to-create.tsx` — `@zag-js/dialog` for the create flow
- `event-details.tsx` — `@zag-js/popover` for event details, anchored via `positioning.getAnchorRect`
- `with-date-picker.tsx` — `@zag-js/date-picker` for navigation

## Anatomy

Parts emitted by `parts.*.attrs(scope.id)`:

`root`, `header`, `headerTitle`, `prevTrigger`, `nextTrigger`, `todayTrigger`, `viewSelect`, `grid`, `allDayRow`, `timeSlot`, `timeGutter`, `dayColumn`, `dayCell`, `event`, `eventResizeHandle`, `currentTimeIndicator`, `moreEvents`, `dragGhost`, `dragOrigin`, `slotHighlight`, `hourLabel`, `hourLine`, `agendaGroup`, `agendaGroupTitle`.
