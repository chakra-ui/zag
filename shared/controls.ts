import { defineControls } from "@ui-machines/types"

export const accordionControls = defineControls({
  collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
  multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
  value: { type: "select", defaultValue: "", options: ["home", "about", "contact"], label: "Set value" },
})

export const comboboxControls = defineControls({
  autoComplete: { type: "boolean", defaultValue: true },
  selectOnFocus: { type: "boolean", defaultValue: false },
  allowCustomValue: { type: "boolean", defaultValue: false },
  autoHighlight: { type: "boolean", defaultValue: false },
  loop: { type: "boolean", defaultValue: true },
  disabled: { type: "boolean", defaultValue: false },
})

export const editableControls = defineControls({
  readonly: { type: "boolean", defaultValue: false },
  disabled: { type: "boolean", defaultValue: false },
  autoResize: { type: "boolean", defaultValue: false },
  placeholder: { type: "string", defaultValue: "Type something...", label: "placeholder" },
  submitMode: {
    type: "select",
    label: "submit mode?",
    options: ["enter", "blur", "both", "none"] as const,
    defaultValue: "both",
  },
  activationMode: {
    type: "select",
    options: ["focus", "dblclick", "none"] as const,
    label: "activation mode",
    defaultValue: "focus",
  },
})

export const numberInputControls = defineControls({
  clampValueOnBlur: { type: "boolean", defaultValue: true },
  step: { type: "number", defaultValue: 1 },
  precision: { type: "number", defaultValue: 0 },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
  disabled: { type: "boolean", defaultValue: false },
})

export const pinInputControls = defineControls({
  type: { type: "select", options: ["numeric", "alphanumeric", "alphabetic"] as const, defaultValue: "numeric" },
  mask: { type: "boolean", defaultValue: false },
  otp: { type: "boolean", defaultValue: false },
  blurOnComplete: { type: "boolean", defaultValue: false },
})

export const popoverControls = defineControls({
  modal: { type: "boolean", defaultValue: false },
  portalled: { type: "boolean", defaultValue: true },
  autoFocus: { type: "boolean", defaultValue: true },
  closeOnEsc: { type: "boolean", defaultValue: true },
})

export const sliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readonly: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  origin: { type: "select", options: ["center", "start"] as const, defaultValue: "start" },
  step: { type: "number", defaultValue: 1 },
})

export const rangeSliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readonly: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  step: { type: "number", defaultValue: 1 },
})

export const tabsControls = defineControls({
  activationMode: { type: "select", options: ["manual", "automatic"] as const, defaultValue: "automatic" },
  loop: { type: "boolean", defaultValue: true, label: "loop?" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const tagsInputControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readonly: { type: "boolean", defaultValue: false },
  addOnPaste: { type: "boolean", defaultValue: false },
  addOnBlur: { type: "boolean", defaultValue: false },
  max: { type: "number", defaultValue: 6 },
  allowOutOfRange: { type: "boolean", defaultValue: false },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const ratingControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readonly: { type: "boolean", defaultValue: false },
  allowHalf: { type: "boolean", defaultValue: true },
  value: { type: "number", defaultValue: 3.5 },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const splitterControls = defineControls({
  fixed: { type: "boolean", defaultValue: false },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 340 },
  disabled: { type: "boolean", defaultValue: false },
  snapOffset: { type: "number", defaultValue: 0 },
})
