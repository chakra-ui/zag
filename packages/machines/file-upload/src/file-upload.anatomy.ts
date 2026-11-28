import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("file-upload").parts(
  "root",
  "dropzone",
  "item",
  "itemRemoveTrigger",
  "itemGroup",
  "itemName",
  "itemPreview",
  "itemPreviewImage",
  "itemSizeText",
  "label",
  "trigger",
  "clearTrigger",
)

export const parts = anatomy.build()
