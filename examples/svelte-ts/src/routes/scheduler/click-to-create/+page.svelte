<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import type { DateValue } from "@internationalized/date"
  import * as dialog from "@zag-js/dialog"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerControls } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const TODAY = scheduler.getToday()
  const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  let events = $state<scheduler.SchedulerEvent[]>([
    {
      id: "1",
      title: "Team standup",
      start: TODAY.set({ hour: 9, minute: 0 }),
      end: TODAY.set({ hour: 9, minute: 30 }),
      color: "#3b82f6",
    },
  ])
  let nextId = 1
  let pendingSlot: { start: DateValue; end: DateValue } | null = null
  let title = $state("")

  const controls = useControls(schedulerControls)
  const id = $props.id()
  const dialogService = useMachine(dialog.machine, { id: `dlg-${id}` })
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>({
      id,
      get events() {
        return events
      },
      onEventDragEnd: (d) => (events = d.apply(events)),
      onEventResizeEnd: (d) => (events = d.apply(events)),
      onSlotDoubleClick: (d) => {
        pendingSlot = { start: d.start, end: d.end }
        title = ""
        dialogApi.setOpen(true)
      },
    }),
  )
  const api = $derived(scheduler.connect(service, normalizeProps))

  function commit() {
    if (!pendingSlot || !title.trim()) {
      dialogApi.setOpen(false)
      return
    }
    const newId = `new-${++nextId}`
    events = [
      ...events,
      { id: newId, title: title.trim(), start: pendingSlot.start, end: pendingSlot.end, color: PALETTE[nextId % PALETTE.length] },
    ]
    pendingSlot = null
    api.clearSelectedSlot()
    dialogApi.setOpen(false)
  }

  function cancel() {
    pendingSlot = null
    api.clearSelectedSlot()
    dialogApi.setOpen(false)
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
              {@const slot = api.getSelectedSlot({ date: d })}
              {@const origin = api.getDragOrigin({ date: d })}
              {@const ghost = api.getDragGhost({ date: d })}
              {#if slot}<div {...slot.props}></div>{/if}
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

  {#if dialogApi.open}
    <div use:portal {...dialogApi.getBackdropProps()} class="scheduler-dialog-backdrop"></div>
    <div use:portal {...dialogApi.getPositionerProps()} class="scheduler-dialog-positioner">
      <div {...dialogApi.getContentProps()} class="scheduler-dialog">
        <h2 {...dialogApi.getTitleProps()}>New event</h2>
        <!-- svelte-ignore a11y_autofocus -->
        <input
          autofocus
          type="text"
          placeholder="Event title"
          bind:value={title}
          onkeydown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") cancel()
          }}
        />
        <div class="scheduler-dialog-actions">
          <button type="button" onclick={cancel}>Cancel</button>
          <button type="button" onclick={commit} data-primary>Create</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
