import * as accordion from "@zag-js/accordion"
import * as angleSlider from "@zag-js/angle-slider"
import * as avatar from "@zag-js/avatar"
import * as carousel from "@zag-js/carousel"
import * as checkbox from "@zag-js/checkbox"
import * as clipboard from "@zag-js/clipboard"
import * as collapsible from "@zag-js/collapsible"
import * as colorPicker from "@zag-js/color-picker"
import * as combobox from "@zag-js/combobox"
import * as datePicker from "@zag-js/date-picker"
import * as dialog from "@zag-js/dialog"
import * as editable from "@zag-js/editable"
import * as fileUpload from "@zag-js/file-upload"
import * as floatingPanel from "@zag-js/floating-panel"
import * as hoverCard from "@zag-js/hover-card"
import * as menu from "@zag-js/menu"
import * as navigationMenu from "@zag-js/navigation-menu"
import * as numberInput from "@zag-js/number-input"
import * as pagination from "@zag-js/pagination"
import * as pinInput from "@zag-js/pin-input"
import * as popover from "@zag-js/popover"
import * as presence from "@zag-js/presence"
import * as progress from "@zag-js/progress"
import * as qrCode from "@zag-js/qr-code"
import * as radioGroup from "@zag-js/radio-group"
import * as ratingGroup from "@zag-js/rating-group"
import * as select from "@zag-js/select"
import * as signaturePad from "@zag-js/signature-pad"
import * as slider from "@zag-js/slider"
import * as splitter from "@zag-js/splitter"
import * as steps from "@zag-js/steps"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import * as tagsInput from "@zag-js/tags-input"
import * as timePicker from "@zag-js/time-picker"
import * as timer from "@zag-js/timer"
import * as toast from "@zag-js/toast"
import * as toggleGroup from "@zag-js/toggle-group"
import * as tooltip from "@zag-js/tooltip"
import * as tour from "@zag-js/tour"
import * as treeView from "@zag-js/tree-view"
import type { Machine as ZagMachine } from "@zag-js/core"

type ComponentInfo = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ZagMachine<any>
  title: string
}

export type Component = keyof typeof componentsMap

export const componentsMap = {
  accordion: { component: accordion, title: "Accordion" },
  "angle-slider": { component: angleSlider, title: "Angle Slider" },
  avatar: { component: avatar, title: "Avatar" },
  carousel: { component: carousel, title: "Carousel" },
  checkbox: { component: checkbox, title: "Checkbox" },
  clipboard: { component: clipboard, title: "Clipboard" },
  collapsible: { component: collapsible, title: "Collapsible" },
  "color-picker": { component: colorPicker, title: "Color Picker" },
  combobox: { component: combobox, title: "Combobox" },
  "date-picker": { component: datePicker, title: "Date Picker" },
  dialog: { component: dialog, title: "Dialog" },
  editable: { component: editable, title: "Editable" },
  "file-upload": { component: fileUpload, title: "File Upload" },
  "floating-panel": { component: floatingPanel, title: "Floating Panel" },
  "hover-card": { component: hoverCard, title: "Hover Card" },
  menu: { component: menu, title: "Menu" },
  "navigation-menu": { component: navigationMenu, title: "Navigation Menu" },
  "number-input": { component: numberInput, title: "Number Input" },
  pagination: { component: pagination, title: "Pagination" },
  "pin-input": { component: pinInput, title: "Pin Input" },
  popover: { component: popover, title: "Popover" },
  presence: { component: presence, title: "Presence" },
  progress: { component: progress, title: "Progress" },
  "qr-code": { component: qrCode, title: "QR Code" },
  "radio-group": { component: radioGroup, title: "Radio Group" },
  "rating-group": { component: ratingGroup, title: "Rating Group" },
  select: { component: select, title: "Select" },
  "signature-pad": { component: signaturePad, title: "Signature Pad" },
  slider: { component: slider, title: "Slider" },
  splitter: { component: splitter, title: "Splitter" },
  steps: { component: steps, title: "Steps" },
  switch: { component: zagSwitch, title: "Switch" },
  tabs: { component: tabs, title: "Tabs" },
  "tags-input": { component: tagsInput, title: "Tags Input" },
  "time-picker": { component: timePicker, title: "Time Picker" },
  timer: { component: timer, title: "Timer" },
  toast: { component: toast, title: "Toast" },
  "toggle-group": { component: toggleGroup, title: "Toggle Group" },
  tooltip: { component: tooltip, title: "Tooltip" },
  tour: { component: tour, title: "Tour" },
  "tree-view": { component: treeView, title: "Tree View" },
} as const

export type ComponentsMap = {
  [K in Component]: ComponentInfo
}

export const settingsMap: Partial<Record<Component, Record<string, unknown>>> = {
  carousel: {
    // others
    // ...

    // required
    slideCount: 2,
  },
  toast: {
    // others
    // ...

    // required
    id: "toast",
    type: "success",
    removeDelay: 1000,
    parent: {
      // To prevent errors when toast tries to communicate with the non existent service
      send() {},
    },
  },
  "floating-panel": {
    // others
    // ...

    // required
    id: "floating-panel",
  },
}
