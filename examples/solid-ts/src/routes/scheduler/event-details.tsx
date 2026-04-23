import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
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
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  let anchorEl: HTMLElement | null = null
  const [editing, setEditing] = createSignal(false)
  const [draftTitle, setDraftTitle] = createSignal("")

  const schedulerService = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
      onEventClick: (d) => {
        const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
        anchorEl = el
        setSelectedId(d.event.id)
        setEditing(false)
        setDraftTitle(d.event.title ?? "")
        popoverApi().setOpen(true)
        popoverApi().reposition()
      },
    })),
  )
  const api = createMemo(() => scheduler.connect(schedulerService, normalizeProps))

  const popoverService = useMachine(popover.machine, {
    id: createUniqueId(),
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
        setSelectedId(null)
        setEditing(false)
      }
    },
  })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  const selectedEvent = createMemo(() => (selectedId() ? (api().getEventById(selectedId()!) ?? null) : null))

  function commitRename() {
    const id = selectedId()
    if (!id) return
    const trimmed = draftTitle().trim()
    if (!trimmed) {
      setEditing(false)
      return
    }
    setEvents(events().map((e) => (e.id === id ? { ...e, title: trimmed } : e)))
    setEditing(false)
  }

  function handleDelete() {
    const id = selectedId()
    if (!id) return
    setEvents(events().filter((e) => e.id !== id))
    popoverApi().setOpen(false)
  }

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>{api().prevTriggerIcon}</button>
            <button {...api().getTodayTriggerProps()}>{api().todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>{api().nextTriggerIcon}</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div class="scheduler-col-headers">
              <div class="scheduler-header-cell scheduler-gutter-header" />
              <Index each={api().visibleDays}>
                {(d, i) => (
                  <div class="scheduler-header-cell">
                    <span class="scheduler-header-day-label">{api().weekDays[i % 7].short}</span>
                    <span class="scheduler-header-day-num">{d().day}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll">
              <div {...api().getGridProps()} class="scheduler-time-grid">
                <div {...api().getTimeGutterProps()}>
                  <Index each={api().hourRange.hours}>
                    {(h) => (
                      <div class="scheduler-hour-label" style={h().style}>
                        {h().label}
                      </div>
                    )}
                  </Index>
                </div>

                <Index each={api().visibleDays}>
                  {(d) => (
                    <div {...api().getDayColumnProps({ date: d() })}>
                      <Index each={api().hourRange.hours}>
                        {(h) => <div class="scheduler-hour-line" style={h().style} />}
                      </Index>
                      <Index each={api().getEventsForDay(d())}>
                        {(event) => (
                          <div {...api().getEventProps({ event: event() })}>
                            <div class="scheduler-event-title">{event().title}</div>
                            <div
                              {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}
                              class="scheduler-resize-handle"
                            >
                              <div class="scheduler-resize-grip" />
                            </div>
                          </div>
                        )}
                      </Index>
                      <Show when={api().getDragOrigin({ date: d() })}>{(origin) => <div {...origin().props} />}</Show>
                      <Show when={api().getDragGhost({ date: d() })}>
                        {(ghost) => (
                          <div {...ghost().props}>
                            <div class="scheduler-event-title">{ghost().event.title}</div>
                          </div>
                        )}
                      </Show>
                    </div>
                  )}
                </Index>
              </div>
            </div>
          </div>
        </div>

        <Portal>
          <div {...popoverApi().getPositionerProps()}>
            <div {...popoverApi().getContentProps()} class="scheduler-event-popover">
              <Show when={selectedEvent()}>
                {(evt) => (
                  <div class="scheduler-event-popover-body" style={{ "--event-color": evt().color }}>
                    <div class="scheduler-event-popover-row">
                      <span aria-hidden class="scheduler-event-popover-dot" />
                      <Show
                        when={editing()}
                        fallback={<strong class="scheduler-event-popover-title">{evt().title}</strong>}
                      >
                        <input
                          autofocus
                          class="scheduler-event-popover-title"
                          value={draftTitle()}
                          onInput={(e) => setDraftTitle(e.currentTarget.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              commitRename()
                            } else if (e.key === "Escape") {
                              e.preventDefault()
                              setEditing(false)
                              setDraftTitle(evt().title ?? "")
                            }
                          }}
                        />
                      </Show>
                    </div>
                    <div class="scheduler-event-popover-time">{api().formatTimeRange(evt().start, evt().end)}</div>
                    <div class="scheduler-event-popover-duration">
                      Duration: {api().formatDuration(evt().start, evt().end)}
                    </div>
                    <div class="scheduler-event-popover-actions">
                      <button type="button" onClick={() => setEditing(!editing())}>
                        {editing() ? "Done" : "Edit"}
                      </button>
                      <button type="button" onClick={handleDelete}>
                        Delete
                      </button>
                      <button type="button" {...popoverApi().getCloseTriggerProps()} data-close>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </Portal>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={schedulerService} />
      </Toolbar>
    </>
  )
}
