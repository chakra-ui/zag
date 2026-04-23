import * as dialog from "@zag-js/dialog"
import * as scheduler from "@zag-js/scheduler"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { schedulerControls } from "@zag-js/shared"
import { useId, useRef, useState } from "react"
import type { DateValue } from "@internationalized/date"
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
  const pendingSlotRef = useRef<{ start: DateValue; end: DateValue } | null>(null)
  const [title, setTitle] = useState("")

  const dialogService = useMachine(dialog.machine, { id: useId() })
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    ...controls.context,
    events,
    onEventDragEnd: (d) => setEvents(d.apply),
    onEventResizeEnd: (d) => setEvents(d.apply),
    onSlotDoubleClick(d) {
      pendingSlotRef.current = { start: d.start, end: d.end }
      setTitle("")
      dialogApi.setOpen(true)
    },
  })

  const api = scheduler.connect(service, normalizeProps)
  const { visibleDays, hourRange, weekDays } = api

  const commit = () => {
    const slot = pendingSlotRef.current
    if (!slot || !title.trim()) {
      dialogApi.setOpen(false)
      return
    }
    const id = `new-${++nextIdRef.current}`
    setEvents((p) => [
      ...p,
      { id, title: title.trim(), start: slot.start, end: slot.end, color: PALETTE[nextIdRef.current % PALETTE.length] },
    ])
    pendingSlotRef.current = null
    api.clearSelectedSlot()
    dialogApi.setOpen(false)
  }

  const cancel = () => {
    pendingSlotRef.current = null
    api.clearSelectedSlot()
    dialogApi.setOpen(false)
  }

  return (
    <>
      <main className="scheduler">
        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>{api.prevTriggerIcon}</button>
            <button {...api.getTodayTriggerProps()}>{api.todayTriggerLabel}</button>
            <button {...api.getNextTriggerProps()}>{api.nextTriggerIcon}</button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div className="scheduler-col-headers">
              <div className="scheduler-header-cell scheduler-gutter-header" />
              {visibleDays.map((d, i) => (
                <div key={d.toString()} className="scheduler-header-cell">
                  <span className="scheduler-header-day-label">{weekDays[i % 7].short}</span>
                  <span className="scheduler-header-day-num">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll">
              <div {...api.getGridProps()} className="scheduler-time-grid">
                <div {...api.getTimeGutterProps()}>
                  {hourRange.hours.map((h) => (
                    <div key={h.value} className="scheduler-hour-label" style={h.style}>
                      {h.label}
                    </div>
                  ))}
                </div>

                {visibleDays.map((d) => {
                  const ghost = api.getDragGhost({ date: d })
                  const origin = api.getDragOrigin({ date: d })
                  const slot = api.getSelectedSlot({ date: d })
                  return (
                    <div key={d.toString()} {...api.getDayColumnProps({ date: d })}>
                      {hourRange.hours.map((h) => (
                        <div key={h.value} className="scheduler-hour-line" style={h.style} />
                      ))}
                      {api.getEventsForDay(d).map((event) => (
                        <div key={event.id} {...api.getEventProps({ event })}>
                          <div className="scheduler-event-title">{event.title}</div>
                          <div
                            {...api.getEventResizeHandleProps({ event, edge: "end" })}
                            className="scheduler-resize-handle"
                          >
                            <div className="scheduler-resize-grip" />
                          </div>
                        </div>
                      ))}
                      {slot && <div {...slot.props} />}
                      {origin && <div {...origin.props} />}
                      {ghost && (
                        <div {...ghost.props}>
                          <div className="scheduler-event-title">{ghost.event.title}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.getBackdropProps()} className="scheduler-dialog-backdrop" />
          <div {...dialogApi.getPositionerProps()} className="scheduler-dialog-positioner">
            <div {...dialogApi.getContentProps()} className="scheduler-dialog">
              <h2 {...dialogApi.getTitleProps()}>New event</h2>
              <input
                autoFocus
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit()
                  if (e.key === "Escape") cancel()
                }}
              />
              <div className="scheduler-dialog-actions">
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
      )}

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
