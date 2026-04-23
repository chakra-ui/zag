import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

const TODAY = scheduler.getToday()

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

export default function Page() {
  const controls = useControls(schedulerControls)
  const [events, setEvents] = createSignal<Event[]>(INITIAL)
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  let anchorEl: HTMLElement | null = null

  const schedulerService = useMachine(
    scheduler.machine as scheduler.Machine<MeetingPayload>,
    controls.mergeProps<scheduler.Props<MeetingPayload>>(() => ({
      id: createUniqueId(),
      events: events(),
      onEventDragEnd: (d) => setEvents(d.apply(events())),
      onEventResizeEnd: (d) => setEvents(d.apply(events())),
      onEventClick: (d) => {
        const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
        anchorEl = el
        setSelectedId(d.event.id)
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
      if (!details.open) setSelectedId(null)
    },
  })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  const selected = createMemo<Event | null>(() =>
    selectedId() ? ((api().getEventById(selectedId()!) as Event) ?? null) : null,
  )

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
                            <Show when={event().payload}>
                              {(p) => (
                                <div class="scheduler-event-meta">
                                  {p().attendees.length} · {p().location}
                                </div>
                              )}
                            </Show>
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
              <Show when={selected() && selected()!.payload}>
                <div class="scheduler-event-popover-body" style={{ "--event-color": selected()!.color }}>
                  <div class="scheduler-event-popover-row">
                    <span aria-hidden class="scheduler-event-popover-dot" />
                    <strong class="scheduler-event-popover-title">{selected()!.title}</strong>
                  </div>
                  <div class="scheduler-event-popover-time">
                    {api().formatTimeRange(selected()!.start, selected()!.end)} ·{" "}
                    {api().formatDuration(selected()!.start, selected()!.end)}
                  </div>
                  <div class="scheduler-event-popover-meta">
                    <div>
                      <span class="scheduler-event-popover-label">Attendees</span>
                      <div>{selected()!.payload!.attendees.join(", ")}</div>
                    </div>
                    <div>
                      <span class="scheduler-event-popover-label">Location</span>
                      <div>{selected()!.payload!.location}</div>
                    </div>
                    <Show when={selected()!.payload!.meetingUrl}>
                      <a
                        href={selected()!.payload!.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="scheduler-event-popover-link"
                      >
                        Join meeting →
                      </a>
                    </Show>
                  </div>
                </div>
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
