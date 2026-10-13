import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { useId, useState } from "react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import styles from "../styles/machines/scheduler.module.css"

interface SchedulerProps extends Omit<scheduler.Props, "id"> {}

const views: scheduler.ViewType[] = ["day", "week"]

export function Scheduler(props: SchedulerProps) {
  const [events, setEvents] = useState(createEvents)

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "week",
    dayStartHour: 8,
    dayEndHour: 18,
    ...props,
    events,
    onEventDrop(details) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === details.event.id
            ? { ...event, start: details.newStart, end: details.newEnd }
            : event,
        ),
      )
    },
    onEventResize(details) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === details.event.id
            ? { ...event, start: details.newStart, end: details.newEnd }
            : event,
        ),
      )
    },
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Header} {...api.getHeaderProps()}>
        <div className={styles.Nav}>
          <button className={styles.IconButton} {...api.getPrevTriggerProps()}>
            <LuChevronLeft />
          </button>
          <button className={styles.Button} {...api.getTodayTriggerProps()}>
            Today
          </button>
          <button className={styles.IconButton} {...api.getNextTriggerProps()}>
            <LuChevronRight />
          </button>
        </div>
        <span className={styles.Title} {...api.getHeaderTitleProps()}>
          {api.visibleRangeText.formatted}
        </span>
        <div className={styles.ViewSelect} {...api.getViewSelectProps()}>
          {views.map((view) => (
            <button
              key={view}
              className={styles.ViewItem}
              {...api.getViewItemProps({ view })}
            >
              {api.getViewText(view)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.Scroller}>
        <div className={styles.ColumnHeaders} {...api.getColumnHeadersProps()}>
          <div aria-hidden className={styles.Corner} />
          {api.visibleDays.map((date) => (
            <div
              key={date.toString()}
              className={styles.ColumnHeader}
              {...api.getColumnHeaderProps({ date })}
            >
              <span className={styles.WeekDay}>{api.formatWeekDay(date)}</span>
              <span className={styles.DayNumber}>{date.day}</span>
            </div>
          ))}
        </div>

        <div className={styles.Grid} {...api.getGridProps()}>
          <div className={styles.GridRow} {...api.getGridRowProps()}>
            <div className={styles.TimeGutter} {...api.getTimeGutterProps()}>
              {api.hourRange.hours.map((hour) => (
                <div
                  key={hour.value}
                  className={styles.HourLabel}
                  {...api.getHourLabelProps({ hour })}
                >
                  {hour.label}
                </div>
              ))}
            </div>

            {api.visibleDays.map((date) => (
              <div
                key={date.toString()}
                className={styles.DayColumn}
                {...api.getDayColumnProps({ date })}
              >
                {api.hourRange.hours.map((hour) => (
                  <div
                    key={hour.value}
                    className={styles.HourLine}
                    {...api.getHourLineProps({ hour })}
                  />
                ))}

                <div
                  className={styles.CurrentTime}
                  {...api.getCurrentTimeIndicatorProps({ date })}
                />

                {api
                  .getEventsForDay(date)
                  .filter((event) => !event.allDay)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={styles.Event}
                      {...api.getEventProps({ event })}
                    >
                      <span className={styles.EventTitle}>{event.title}</span>
                      <span className={styles.EventTime}>
                        {api.formatTimeRange(event.start, event.end)}
                      </span>
                      <div
                        className={styles.ResizeHandle}
                        {...api.getEventResizeHandleProps({
                          event,
                          edge: "end",
                        })}
                      />
                    </div>
                  ))}

                <div
                  className={styles.DragOrigin}
                  {...api.getDragOriginProps({ date })}
                />
                <div
                  className={styles.DragPreview}
                  {...api.getDragPreviewProps({ date })}
                >
                  {api.dragState?.event.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function createEvents(): scheduler.SchedulerEvent[] {
  const weekStart = startOfWeek(scheduler.getToday(), "en-US")
  const at = (day: number, hour: number, minute = 0) =>
    weekStart.add({ days: day }).set({ hour, minute })

  return [
    {
      id: "standup",
      title: "Standup",
      start: at(1, 9),
      end: at(1, 9, 30),
      color: "#3b82f6",
    },
    {
      id: "design-review",
      title: "Design review",
      start: at(1, 13),
      end: at(1, 14, 30),
      color: "#10b981",
    },
    {
      id: "product-sync",
      title: "Product sync",
      start: at(2, 10, 30),
      end: at(2, 12),
      color: "#8b5cf6",
    },
    {
      id: "interview",
      title: "Interview",
      start: at(2, 11),
      end: at(2, 12, 30),
      color: "#ef4444",
    },
    {
      id: "planning",
      title: "Sprint planning",
      start: at(3, 9),
      end: at(3, 10, 30),
      color: "#f59e0b",
    },
    {
      id: "focus",
      title: "Focus time",
      start: at(3, 14),
      end: at(3, 16),
      color: "#64748b",
    },
    {
      id: "one-on-one",
      title: "1:1 with Sam",
      start: at(4, 15),
      end: at(4, 16),
      color: "#ec4899",
    },
    {
      id: "demo",
      title: "Demo day",
      start: at(5, 11),
      end: at(5, 12, 30),
      color: "#14b8a6",
    },
  ]
}
