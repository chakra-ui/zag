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

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal(schedulerEvents)
  let nextId = schedulerEvents.length
  const [title, setTitle] = createSignal("")

  const popoverService = useMachine(popover.machine, {
    id: createUniqueId(),
    positioning: {
      placement: "right-start",
      gutter: 8,
      getAnchorElement: () => api().getSelectedSlotEl(),
    },
    onOpenChange: (d) => {
      if (!d.open) {
        api().clearSelectedSlot()
        setTitle("")
      }
    },
  })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventDrop: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      // Fires on both single click (action: "click") and drag-release (action: "drag").
      // Single click gives a `slotInterval`-sized slot; drag gives the dragged bounds.
      onSlotSelect() {
        setTitle("")
        popoverApi().setOpen(true)
        popoverApi().reposition()
      },
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const pending = () => api().selectedSlot

  function commit() {
    const slot = pending()
    if (!slot || !title().trim()) return
    const eventId = `new-${++nextId}`
    setEvents((p) => [
      ...p,
      {
        id: eventId,
        title: title().trim(),
        start: slot.start,
        end: slot.end,
        color: PALETTE[nextId % PALETTE.length],
      },
    ])
    popoverApi().setOpen(false)
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      commit()
    }
  }

  return (
    <>
      <main class="scheduler">
        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api().getTodayTriggerProps()}>Today</button>
            <button {...api().getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
            <span style={{ "margin-inline-start": "auto", "font-size": "12px", color: "#6b7280" }}>
              Click or drag on an empty slot to create an event
            </span>
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
                        <div {...api().getSelectedSlotProps({ date: date() })} />
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
              <Show when={pending()}>
                {(slot) => (
                  <div class="scheduler-event-popover-body">
                    <div {...popoverApi().getTitleProps()} style={{ "font-size": "13px", "font-weight": 600 }}>
                      New event
                    </div>
                    <div class="scheduler-event-popover-time">{api().formatTimeRange(slot().start, slot().end)}</div>
                    <input
                      ref={(el) => queueMicrotask(() => el.focus())}
                      type="text"
                      placeholder="Event title"
                      value={title()}
                      onInput={(e) => setTitle(e.currentTarget.value)}
                      onKeyDown={handleKey}
                      style={{ "margin-block-start": "6px", padding: "4px 6px", "font-size": "13px", width: "100%" }}
                    />
                    <div class="scheduler-event-popover-actions">
                      <button type="button" {...popoverApi().getCloseTriggerProps()}>
                        <XIcon />
                      </button>
                      <button type="button" onClick={commit} data-primary>
                        Create
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
