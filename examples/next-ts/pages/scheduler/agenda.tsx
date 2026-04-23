import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.set({ hour: 9, minute: 0 }),
    end: TODAY.set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.add({ days: 1 }).set({ hour: 10, minute: 0 }),
    end: TODAY.add({ days: 1 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: TODAY.add({ days: 3 }).set({ hour: 15, minute: 0 }),
    end: TODAY.add({ days: 3 }).set({ hour: 16, minute: 0 }),
    color: "#8b5cf6",
  },
  {
    id: "4",
    title: "Sprint planning",
    start: TODAY.add({ days: 5 }).set({ hour: 13, minute: 0 }),
    end: TODAY.add({ days: 5 }).set({ hour: 14, minute: 30 }),
    color: "#f59e0b",
  },
  {
    id: "5",
    title: "Demo day",
    start: TODAY.add({ days: 7 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 7 }).set({ hour: 15, minute: 30 }),
    color: "#ef4444",
  },
  {
    id: "6",
    title: "Quarterly review",
    start: TODAY.add({ days: 17 }).set({ hour: 11, minute: 0 }),
    end: TODAY.add({ days: 17 }).set({ hour: 12, minute: 0 }),
    color: "#ec4899",
  },
]

export default function Page() {
  const controls = useControls(schedulerControls)
  const { view: _view, ...controlsRest } = controls.context as any

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controlsRest,
    view: "agenda",
    events: INITIAL,
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()} style={{ maxWidth: 520 }}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div className="scheduler-mobile-agenda">
            {api.agendaGroups.length === 0 ? (
              <div className="scheduler-mobile-agenda-empty">
                No events between {api.formatLongDate(api.visibleRange.start)} and{" "}
                {api.formatLongDate(api.visibleRange.end)}
              </div>
            ) : (
              api.agendaGroups.map((group) => (
                <div key={group.date.toString()} className="scheduler-agenda-group">
                  <div className="scheduler-mobile-agenda-title">{api.formatLongDate(group.date)}</div>
                  {group.events.map((event) => (
                    <div
                      key={event.id}
                      {...api.getEventProps({ event })}
                      className="scheduler-mobile-agenda-event"
                      style={{ ["--event-color"]: event.color ?? "#3b82f6" } as React.CSSProperties}
                    >
                      <div className="scheduler-mobile-agenda-time">{api.formatTimeRange(event.start, event.end)}</div>
                      <div className="scheduler-event-title">{event.title}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
