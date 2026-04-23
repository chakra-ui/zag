<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
  import * as datePicker from "@zag-js/date-picker"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()
  const toCalDate = (d: DateValue) => new CalendarDate(d.year, d.month, d.day)
  const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

  let date = $state<DateValue>(TODAY)
  let events = $state<scheduler.SchedulerEvent[]>([
    {
      id: "1",
      title: "Team standup",
      start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
      end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Design review",
      start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
      end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
      color: "#10b981",
    },
    {
      id: "3",
      title: "Lunch",
      start: TODAY.set({ hour: 12, minute: 0 }),
      end: TODAY.set({ hour: 13, minute: 0 }),
      color: "#f59e0b",
    },
  ])

  const controls = useControls(schedulerControls)
  const id = $props.id()

  const dpService = useMachine(datePicker.machine, {
    id: `dp-${id}`,
    inline: true,
    selectionMode: "single",
    get value() {
      return [toCalDate(date)]
    },
    get focusedValue() {
      return toCalDate(date)
    },
    onValueChange: (d) => {
      if (d.value[0]) date = toCalDateTime(d.value[0])
    },
    onFocusChange: (d) => {
      if (d.focusedValue) date = toCalDateTime(d.focusedValue)
    },
  })
  const dp = $derived(datePicker.connect(dpService, normalizeProps))

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      view: "week",
      get date() {
        return date
      },
      get events() {
        return events
      },
      onDateChange: (d) => (date = d.date),
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
    }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler" style="align-self:stretch;width:100%">
  <div style="display:grid;grid-template-columns:340px minmax(0, 1fr);gap:16px;align-items:start;width:100%">
    <div class="date-picker" style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#fff;font-size:13px">
      <div {...dp.getRootProps()}>
        <div {...dp.getContentProps()}>
          <div
            {...dp.getViewControlProps({ view: "day" })}
            style="display:flex;gap:6px;margin-bottom:10px;align-items:center"
          >
            <button {...dp.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...dp.getViewTriggerProps()} style="flex:1;font-weight:600">{dp.visibleRangeText.start}</button>
            <button {...dp.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
          </div>
          <table
            {...dp.getTableProps({ view: "day" })}
            style="width:100%;border-collapse:collapse;table-layout:fixed"
          >
            <thead {...dp.getTableHeaderProps({ view: "day" })}>
              <tr {...dp.getTableRowProps({ view: "day" })}>
                {#each dp.weekDays as d, i (i)}
                  <th scope="col" aria-label={d.long} style="font-size:11px;color:#9ca3af;font-weight:500;padding:4px">
                    {d.narrow}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody {...dp.getTableBodyProps({ view: "day" })}>
              {#each dp.weeks as week, i (i)}
                <tr {...dp.getTableRowProps({ view: "day" })}>
                  {#each week as value, j (j)}
                    <td {...dp.getDayTableCellProps({ value })} style="padding:1px;text-align:center">
                      <div {...dp.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div {...api.getRootProps()}>
      <div {...api.getHeaderProps()}>
        <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
        <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
        <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
        <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div class="scheduler-col-headers">
          <div class="scheduler-header-cell scheduler-gutter-header"></div>
          {#each api.visibleDays as d, i (d.toString())}
            <div class="scheduler-header-cell">
              <span class="scheduler-header-day-label">{api.weekDays[i % 7].short}</span>
              <span class="scheduler-header-day-num">{d.day}</span>
            </div>
          {/each}
        </div>

        <div class="scheduler-time-grid-scroll">
          <div {...api.getGridProps()} class="scheduler-time-grid">
            <div {...api.getTimeGutterProps()}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-label" style={h.style}>{h.label}</div>
              {/each}
            </div>
            {#each api.visibleDays as d (d.toString())}
              <div {...api.getDayColumnProps({ date: d })}>
                {#each api.hourRange.hours as h (h.value)}
                  <div class="scheduler-hour-line" style={h.style}></div>
                {/each}
                {#each api.getEventsForDay(d) as event (event.id)}
                  <div
                    {...api.getEventProps({ event })}
                    style="--event-color: {event.color}; {Object.entries(api.getEventStyle(event))
                      .map(([k, v]) => `${k}:${v}`)
                      .join(';')}"
                  >
                    <div class="scheduler-event-title">{event.title}</div>
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
                      <div class="scheduler-resize-grip"></div>
                    </div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
