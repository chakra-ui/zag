<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as popover from "@zag-js/popover"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-svelte"
  import "@styles/scheduler.css"
  import "@styles/popover.css"

  const controls = useControls(schedulerControls)
  let events = $state.raw(schedulerEvents)
  let selectedId = $state<string | null>(null)
  let anchorEl: HTMLElement | null = null
  let editing = $state(false)
  let draftTitle = $state("")

  const id = $props.id()
  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const schedulerService = useMachine(scheduler.machine, (): scheduler.Props => ({
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
      anchorEl = api.getEventEl(d.event.id)
      selectedId = d.event.id
      editing = false
      draftTitle = d.event.title
      popoverApi.setOpen(true)
      popoverApi.reposition()
    },
  }))

  const api = $derived(scheduler.connect(schedulerService, normalizeProps))

  const popoverService = useMachine(popover.machine, {
    id: `${id}-popover`,
    positioning: {
      placement: "right",
      gutter: 8,
      getAnchorElement: () => anchorEl,
    },
    onOpenChange: (details) => {
      if (!details.open) {
        selectedId = null
        editing = false
      }
    },
  })
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  const selectedEvent = $derived(selectedId ? api.getEventById(selectedId) : undefined)

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

  function handleRenameKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      commitRename()
    } else if (e.key === "Escape") {
      e.preventDefault()
      editing = false
      if (selectedEvent) draftTitle = selectedEvent.title
    }
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
      <button {...api.getPrevTriggerProps()}>
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

  <Portal>
    <div {...popoverApi.getPositionerProps()}>
      <div {...popoverApi.getContentProps()} class="scheduler-event-popover">
        {#if selectedEvent}
          <div class="scheduler-event-popover-body" style:--event-color={selectedEvent.color}>
            <div class="scheduler-event-popover-row">
              <span aria-hidden="true" class="scheduler-event-popover-dot"></span>
              {#if editing}
                <!-- svelte-ignore a11y_autofocus -->
                <input
                  autofocus
                  class="scheduler-event-popover-title"
                  bind:value={draftTitle}
                  onblur={commitRename}
                  onkeydown={handleRenameKey}
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
              <button type="button" onclick={() => (editing = !editing)}>
                {editing ? "Done" : "Edit"}
              </button>
              <button type="button" onclick={handleDelete}>Delete</button>
              <button type="button" {...popoverApi.getCloseTriggerProps()} data-close>
                <XIcon />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </Portal>
</main>

<Toolbar {controls}>
  <StateVisualizer state={schedulerService} />
</Toolbar>
