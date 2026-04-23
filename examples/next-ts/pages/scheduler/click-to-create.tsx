import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
  const [events, setEvents] = useState(INITIAL)
  const nextIdRef = useRef(INITIAL.length)
  const [title, setTitle] = useState("")

  const popoverService = useMachine(popover.machine, {
    id: useId(),
    positioning: {
      placement: "right-start",
      gutter: 8,
      getAnchorElement: () => api.getSelectedSlotEl(),
    },
    onOpenChange: (d) => {
      if (!d.open) {
        api.clearSelectedSlot()
        setTitle("")
      }
    },
  })
  const popoverApi = popover.connect(popoverService, normalizeProps)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDrop: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    onEventResize: (d) =>
      setEvents((prev) => prev.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))),
    // Fires on both single click (action: "click") and drag-release (action: "drag").
    // Single click gives a `slotInterval`-sized slot; drag gives the dragged bounds.
    onSlotSelect() {
      setTitle("")
      popoverApi.setOpen(true)
      popoverApi.reposition()
    },
  })

  const api = scheduler.connect(service, normalizeProps)
  const pending = api.selectedSlot

  function commit() {
    if (!pending || !title.trim()) return
    const id = `new-${++nextIdRef.current}`
    setEvents((p) => [
      ...p,
      {
        id,
        title: title.trim(),
        start: pending.start,
        end: pending.end,
        color: PALETTE[nextIdRef.current % PALETTE.length],
      },
    ])
    popoverApi.setOpen(false)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      commit()
    }
  }

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeft />
            </button>
            <button {...api.getTodayTriggerProps()}>Today</button>
            <button {...api.getNextTriggerProps()}>
              <ChevronRight />
            </button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
            <span style={{ marginInlineStart: "auto", fontSize: 12, color: "#6b7280" }}>
              Click or drag on an empty slot to create an event
            </span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.visibleDays.map((date) => (
                <div key={date.toString()} {...api.getColumnHeaderProps({ date })}>
                  <span className="scheduler-header-day-label">{api.formatWeekDay(date)}</span>
                  <span className="scheduler-header-day-num">{date.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()}>
                <div {...api.getTimeGutterProps()}>
                  {api.hourRange.hours.map((hour) => (
                    <div key={hour.value} {...api.getHourLabelProps({ hour })}>
                      {hour.label}
                    </div>
                  ))}
                </div>

                {api.visibleDays.map((date) => (
                  <div key={date.toString()} {...api.getDayColumnProps({ date })}>
                    {api.hourRange.hours.map((hour) => (
                      <div key={hour.value} {...api.getHourLineProps({ hour })} />
                    ))}
                    <div {...api.getCurrentTimeIndicatorProps({ date })} />
                    {api.getEventsForDay(date).map((event) => (
                      <div key={event.id} {...api.getEventProps({ event })}>
                        <div className="scheduler-event-title">{event.title}</div>
                        <div {...api.getEventResizeHandleProps({ event, edge: "end" })}>
                          <div className="scheduler-resize-grip" />
                        </div>
                      </div>
                    ))}
                    <div {...api.getSelectedSlotProps({ date })} />
                    <div {...api.getDragOriginProps({ date })} />
                    <div {...api.getDragPreviewProps({ date })}>
                      <div className="scheduler-event-title">{api.dragState?.event.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Portal>
          <div {...popoverApi.getPositionerProps()}>
            <div {...popoverApi.getContentProps()} className="scheduler-event-popover">
              {pending ? (
                <div className="scheduler-event-popover-body">
                  <div {...popoverApi.getTitleProps()} style={{ fontSize: 13, fontWeight: 600 }}>
                    New event
                  </div>
                  <div className="scheduler-event-popover-time">{api.formatTimeRange(pending.start, pending.end)}</div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Event title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    onKeyDown={handleKey}
                    style={{ marginBlockStart: 6, padding: "4px 6px", fontSize: 13, width: "100%" }}
                  />
                  <div className="scheduler-event-popover-actions">
                    <button type="button" {...popoverApi.getCloseTriggerProps()}>
                      <XIcon />
                    </button>
                    <button type="button" onClick={commit} data-primary>
                      Create
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Portal>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
