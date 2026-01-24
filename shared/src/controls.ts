import { defineControls } from "./define-controls"

export const accordionControls = defineControls({
  collapsible: { type: "boolean", defaultValue: false },
  multiple: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "vertical" },
})

export const checkboxControls = defineControls({
  name: { type: "string", defaultValue: "checkbox" },
  disabled: { type: "boolean", defaultValue: false },
  value: { type: "string", defaultValue: "on" },
  readOnly: { type: "boolean", defaultValue: false },
})

export const collapsibleControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const switchControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
})

export const comboboxControls = defineControls({
  inputBehavior: {
    type: "select",
    defaultValue: "autohighlight",
    options: ["autohighlight", "autocomplete", "none"] as const,
  },
  selectionBehavior: {
    type: "select",
    defaultValue: "replace",
    options: ["replace", "clear", "preserve"] as const,
  },
  disabled: { type: "boolean", defaultValue: false },
  multiple: { type: "boolean", defaultValue: false },
  loopFocus: { type: "boolean", defaultValue: true },
  openOnClick: { type: "boolean", defaultValue: false },
})

export const editableControls = defineControls({
  readOnly: { type: "boolean", defaultValue: false },
  disabled: { type: "boolean", defaultValue: false },
  autoResize: { type: "boolean", defaultValue: false },
  maxLength: { type: "number", defaultValue: 1000 },
  submitMode: {
    type: "select",
    options: ["enter", "blur", "both", "none"] as const,
    defaultValue: "both",
  },
  activationMode: {
    type: "select",
    options: ["focus", "dblclick", "click"] as const,
    defaultValue: "focus",
  },
})

export const menuControls = defineControls({
  closeOnSelect: { type: "boolean", defaultValue: true },
  loopFocus: { type: "boolean", defaultValue: false },
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
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
  locale: {
    type: "select",
    options: ["en-US", "en-GB", "fr-FR", "de-DE", "ja-JP", "mk-MK", "zh-CN"] as const,
  },
  "formatOptions.maximumFractionDigits": { type: "number" },
  "formatOptions.minimumFractionDigits": { type: "number" },
  "formatOptions.style": {
    type: "select",
    options: ["decimal", "currency", "percent"] as const,
  },
  "formatOptions.currency": {
    type: "select",
    defaultValue: "USD",
    options: ["USD", "EUR", "JPY", "GBP", "MXN", "CNY"] as const,
  },
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

export const radioControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
})

export const sliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  thumbAlignment: { type: "select", options: ["contain", "center"] as const, defaultValue: "contain" },
  thumbCollisionBehavior: { type: "select", options: ["none", "push", "swap"] as const, defaultValue: "none" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  origin: { type: "select", options: ["center", "start", "end"] as const, defaultValue: "start" },
  min: { type: "number", defaultValue: 0 },
  max: { type: "number", defaultValue: 100 },
  step: { type: "number", defaultValue: 1 },
})

export const tabsControls = defineControls({
  activationMode: { type: "select", options: ["manual", "automatic"] as const, defaultValue: "automatic" },
  deselectable: { type: "boolean", defaultValue: false },
  loopFocus: { type: "boolean", defaultValue: true },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  orientation: { type: "select", options: ["vertical", "horizontal"] as const, defaultValue: "horizontal" },
})

export const paginationControls = defineControls({
  pageSize: { type: "number", defaultValue: 10 },
  siblingCount: { type: "number", defaultValue: 1 },
  boundaryCount: { type: "number", defaultValue: 1 },
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
})

export const selectControls = defineControls({
  multiple: { type: "boolean", defaultValue: false },
  disabled: { type: "boolean", defaultValue: false },
  required: { type: "boolean", defaultValue: false },
  loopFocus: { type: "boolean", defaultValue: true },
  readOnly: { type: "boolean", defaultValue: false },
  deselectable: { type: "boolean", defaultValue: false },
  closeOnSelect: { type: "boolean", defaultValue: true },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const listboxControls = defineControls({
  selectionMode: {
    type: "select",
    options: ["none", "single", "multiple", "extended"] as const,
    defaultValue: "single",
  },
  deselectable: { type: "boolean", defaultValue: true },
  disabled: { type: "boolean", defaultValue: false },
  loopFocus: { type: "boolean", defaultValue: false },
})

export const datePickerControls = defineControls({
  readOnly: { type: "boolean", defaultValue: false },
  disabled: { type: "boolean", defaultValue: false },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  startOfWeek: { type: "number", defaultValue: 0 },
  fixedWeeks: { type: "boolean", defaultValue: false },
  locale: {
    type: "select",
    options: ["en-US", "en-GB", "fr-FR", "de-DE", "ja-JP", "mk-MK", "zh-CN"] as const,
    defaultValue: "en-US",
  },
})

export const transitionControls = defineControls({
  duration: { type: "number", defaultValue: 200 },
  easing: {
    type: "select",
    options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const,
    defaultValue: "ease",
  },
})

export const carouselControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
  slidesPerPage: { type: "number", defaultValue: 2 },
  loop: { type: "boolean", defaultValue: false },
})

