import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("time-picker").parts(
  "root",
  "label",
  "clearTrigger",
  "content",
  "control",
  "input",
  "hourCell",
  "minuteCell",
  "AMPeriodTrigger",
  "PMPeriodTrigger",
  "positioner",
  "trigger",
)

export const parts = anatomy.build()
