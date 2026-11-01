import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"
import "@styles/popover.css"

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal(schedulerEvents)
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  let anchorEl: HTMLElement | null = null
  const [editing, setEditing] = createSignal(false)
  const [draftTitle, setDraftTitle] = createSignal("")

  const id = createUniqueId()
  const schedulerService = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventDrop: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventClick: (d) => {
        anchorEl = api().getEventEl(d.event.id)
        setSelectedId(d.event.id)
        setEditing(false)
        setDraftTitle(d.event.title)
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
      getAnchorElement: () => anchorEl,
    },
    onOpenChange: (details) => {
      if (!details.open) {
        setSelectedId(null)
        setEditing(false)
      }
    },
  })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  const selectedEvent = createMemo(() => {
    const sid = selectedId()
    return sid ? api().getEventById(sid) : undefined
  })

  function commitRename() {
    const sid = selectedId()
    if (!sid) return
    const trimmed = draftTitle().trim()
    if (!trimmed) {
      setEditing(false)
      return
    }
    setEvents((prev) => prev.map((e) => (e.id === sid ? { ...e, title: trimmed } : e)))
    setEditing(false)
  }

  function handleRenameKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      commitRename()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setEditing(false)
      const event = selectedEvent()
      if (event) setDraftTitle(event.title)
    }
  }

  function handleDelete() {
    const sid = selectedId()
    if (!sid) return
    setEvents((prev) => prev.filter((e) => e.id !== sid))
    popoverApi().setOpen(false)
  }

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPreviousTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api().getTodayTriggerProps()}>Today</button>
            <button {...api().getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div {...api().getColumnHeadersProps()}>
              <div class="scheduler-gutter-header" />
              <Index each={api().visibleDays}>
                {(date) => (
                  <div {...api().getColumnHeaderProps({ date: date() })}>
                    <span class="scheduler-header-day-label">{api().formatWeekDay(date())}</span>
                    <span class="scheduler-header-day-num">{date().day}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll" tabIndex={0} role="group" aria-label="Time grid">
              <div {...api().getGridProps()}>
                <div {...api().getGridRowProps()}>
                  <div {...api().getTimeGutterProps()}>
                    <Index each={api().hourRange.hours}>
                      {(hour) => <div {...api().getHourLabelProps({ hour: hour() })}>{hour().label}</div>}
                    </Index>
                  </div>

                  <Index each={api().visibleDays}>
                    {(date) => (
                      <div {...api().getDayColumnProps({ date: date() })}>
                        <Index each={api().hourRange.hours}>
                          {(hour) => <div {...api().getHourLineProps({ hour: hour() })} />}
                        </Index>
                        <div {...api().getCurrentTimeIndicatorProps({ date: date() })} />
                        <Index each={api().getEventsForDay(date())}>
                          {(event) => (
                            <div {...api().getEventProps({ event: event() })}>
                              <div class="scheduler-event-title">{event().title}</div>
                              <div {...api().getEventResizeHandleProps({ event: event(), edge: "end" })}>
                                <div class="scheduler-resize-grip" />
                              </div>
                            </div>
                          )}
                        </Index>
                        <div {...api().getDragOriginProps({ date: date() })} />
                        <div {...api().getDragPreviewProps({ date: date() })}>
                          <div class="scheduler-event-title">{api().dragState?.event.title}</div>
                        </div>
                      </div>
                    )}
                  </Index>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Portal>
          <div {...popoverApi().getPositionerProps()}>
            <div {...popoverApi().getContentProps()} class="scheduler-event-popover">
              <Show when={selectedEvent()}>
                {(event) => (
                  <div class="scheduler-event-popover-body" style={{ "--event-color": event().color }}>
                    <div class="scheduler-event-popover-row">
                      <span aria-hidden class="scheduler-event-popover-dot" />
                      <Show
                        when={editing()}
                        fallback={<strong class="scheduler-event-popover-title">{event().title}</strong>}
                      >
                        <input
                          ref={(el) => queueMicrotask(() => el.focus())}
                          class="scheduler-event-popover-title"
                          value={draftTitle()}
                          onInput={(e) => setDraftTitle(e.currentTarget.value)}
                          onBlur={commitRename}
                          onKeyDown={handleRenameKey}
                        />
                      </Show>
                    </div>
                    <div class="scheduler-event-popover-time">{api().formatTimeRange(event().start, event().end)}</div>
                    <div class="scheduler-event-popover-duration">
                      Duration: {api().formatDuration(event().start, event().end)}
                    </div>
                    <div class="scheduler-event-popover-actions">
                      <button type="button" onClick={() => setEditing((v) => !v)}>
                        {editing() ? "Done" : "Edit"}
                      </button>
                      <button type="button" onClick={handleDelete}>
                        Delete
                      </button>
                      <button type="button" {...popoverApi().getCloseTriggerProps()} data-close>
                        <XIcon />
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
