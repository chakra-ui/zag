import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/scheduler.css"

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

const TODAY = schedulerAnchor

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

  const id = createUniqueId()
  const service = useMachine(
    scheduler.machine as scheduler.Machine<MeetingPayload>,
    controls.mergeProps<scheduler.Props<MeetingPayload>>(() => ({
      id,
      defaultDate: schedulerAnchor,
      events: events(),
      onEventDrop: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventResize: (d) =>
        setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
      onEventClick: (d) => setSelectedId(d.event.id),
    })),
  )

  const api = createMemo(() => scheduler.connect(service, normalizeProps))
  const selected = createMemo(() => {
    const sid = selectedId()
    return sid ? (api().getEventById(sid) ?? null) : null
  })

  return (
    <>
      <main class="scheduler scheduler-with-aside">
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
                              <Show when={event().payload}>
                                {(payload) => (
                                  <div class="scheduler-event-meta">
                                    {payload().attendees.length} · {payload().location}
                                  </div>
                                )}
                              </Show>
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

        <aside class="scheduler-event-panel">
          <Show
            when={selected()?.payload ? selected() : null}
            fallback={<div class="scheduler-event-panel-empty">Click an event to see its typed payload.</div>}
          >
            {(event) => (
              <>
                <div class="scheduler-event-panel-title">{event().title}</div>
                <div class="scheduler-event-panel-time">{api().formatTimeRange(event().start, event().end)}</div>
                <div class="scheduler-event-panel-section">
                  <div class="scheduler-event-panel-section-label">Attendees</div>
                  <div>{event().payload!.attendees.join(", ")}</div>
                </div>
                <div class="scheduler-event-panel-row">
                  <span class="scheduler-event-panel-row-label">Location: </span>
                  {event().payload!.location}
                </div>
                <Show when={event().payload!.meetingUrl}>
                  {(url) => (
                    <a href={url()} target="_blank" rel="noreferrer" class="scheduler-event-panel-link">
                      Join meeting →
                    </a>
                  )}
                </Show>
              </>
            )}
          </Show>
        </aside>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
