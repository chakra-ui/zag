<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as popover from "@zag-js/popover"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  interface MeetingPayload {
    attendees: string[]
    location: string
    meetingUrl?: string
  }
  type Event = scheduler.SchedulerEvent<MeetingPayload>

  const TODAY = scheduler.getToday()
  let events = $state<Event[]>([
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
  ])
  let selectedId = $state<string | null>(null)
  let anchorEl: HTMLElement | null = null

  const controls = useControls(schedulerControls)
  const id = $props.id()

  const schedulerService = useMachine(
    scheduler.machine as scheduler.Machine<MeetingPayload>,
    controls.mergeProps<scheduler.Props<MeetingPayload>>({
      id,
      get events() {
        return events
      },
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
      onEventClick: (d) => {
        const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
        anchorEl = el
        selectedId = d.event.id
        popoverApi.setOpen(true)
        popoverApi.reposition()
      },
    }),
  )
  const api = $derived(scheduler.connect(schedulerService, normalizeProps))

  const popoverService = useMachine(popover.machine, {
    id: `pop-${id}`,
    positioning: {
      placement: "right",
      gutter: 8,
      getAnchorRect: () => {
        if (!anchorEl) return null
        const r = anchorEl.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height }
      },
    },
    onOpenChange: (details) => {
      if (!details.open) selectedId = null
    },
  })
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  const selected = $derived<Event | null>(
    selectedId ? ((api.getEventById(selectedId) as Event | undefined) ?? null) : null,
  )
</script>

<main class="scheduler">
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
            {@const origin = api.getDragOrigin({ date: d })}
            {@const ghost = api.getDragGhost({ date: d })}
            <div {...api.getDayColumnProps({ date: d })}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-line" style={h.style}></div>
              {/each}
              {#each api.getEventsForDay(d) as event (event.id)}
                <div {...api.getEventProps({ event })}>
                  <div class="scheduler-event-title">{event.title}</div>
                  {#if event.payload}
                    <div class="scheduler-event-meta">
                      {event.payload.attendees.length} · {event.payload.location}
                    </div>
                  {/if}
                  <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
                    <div class="scheduler-resize-grip"></div>
                  </div>
                </div>
              {/each}
              {#if origin}<div {...origin.props}></div>{/if}
              {#if ghost}
                <div {...ghost.props}>
                  <div class="scheduler-event-title">{ghost.event.title}</div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div use:portal {...popoverApi.getPositionerProps()}>
    <div {...popoverApi.getContentProps()} class="scheduler-event-popover">
      {#if selected && selected.payload}
        <div class="scheduler-event-popover-body" style="--event-color: {selected.color}">
          <div class="scheduler-event-popover-row">
            <span aria-hidden class="scheduler-event-popover-dot"></span>
            <strong class="scheduler-event-popover-title">{selected.title}</strong>
          </div>
          <div class="scheduler-event-popover-time">
            {api.formatTimeRange(selected.start, selected.end)} · {api.formatDuration(selected.start, selected.end)}
          </div>
          <div class="scheduler-event-popover-meta">
            <div>
              <span class="scheduler-event-popover-label">Attendees</span>
              <div>{selected.payload.attendees.join(", ")}</div>
            </div>
            <div>
              <span class="scheduler-event-popover-label">Location</span>
              <div>{selected.payload.location}</div>
            </div>
            {#if selected.payload.meetingUrl}
              <a
                href={selected.payload.meetingUrl}
                target="_blank"
                rel="noreferrer"
                class="scheduler-event-popover-link"
              >
                Join meeting →
              </a>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={schedulerService} />
</Toolbar>
