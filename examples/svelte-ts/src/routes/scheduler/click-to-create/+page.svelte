<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as popover from "@zag-js/popover"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-svelte"
  import "@styles/scheduler.css"
  import "@styles/popover.css"

  const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  const controls = useControls(schedulerControls)
  let events = $state.raw(schedulerEvents)
  let nextId = schedulerEvents.length
  let title = $state("")

  const id = $props.id()

  const popoverService = useMachine(popover.machine, {
    id: `${id}-popover`,
    positioning: {
      placement: "right-start",
      gutter: 8,
      getAnchorElement: () => api.getSelectedSlotEl(),
    },
    onOpenChange: (d) => {
      if (!d.open) {
        api.clearSelectedSlot()
        title = ""
      }
    },
  })
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  const controlProps = controls.mergeProps<scheduler.Props>({ id })
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    ...controlProps(),
    defaultDate: schedulerAnchor,
    events,
    onEventDrop: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events = events.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    // Fires on both single click (action: "click") and drag-release (action: "drag").
    // Single click gives a `slotInterval`-sized slot; drag gives the dragged bounds.
    onSlotSelect() {
      title = ""
      popoverApi.setOpen(true)
      popoverApi.reposition()
    },
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
  const pending = $derived(api.selectedSlot)

  function commit() {
    if (!pending || !title.trim()) return
    const id = `new-${++nextId}`
    events = [
      ...events,
      {
        id,
        title: title.trim(),
        start: pending.start,
        end: pending.end,
        color: PALETTE[nextId % PALETTE.length],
      },
    ]
    popoverApi.setOpen(false)
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      commit()
    }
  }
</script>

<main class="scheduler">
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
      <span style="margin-inline-start: auto; font-size: 12px; color: #6b7280">
        Click or drag on an empty slot to create an event
      </span>
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
                <div {...api.getSelectedSlotProps({ date })}></div>
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
        {#if pending}
          <div class="scheduler-event-popover-body">
            <div {...mergeProps(popoverApi.getTitleProps(), { style: { fontSize: "13px", fontWeight: 600 } })}>
              New event
            </div>
            <div class="scheduler-event-popover-time">{api.formatTimeRange(pending.start, pending.end)}</div>
            <!-- svelte-ignore a11y_autofocus -->
            <input
              autofocus
              type="text"
              placeholder="Event title"
              bind:value={title}
              onkeydown={handleKey}
              style="margin-block-start: 6px; padding: 4px 6px; font-size: 13px; width: 100%"
            />
            <div class="scheduler-event-popover-actions">
              <button type="button" {...popoverApi.getCloseTriggerProps()}>
                <XIcon />
              </button>
              <button type="button" onclick={commit} data-primary>Create</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </Portal>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
