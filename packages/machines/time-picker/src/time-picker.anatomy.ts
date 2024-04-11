import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("time-picker").parts(
  "root",
  "label",
  "clearTrigger",
  "content",
  "contentColumn",
  "control",
  "input",
  "hourCell",
  "minuteCell",
  "amPeriodTrigger",
  "pmPeriodTrigger",
  "positioner",
  "trigger",
)

export const parts = anatomy.build()
