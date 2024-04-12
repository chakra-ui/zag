import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toast").parts(
  "group",
  "root",
  "ghost",
  "title",
  "description",
  "actionTrigger",
  "closeTrigger",
)

export const parts = anatomy.build()
