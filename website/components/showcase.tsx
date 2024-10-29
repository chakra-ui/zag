import { Accordion } from "./machines/accordion"
import { Avatar } from "./machines/avatar"
import { Carousel } from "./machines/carousel"
import { Checkbox } from "./machines/checkbox"
import { Clipboard } from "./machines/clipboard"
import { Collapsible } from "./machines/collapsible"
import { ColorPicker } from "./machines/color-picker"
import { Combobox } from "./machines/combobox"
import { ContextMenu } from "./machines/context-menu"
import { DatePicker } from "./machines/date-picker"
import { Dialog } from "./machines/dialog"
import { Editable } from "./machines/editable"
import { FileUpload } from "./machines/file-upload"
import { HoverCard } from "./machines/hover-card"
import { Menu } from "./machines/menu"
import { NestedMenu } from "./machines/nested-menu"
import { NumberInput } from "./machines/number-input"
import { Pagination } from "./machines/pagination"
import { PinInput } from "./machines/pin-input"
import { Popover } from "./machines/popover"
import { Presence } from "./machines/presence"
import { ProgressCircular } from "./machines/progress-circular"
import { ProgressLinear } from "./machines/progress-linear"
import { QrCode } from "./machines/qr-code"
import { Radio } from "./machines/radio"
import { RangeSlider } from "./machines/range-slider"
import { Rating } from "./machines/rating"
import { SegmentedControl } from "./machines/segmented-control"
import { Select } from "./machines/select"
import { SignaturePad } from "./machines/signature-pad"
import { Slider } from "./machines/slider"
import { Splitter } from "./machines/splitter"
import { Steps } from "./machines/steps"
import { Switch } from "./machines/switch"
import { Tabs } from "./machines/tabs"
import { TagsInput } from "./machines/tags-input"
import { TimePicker } from "./machines/time-picker"
import { TimerCountdown } from "./machines/timer-countdown"
import { ToastGroup } from "./machines/toast"
import { ToggleGroup } from "./machines/toggle-group"
import { Tooltip } from "./machines/tooltip"
import { Tour } from "./machines/tour"
import { TreeView } from "./machines/tree-view"
import { Playground } from "./playground"

