import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "clearTrigger",
  "content",
  "control",
  "input",
  "segment",
  "label",
  "monthSelect",
  "nextTrigger",
  "positioner",
  "presetTrigger",
  "prevTrigger",
  "rangeText",
  "root",
  "table",
  "tableBody",
  "tableCell",
  "tableCellTrigger",
  "tableHead",
  "tableHeader",
  "tableRow",
  "trigger",
  "view",
  "viewControl",
  "viewTrigger",
  "yearSelect",
)

export const parts = anatomy.build()
