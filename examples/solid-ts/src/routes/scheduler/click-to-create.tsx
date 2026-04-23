import type { DateValue } from "@internationalized/date"
import * as dialog from "@zag-js/dialog"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

const TODAY = scheduler.getToday()
const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.set({ hour: 9, minute: 0 }),
    end: TODAY.set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal<scheduler.SchedulerEvent[]>(INITIAL)
  let nextId = INITIAL.length
  let pendingSlot: { start: DateValue; end: DateValue } | null = null
  const [title, setTitle] = createSignal("")

  const dialogService = useMachine(dialog.machine, { id: createUniqueId() })
  const dialogApi = createMemo(() => dialog.connect(dialogService, normalizeProps))

  const service = useMachine(
    scheduler.machine,
    controls.mergeProps<scheduler.Props>(() => ({
      id: createUniqueId(),
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
      onSlotDoubleClick: (d) => {
        pendingSlot = { start: d.start, end: d.end }
        setTitle("")
        dialogApi().setOpen(true)
      },
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  function commit() {
    if (!pendingSlot || !title().trim()) {
      dialogApi().setOpen(false)
      return
    }
    const id = `new-${++nextId}`
    setEvents([
      ...events(),
      {
        id,
        title: title().trim(),
        start: pendingSlot.start,
        end: pendingSlot.end,
        color: PALETTE[nextId % PALETTE.length],
      },
    ])
    pendingSlot = null
    api().clearSelectedSlot()
    dialogApi().setOpen(false)
  }

  function cancel() {
    pendingSlot = null
    api().clearSelectedSlot()
    dialogApi().setOpen(false)
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
                      <Show when={api().getSelectedSlot({ date: d() })}>{(slot) => <div {...slot().props} />}</Show>
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

        <Show when={dialogApi().open}>
          <Portal>
            <div {...dialogApi().getBackdropProps()} class="scheduler-dialog-backdrop" />
            <div {...dialogApi().getPositionerProps()} class="scheduler-dialog-positioner">
              <div {...dialogApi().getContentProps()} class="scheduler-dialog">
                <h2 {...dialogApi().getTitleProps()}>New event</h2>
                <input
                  autofocus
                  type="text"
                  placeholder="Event title"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit()
                    if (e.key === "Escape") cancel()
                  }}
                />
                <div class="scheduler-dialog-actions">
                  <button type="button" onClick={cancel}>
                    Cancel
                  </button>
                  <button type="button" onClick={commit} data-primary>
                    Create
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        </Show>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
