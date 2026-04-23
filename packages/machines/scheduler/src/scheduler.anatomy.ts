import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("scheduler").parts(
  "root",
  "header",
  "headerTitle",
  "prevTrigger",
  "nextTrigger",
  "todayTrigger",
  "viewSelect",
  "grid",
  "allDayRow",
  "timeSlot",
  "timeGutter",
  "dayColumn",
  "dayCell",
  "event",
  "eventResizeHandle",
  "currentTimeIndicator",
  "moreEvents",
  "dragGhost",
  "dragOrigin",
  "slotHighlight",
  "hourLabel",
  "hourLine",
  "agendaGroup",
  "agendaGroupTitle",
)

export const parts = anatomy.build()
