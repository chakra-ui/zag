import "@zag-js/shared/src/style.css"

import * as scheduler from "@zag-js/scheduler"
import { nanoid } from "nanoid"
import { Scheduler } from "../src/scheduler"

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

document.querySelectorAll<HTMLElement>(".scheduler").forEach((rootEl) => {
  let events = INITIAL.slice()
  const sched = new Scheduler(rootEl, {
    id: nanoid(),
    events,
    onEventDragEnd: (d) => {
      events = d.apply(events)
      sched.updateProps({ events })
    },
    onEventResizeEnd: (d) => {
      events = d.apply(events)
      sched.updateProps({ events })
    },
  })
  sched.init()
})