const components = {
  Accordion: () => (
    <Playground
      name="accordion"
      component={Accordion}
      defaultProps={{
        collapsible: true,
        multiple: false,
      }}
    />
  ),
  Avatar: () => (
    <Playground
      name="avatar"
      component={Avatar}
      defaultProps={{
        name: "Segun Adebayo",
        src: "https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/scale-to-width-down/300?cb=20210223094656",
      }}
    />
  ),
  Carousel: () => (
    <Playground
      name="carousel"
      component={Carousel}
      defaultProps={{
        align: {
          default: "start",
          options: ["start", "center", "end"],
        },
        index: 0,
        loop: false,
        spacing: "0px",
      }}
    />
  ),
  Checkbox: () => (
    <Playground
      name="checkbox"
      component={Checkbox}
      defaultProps={{
        disabled: false,
        indeterminate: false,
      }}
    />
  ),
  Collapsible: () => (
    <Playground
      name="collapsible"
      component={Collapsible}
      defaultProps={{
        disabled: false,
        dir: { default: "ltr", options: ["ltr", "rtl"] },
      }}
    />
  ),
  ColorPicker: () => (
    <Playground
      name="color-picker"
      component={ColorPicker}
      defaultProps={{
        disabled: false,
        readOnly: false,
        closeOnSelect: false,
        format: {
          default: "rgba",
          options: ["rgba", "hsla", "hsba"],
          required: true,
        },
      }}
    />
  ),
  Combobox: () => (
    <Playground
      name="combobox"
      component={Combobox}
      defaultProps={{
        disabled: false,
        readOnly: false,
        loopFocus: false,
        inputBehavior: {
          default: "autohighlight",
          options: ["autohighlight", "autocomplete", "none"],
        },
        selectionBehavior: {
          default: "replace",
          options: ["replace", "clear", "preserve"],
        },
      }}
    />
  ),
  Dialog: () => (
    <Playground
      name="dialog"
      component={Dialog}
      defaultProps={{
        preventScroll: true,
        closeOnInteractOutside: true,
        closeOnEscape: true,
        role: { options: ["dialog", "alertdialog"], default: "dialog" },
      }}
    />
  ),
  Editable: () => (
    <Playground
      name="editable"
      component={Editable}
      defaultProps={{
        autoResize: false,
        selectOnFocus: true,
        placeholder: "Enter text...",
        activationMode: {
          options: ["focus", "click", "dblclick", "none"],
          default: "focus",
        },
        submitMode: {
          options: ["enter", "blur", "none", "both"],
          default: "enter",
        },
      }}
    />
  ),
  FileUpload: () => (
    <Playground
      name="file-upload"
      component={FileUpload}
      defaultProps={{
        disabled: false,
        allowDrop: true,
        accept: "image/png, image/jpeg",
      }}
    />
  ),
  HoverCard: () => (
    <Playground
      name="hover-card"
      component={HoverCard}
      defaultProps={{
        openDelay: 700,
        closeDelay: 300,
      }}
    />
  ),
  Menu: () => <Playground name="menu" component={Menu} />,
  ContextMenu: () => <Playground name="context-menu" component={ContextMenu} />,
  NestedMenu: () => <Playground name="nested-menu" component={NestedMenu} />,
  NumberInput: () => (
    <Playground
      name="number-input"
      component={NumberInput}
      defaultProps={{
        disabled: false,
        min: -10,
        max: 20,
        step: 1,
        allowMouseWheel: false,
      }}
    />
  ),
  Pagination: () => (
    <Playground
      name="pagination"
      component={Pagination}
      defaultProps={{
        pageSize: 10,
        siblingCount: 1,
      }}
    />
  ),
  PinInput: () => (
    <Playground
      name="pin-input"
      component={PinInput}
      defaultProps={{
        disabled: false,
        otp: false,
        type: {
          options: ["alphanumeric", "numeric", "alphabetic"],
          default: "alphanumeric",
        },
        blurOnComplete: false,
        mask: false,
      }}
    />
  ),
  LinearProgress: () => (
    <Playground
      name="progress-linear"
      component={ProgressLinear}
      defaultProps={{
        min: 0,
        max: 100,
      }}
    />
  ),
  CircularProgress: () => (
    <Playground
      name="progress-circular"
      component={ProgressCircular}
      defaultProps={{
        min: 0,
        max: 100,
      }}
    />
  ),
  Popover: () => (
    <Playground
      name="popover"
      component={Popover}
      defaultProps={{
        modal: false,
        portalled: false,
        autoFocus: true,
        closeOnBlur: true,
        closeOnEsc: true,
      }}
    />
  ),
  Radio: () => (
    <Playground
      name="radio"
      component={Radio}
      defaultProps={{
        disabled: false,
      }}
    />
  ),
  SegmentedControl: () => (
    <Playground
      name="segmented-control"
      component={SegmentedControl}
      defaultProps={{
        disabled: false,
        name: "",
      }}
    />
  ),
  RangeSlider: () => (
    <Playground
      name="range-slider"
      component={RangeSlider}
      defaultProps={{
        disabled: false,
        readOnly: false,
        dir: { default: "ltr", options: ["ltr", "rtl"] },
      }}
    />
  ),
  Rating: () => (
    <Playground
      name="rating"
      component={Rating}
      defaultProps={{
        allowHalf: true,
        disabled: false,
        readOnly: false,
        max: 5,
        dir: {
          options: ["ltr", "rtl"],
          default: "ltr",
        },
      }}
    />
  ),
  Select: () => (
    <Playground
      name="select"
      component={Select}
      defaultProps={{
        loopFocus: false,
        disabled: false,
        readOnly: false,
      }}
    />
  ),
  Slider: () => (
    <Playground
      name="slider"
      component={Slider}
      defaultProps={{
        disabled: false,
        readOnly: false,
        origin: { default: "start", options: ["start", "center"] },
        dir: { default: "ltr", options: ["ltr", "rtl"] },
      }}
    />
  ),
  Splitter: () => (
    <Playground
      name="splitter"
      component={Splitter}
      defaultProps={{
        dir: { default: "ltr", options: ["ltr", "rtl"] },
        orientation: {
          default: "horizontal",
          options: ["horizontal", "vertical"],
        },
      }}
    />
  ),
  Switch: () => (
    <Playground
      name="switch"
      component={Switch}
      defaultProps={{
        disabled: false,
      }}
    />
  ),
  Tabs: () => (
    <Playground
      name="tabs"
      component={Tabs}
      defaultProps={{
        loopFocus: false,
        activationMode: {
          default: "automatic",
          options: ["manual", "automatic"],
        },
      }}
    />
  ),
  TagsInput: () => (
    <Playground
      name="tags-input"
      component={TagsInput}
      defaultProps={{
        disabled: false,
        dir: { default: "ltr", options: ["ltr", "rtl"] },
        blurBehavior: { default: "--", options: ["add", "clear"] },
        addOnPaste: false,
      }}
    />
  ),
  TimePicker: () => (
    <Playground
      name="time-picker"
      component={TimePicker}
      defaultProps={{
        locale: {
          default: "en-US",
          options: [
            "en-US",
            "en-GB",
            "fr-FR",
            "de-DE",
            "ja-JP",
            "mk-MK",
            "zh-CN",
          ],
          required: true,
        },
        disabled: false,
        readOnly: false,
        withSeconds: false,
      }}
    />
  ),
  Toast: () => (
    <Playground
      name="toast"
      component={ToastGroup}
      defaultProps={{
        pauseOnPageIdle: false,
        max: 20,
      }}
    />
  ),
  ToggleGroup: () => (
    <Playground
      name="toggle-group"
      component={ToggleGroup}
      defaultProps={{
        disabled: false,
        multiple: true,
      }}
    />
  ),
  Tooltip: () => (
    <Playground
      name="tooltip"
      component={Tooltip}
      defaultProps={{
        closeOnPointerDown: true,
        openDelay: 1000,
        closeDelay: 500,
      }}
    />
  ),
  Clipboard: () => (
    <Playground
      name="clipboard"
      component={Clipboard}
      defaultProps={{
        value: "Hello, World!",
        timeout: 1500,
      }}
    />
  ),
  SignaturePad: () => (
    <Playground name="signature-pad" component={SignaturePad} />
  ),
  Presence: () => <Playground name="presence" component={Presence} />,
  TimerCountdown: () => (
    <Playground name="timer-countdown" component={TimerCountdown} />
  ),
  DatePicker: () => <Playground name="date-picker" component={DatePicker} />,
  QRCode: () => (
    <Playground
      name="qr-code"
      component={QrCode}
      defaultProps={{
        value: "https://github.com/chakra-ui",
      }}
    />
  ),
  Steps: () => <Playground name="steps" component={Steps} />,
  Tour: () => (
    <Playground
      name="tour"
      component={Tour}
      defaultProps={{
        closeOnInteractOutside: false,
        preventInteraction: false,
      }}
    />
  ),
  TreeView: () => (
    <Playground
      name="tree-view"
      component={TreeView}
      defaultProps={{
        expandOnClick: true,
        selectionMode: {
          default: "single",
          options: ["multiple", "single"],
        },
      }}
    />
  ),
}

export function Showcase(props: { id: keyof typeof components }) {
  const Component = components[props.id] ?? "span"
  return <Component />
}
