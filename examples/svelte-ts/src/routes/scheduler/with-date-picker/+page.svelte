<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
  import * as datePicker from "@zag-js/date-picker"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"
  import "@styles/date-picker.css"

  const toCalDate = (d: CalendarDateTime) => new CalendarDate(d.year, d.month, d.day)
  const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

  const controls = useControls(schedulerControls)
  let date = $state.raw<CalendarDateTime>(schedulerAnchor)
  let events = $state.raw(schedulerEvents)

  const id = $props.id()
  const dpService = useMachine(datePicker.machine, () => ({
    id: `${id}-date-picker`,
    inline: true,
    selectionMode: "single" as const,
    value: [toCalDate(date)],
    focusedValue: toCalDate(date),
    onValueChange: (d: datePicker.ValueChangeDetails) => {
      if (d.value[0]) date = toCalDateTime(d.value[0])
    },
    onFocusChange: (d: datePicker.FocusChangeDetails) => {
      if (d.focusedValue) date = toCalDateTime(d.focusedValue)
    },
  }))

  const dp = $derived(datePicker.connect(dpService, normalizeProps))

  const controlProps = controls.mergeProps<scheduler.Props>({ id, view: "week" })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    date,
    defaultDate: schedulerAnchor,
    events,
    onDateChange: (d) => {
      date = d.date as CalendarDateTime
    },
    onEventDrop: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler" style="align-self: stretch; width: 100%">
  <div style="display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 16px; align-items: start; width: 100%">
    <div
      class="date-picker"
      style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; font-size: 13px"
    >
      <div {...dp.getRootProps()}>
        <div {...dp.getContentProps()}>
          <div
            {...mergeProps(dp.getViewControlProps({ view: "day" }), {
              style: { display: "flex", gap: "6px", marginBottom: "10px", alignItems: "center" },
            })}
          >
            <button {...dp.getPreviousTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <button {...mergeProps(dp.getViewTriggerProps(), { style: { flex: 1, fontWeight: 600 } })}>
              {dp.visibleRangeText.start}
            </button>
            <button {...dp.getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>
          <table
            {...mergeProps(dp.getTableProps({ view: "day" }), {
              style: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
            })}
          >
            <thead {...dp.getTableHeaderProps({ view: "day" })}>
              <tr {...dp.getTableRowProps({ view: "day" })}>
                {#each dp.weekDays as day}
                  <th
                    scope="col"
                    aria-label={day.long}
                    style="font-size: 11px; color: #9ca3af; font-weight: 500; padding: 4px"
                  >
                    {day.narrow}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody {...dp.getTableBodyProps({ view: "day" })}>
              {#each dp.weeks as week}
                <tr {...dp.getTableRowProps({ view: "day" })}>
                  {#each week as value}
                    <td
                      {...mergeProps(dp.getDayTableCellProps({ value }), {
                        style: { padding: "1px", textAlign: "center" },
                      })}
                    >
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
        <button {...api.getPreviousTriggerProps()}>
          <ChevronLeftIcon />
        </button>
        <button {...api.getTodayTriggerProps()}>Today</button>
        <button {...api.getNextTriggerProps()}>
          <ChevronRightIcon />
        </button>
        <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div {...api.getColumnHeadersProps()}>
          <div class="scheduler-gutter-header"></div>
          {#each api.visibleDays as date (date.toString())}
            <div {...api.getColumnHeaderProps({ date })}>
              <span class="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
              <span class="scheduler-header-day-num">{date.day}</span>
            </div>
          {/each}
        </div>

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="scheduler-time-grid-scroll" tabindex="0" role="group" aria-label="Time grid">
          <div {...api.getGridProps()}>
            <div {...api.getGridRowProps()}>
              <div {...api.getTimeGutterProps()}>
                {#each api.hourRange.hours as hour (hour.value)}
                  <div {...api.getHourLabelProps({ hour })}>
                    {hour.label}
                  </div>
                {/each}
              </div>
              {#each api.visibleDays as date (date.toString())}
                <div {...api.getDayColumnProps({ date })}>
                  {#each api.hourRange.hours as hour (hour.value)}
                    <div {...api.getHourLineProps({ hour })}></div>
                  {/each}
                  <div {...api.getCurrentTimeIndicatorProps({ date })}></div>
                  {#each api.getEventsForDay(date) as event (event.id)}
                    <div {...api.getEventProps({ event })}>
                      <div class="scheduler-event-title">{event.title}</div>
                      <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
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
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
