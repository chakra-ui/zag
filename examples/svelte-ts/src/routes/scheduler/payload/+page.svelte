<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/scheduler.css"

  interface MeetingPayload {
    attendees: string[]
    location: string
    meetingUrl?: string
  }

  type Event = scheduler.SchedulerEvent<MeetingPayload>

  const TODAY = schedulerAnchor

  const INITIAL: Event[] = [
    {
      id: "1",
      title: "Team standup",
      start: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 0 }),
      end: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 30 }),
      color: "#3b82f6",
      payload: { attendees: ["Ada", "Ben", "Cai"], location: "Zoom", meetingUrl: "https://zoom.us/j/123" },
    },
    {
      id: "2",
      title: "Design review",
      start: TODAY.set({ hour: 10, minute: 0 }),
      end: TODAY.set({ hour: 11, minute: 30 }),
      color: "#10b981",
      payload: { attendees: ["Dee", "Eli"], location: "Studio B" },
    },
    {
      id: "3",
      title: "Client sync",
      start: TODAY.add({ days: 2 }).set({ hour: 14, minute: 0 }),
      end: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
      color: "#f59e0b",
      payload: {
        attendees: ["Finn", "Gwen", "Hana"],
        location: "Google Meet",
        meetingUrl: "https://meet.google.com/xyz",
      },
    },
  ]

  const controls = useControls(schedulerControls)
  let events = $state.raw<Event[]>(INITIAL)
  let selectedId = $state<string | null>(null)

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props<MeetingPayload>>({ id })
  const service = useMachine(
    scheduler.machine as scheduler.Machine<MeetingPayload>,
    (): scheduler.Props<MeetingPayload> => ({
      ...controlProps(),
      defaultDate: schedulerAnchor,
      events,
      onEventDrop: (d) => {
        events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
      },
      onEventResize: (d) => {
        events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
      },
      onEventClick: (d) => {
        selectedId = d.event.id
      },
    }),
  )

  const api = $derived(scheduler.connect(service, normalizeProps))
  const selected = $derived(selectedId ? (api.getEventById(selectedId) ?? null) : null)
</script>

<main class="scheduler scheduler-with-aside">
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
                    {#if event.payload}
                      <div class="scheduler-event-meta">
                        {event.payload.attendees.length} · {event.payload.location}
                      </div>
                    {/if}
                    <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                      <div class="scheduler-resize-grip"></div>
                    </div>
                  </div>
                {/each}
                <div {...api.getDragOriginProps({ date })}></div>
                <div {...api.getDragPreviewProps({ date })}>
                  <div class="scheduler-event-title">{api.dragState?.event.title}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <aside class="scheduler-event-panel">
    {#if selected && selected.payload}
      <div class="scheduler-event-panel-title">{selected.title}</div>
      <div class="scheduler-event-panel-time">{api.formatTimeRange(selected.start, selected.end)}</div>
      <div class="scheduler-event-panel-section">
        <div class="scheduler-event-panel-section-label">Attendees</div>
        <div>{selected.payload.attendees.join(", ")}</div>
      </div>
      <div class="scheduler-event-panel-row">
        <span class="scheduler-event-panel-row-label">Location: </span>
        {selected.payload.location}
      </div>
      {#if selected.payload.meetingUrl}
        <a href={selected.payload.meetingUrl} target="_blank" rel="noreferrer" class="scheduler-event-panel-link">
          Join meeting →
        </a>
      {/if}
    {:else}
      <div class="scheduler-event-panel-empty">Click an event to see its typed payload.</div>
    {/if}
  </aside>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
