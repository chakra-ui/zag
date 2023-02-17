import { defineControls } from "./define-controls"

export const accordionControls = defineControls({
  collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
  multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "vertical" },
})

export const checkboxControls = defineControls({
  indeterminate: { type: "boolean", defaultValue: false, label: "Indeterminate" },
  disabled: { type: "boolean", defaultValue: false, label: "disabled" },
  readOnly: { type: "boolean", defaultValue: false, label: "readonly" },
})

export const comboboxControls = defineControls({
  inputBehavior: {
    type: "select",
    defaultValue: "autohighlight",
    options: ["autohighlight", "autocomplete", "none"] as const,
  },
  selectionBehavior: {
    type: "select",
    defaultValue: "set",
    options: ["set", "clear"] as const,
  },
  disabled: { type: "boolean", defaultValue: false },
  loop: { type: "boolean", defaultValue: true },
  openOnClick: { type: "boolean", defaultValue: false },
  blurOnSelect: { type: "boolean", defaultValue: false },
  selectInputOnFocus: { type: "boolean", defaultValue: false },
  selectOnTab: { type: "boolean", defaultValue: true },
})

export const comboboxTagsControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
})

export const editableControls = defineControls({
  readOnly: { type: "boolean", defaultValue: false },
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

export const menuControls = defineControls({
  closeOnSelect: { type: "boolean", defaultValue: true, label: "Close on select" },
})

export const hoverCardControls = defineControls({
  openDelay: { type: "number", defaultValue: 700 },
  closeDelay: { type: "number", defaultValue: 300 },
})

export const numberInputControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  clampValueOnBlur: { type: "boolean", defaultValue: true },
  allowMouseWheel: { type: "boolean", defaultValue: false },
  spinOnPress: { type: "boolean", defaultValue: true },
  step: { type: "number", defaultValue: 1 },
  minFractionDigits: { type: "number", defaultValue: 0 },
  maxFractionDigits: { type: "number", defaultValue: 3 },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
})

export const pinInputControls = defineControls({
  mask: { type: "boolean", defaultValue: false },
  otp: { type: "boolean", defaultValue: false },
  blurOnComplete: { type: "boolean", defaultValue: false },
  type: { type: "select", options: ["numeric", "alphanumeric", "alphabetic"] as const, defaultValue: "numeric" },
})

export const popoverControls = defineControls({
  modal: { type: "boolean", defaultValue: false },
  portalled: { type: "boolean", defaultValue: true },
  autoFocus: { type: "boolean", defaultValue: true },
  closeOnEsc: { type: "boolean", defaultValue: true },
})

export const sliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  thumbAlignment: { type: "select", options: ["contain", "center"] as const, defaultValue: "contain" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  origin: { type: "select", options: ["center", "start"] as const, defaultValue: "start" },
  step: { type: "number", defaultValue: 1 },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
})

export const radioControls = defineControls({
  disabled: { type: "boolean", defaultValue: false, label: "Disabled" },
  readOnly: { type: "boolean", defaultValue: false, label: "Readonly" },
})

export const rangeSliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  thumbAlignment: { type: "select", options: ["contain", "center"] as const, defaultValue: "contain" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
  step: { type: "number", defaultValue: 1 },
})

export const tabsControls = defineControls({
  activationMode: { type: "select", options: ["manual", "automatic"] as const, defaultValue: "automatic" },
  loop: { type: "boolean", defaultValue: true, label: "loop?" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  orientation: { type: "select", options: ["vertical", "horizontal"] as const, defaultValue: "horizontal" },
})

export const paginationControls = defineControls({
  pageSize: { type: "number", defaultValue: 10 },
  siblingCount: { type: "number", defaultValue: 1 },
})

export const tagsInputControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  addOnPaste: { type: "boolean", defaultValue: false },
  blurBehavior: { type: "select", options: ["add", "clear"] as const, defaultValue: "---" },
  max: { type: "number", defaultValue: 6 },
  allowOverflow: { type: "boolean", defaultValue: false },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const ratingControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  allowHalf: { type: "boolean", defaultValue: true },
  max: { type: "number", defaultValue: 5 },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const splitterControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  orientation: { type: "select", options: ["vertical", "horizontal"] as const, defaultValue: "horizontal" },
})

export const toastControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  pauseOnPageIdle: { type: "boolean", defaultValue: false },
  pauseOnInteraction: { type: "boolean", defaultValue: true },
})

export const selectControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  loop: { type: "boolean", defaultValue: false, label: "Loop navigation" },
  readOnly: { type: "boolean", defaultValue: false },
  selectOnTab: { type: "boolean", defaultValue: false },
  closeOnSelect: { type: "boolean", defaultValue: true },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const datePickerControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const transitionControls = defineControls({
  duration: { type: "number", defaultValue: 200 },
  easing: {
    type: "select",
    options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const,
    defaultValue: "ease",
  },
})
