import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("file-upload").parts(
  "root",
  "dropzone",
  "trigger",
  "label",
  "item",
  "itemName",
  "itemPreview",
  "itemSizeText",
  "itemDeleteTrigger",
  "itemGroup",
)

export const parts = anatomy.build()
