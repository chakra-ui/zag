<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as popover from "@zag-js/popover"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()
  let events = $state<scheduler.SchedulerEvent[]>([
    {
      id: "1",
      title: "Team standup",
      start: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 0 }),
      end: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 30 }),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Design review",
      start: TODAY.set({ hour: 10, minute: 0 }),
      end: TODAY.set({ hour: 11, minute: 30 }),
      color: "#10b981",
    },
    {
      id: "3",
      title: "Lunch",
      start: TODAY.add({ days: 2 }).set({ hour: 12, minute: 0 }),
      end: TODAY.add({ days: 2 }).set({ hour: 13, minute: 0 }),
      color: "#f59e0b",
    },
  ])
  let selectedId = $state<string | null>(null)
  let anchorEl: HTMLElement | null = null
  let editing = $state(false)
  let draftTitle = $state("")

  const controls = useControls(schedulerControls)
  const id = $props.id()

  const schedulerService = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
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
        editing = false
        draftTitle = d.event.title ?? ""
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
      if (!details.open) {
        selectedId = null
        editing = false
      }
    },
  })
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  const selectedEvent = $derived(selectedId ? (api.getEventById(selectedId) ?? null) : null)

  function commitRename() {
    if (!selectedId) return
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      editing = false
      return
    }
    events = events.map((e) => (e.id === selectedId ? { ...e, title: trimmed } : e))
    editing = false
  }

  function handleDelete() {
    if (!selectedId) return
    events = events.filter((e) => e.id !== selectedId)
    popoverApi.setOpen(false)
  }
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
            <div {...api.getDayColumnProps({ date: d })}>
              {#each api.hourRange.hours as h (h.value)}
                <div class="scheduler-hour-line" style={h.style}></div>
              {/each}
              {#each api.getEventsForDay(d) as event (event.id)}
                <div {...api.getEventProps({ event })}>
                  <div class="scheduler-event-title">{event.title}</div>
                  <div {...api.getEventResizeHandleProps({ event, edge: "end" })} class="scheduler-resize-handle">
                    <div class="scheduler-resize-grip"></div>
                  </div>
                </div>
              {/each}
              {@const origin = api.getDragOrigin({ date: d })}
              {@const ghost = api.getDragGhost({ date: d })}
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
      {#if selectedEvent}
        <div class="scheduler-event-popover-body" style="--event-color: {selectedEvent.color}">
          <div class="scheduler-event-popover-row">
            <span aria-hidden class="scheduler-event-popover-dot"></span>
            {#if editing}
              <!-- svelte-ignore a11y_autofocus -->
              <input
                autofocus
                class="scheduler-event-popover-title"
                bind:value={draftTitle}
                onblur={commitRename}
                onkeydown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commitRename()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    editing = false
                    if (selectedEvent) draftTitle = selectedEvent.title ?? ""
                  }
                }}
              />
            {:else}
              <strong class="scheduler-event-popover-title">{selectedEvent.title}</strong>
            {/if}
          </div>
          <div class="scheduler-event-popover-time">
            {api.formatTimeRange(selectedEvent.start, selectedEvent.end)}
          </div>
          <div class="scheduler-event-popover-duration">
            Duration: {api.formatDuration(selectedEvent.start, selectedEvent.end)}
          </div>
          <div class="scheduler-event-popover-actions">
            <button type="button" onclick={() => (editing = !editing)}>{editing ? "Done" : "Edit"}</button>
            <button type="button" onclick={handleDelete}>Delete</button>
            <button type="button" {...popoverApi.getCloseTriggerProps()} data-close>Close</button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={schedulerService} />
</Toolbar>