export const colorPickerControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  format: { type: "select", options: ["hsba", "hsla", "rgba"] as const, defaultValue: "hsla" },
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const fileUploadControls = defineControls({
  accept: { type: "string", defaultValue: "" },
  maxFiles: { type: "number", defaultValue: 1 },
  disabled: { type: "boolean", defaultValue: false },
  dropzone: { type: "boolean", defaultValue: true },
})

export const toggleGroupControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  loopFocus: { type: "boolean", defaultValue: true },
  multiple: { type: "boolean", defaultValue: false },
  rovingFocus: { type: "boolean", defaultValue: true },
})

export const progressControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const treeviewControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  selectionMode: { type: "select", options: ["single", "multiple"] as const, defaultValue: "single" },
  openOnClick: { type: "boolean", defaultValue: true },
})

export const clipboardControls = defineControls({
  timeout: { type: "number", defaultValue: 3000 },
})

export const tourControls = defineControls({
  keyboardNavigation: { type: "boolean", defaultValue: true },
  closeOnEsc: { type: "boolean", defaultValue: true },
  closeOnInteractOutside: { type: "boolean", defaultValue: true },
  preventInteraction: { type: "boolean", defaultValue: true },
})

export const floatingPanelControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  resizable: { type: "boolean", defaultValue: true },
  draggable: { type: "boolean", defaultValue: true },
  lockAspectRatio: { type: "boolean", defaultValue: false },
  closeOnEscape: { type: "boolean", defaultValue: true },
  persistRect: { type: "boolean", defaultValue: false },
})

export const signaturePadControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  "drawing.size": { type: "number", defaultValue: 2 },
  "drawing.simulatePressure": { type: "boolean", defaultValue: true },
})

export const qrCodeControls = defineControls({
  value: { type: "string", defaultValue: "https://chakra-ui.com/" },
  "encoding.ecc": { type: "select", options: ["L", "M", "Q", "H"] as const, defaultValue: "H" },
  "encoding.boostEcc": { type: "boolean", defaultValue: false },
})

export const stepsControls = defineControls({
  linear: { type: "boolean", defaultValue: false },
  orientation: { type: "select", options: ["horizontal", "vertical"] as const, defaultValue: "horizontal" },
})

export const angleSliderControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  step: { type: "number", defaultValue: 1 },
})

export const navigationMenuControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
  openDelay: { type: "number", defaultValue: 200 },
  closeDelay: { type: "number", defaultValue: 300 },
})

export const passwordInputControls = defineControls({
  disabled: { type: "boolean", defaultValue: false },
  readOnly: { type: "boolean", defaultValue: false },
  ignorePasswordManagers: { type: "boolean", defaultValue: false },
})

export const bottomSheetControls = defineControls({
  swipeVelocityThreshold: { type: "number", defaultValue: 700 },
  closeThreshold: { type: "number", defaultValue: 0.25 },
  preventDragOnScroll: { type: "boolean", defaultValue: true },
})

export const scrollAreaControls = defineControls({
  dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
})

export const imageCropperControls = defineControls({
  aspectRatio: { type: "number" },
  minWidth: { type: "number", defaultValue: 40 },
  minHeight: { type: "number", defaultValue: 40 },
  maxWidth: { type: "number" },
  maxHeight: { type: "number" },
  zoomStep: { type: "number", defaultValue: 0.1 },
  minZoom: { type: "number", defaultValue: 1 },
  maxZoom: { type: "number", defaultValue: 5 },
})

export const marqueeControls = defineControls({
  side: { type: "select", options: ["start", "end", "top", "bottom"] as const, defaultValue: "start" },
  speed: { type: "number", defaultValue: 50 },
  pauseOnInteraction: { type: "boolean", defaultValue: false },
  reverse: { type: "boolean", defaultValue: false },
})
