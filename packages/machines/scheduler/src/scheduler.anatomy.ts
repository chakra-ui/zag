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
  "resourceHeader",
  "event",
  "eventResizeHandle",
  "currentTimeIndicator",
  "moreEvents",
)

export const parts = anatomy.build()
