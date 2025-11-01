import { Accordion } from "./accordion"
import { AngleSlider } from "./angle-slider"
import { Avatar } from "./avatar"
import { Carousel } from "./carousel"
import { Checkbox } from "./checkbox"
import { Clipboard } from "./clipboard"
import { Collapsible } from "./collapsible"
import { ColorPicker } from "./color-picker"
import { Combobox } from "./combobox"
import { ContextMenu } from "./context-menu"
import { DatePicker } from "./date-picker"
import { Dialog } from "./dialog"
import { Editable } from "./editable"
import { FileUpload } from "./file-upload"
import { HoverCard } from "./hover-card"
import { ImageCropper } from "./image-cropper"
import { Menu } from "./menu"
import { NestedMenu } from "./nested-menu"
import { NumberInput } from "./number-input"
import { Pagination } from "./pagination"
import { PinInput } from "./pin-input"
import { Popover } from "./popover"
import { Presence } from "./presence"
import { ProgressCircular } from "./progress-circular"
import { ProgressLinear } from "./progress-linear"
import { QrCode } from "./qr-code"
import { Radio } from "./radio"
import { RangeSlider } from "./range-slider"
import { Rating } from "./rating"
import { ScrollArea } from "./scroll-area"
import { SegmentedControl } from "./segmented-control"
import { Select } from "./select"
import { SignaturePad } from "./signature-pad"
import { Slider } from "./slider"
import { Splitter } from "./splitter"
import { Steps } from "./steps"
import { Switch } from "./switch"
import { Tabs } from "./tabs"
import { TagsInput } from "./tags-input"

import { TimerCountdown } from "./timer-countdown"
import { ToastGroup } from "./toast"
import { ToggleGroup } from "./toggle-group"
import { Tooltip } from "./tooltip"
import { Tour } from "./tour"
import { TreeView } from "./tree-view"
import { Listbox } from "./listbox"
import { Playground } from "../components/playground"
import { FloatingPanel } from "./floating-panel"
import { PasswordInput } from "./password-input"
import { BottomSheet } from "./bottom-sheet"
import { Marquee } from "./marquee"

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
  AngleSlider: () => (
    <Playground
      name="angle-slider"
      component={AngleSlider}
      defaultProps={{
        disabled: false,
        readOnly: false,
        step: 1,
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
  BottomSheet: () => (
    <Playground name="bottom-sheet" component={BottomSheet} defaultProps={{}} />
  ),
  Carousel: () => (
    <Playground
      name="carousel"
      component={Carousel}
      defaultProps={{
        slidesPerPage: 1,
        loop: false,
        spacing: "0px",
        allowMouseDrag: false,
        orientation: {
          default: "horizontal",
          options: ["horizontal", "vertical"],
          required: true,
        },
      }}
    />
  ),
  Checkbox: () => (
    <Playground
      name="checkbox"
      component={Checkbox}
      defaultProps={{
        disabled: false,
        invalid: false,
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
          default: "hsla",
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
  ImageCropper: () => (
    <Playground
      name="image-cropper"
      component={ImageCropper}
      defaultProps={{}}
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
        closeOnInteractOutside: true,
        closeOnEscape: true,
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
        orientation: {
          default: "horizontal",
          options: ["horizontal", "vertical"],
        },
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
        count: 5,
        dir: {
          options: ["ltr", "rtl"],
          default: "ltr",
        },
      }}
    />
  ),
  ScrollArea: () => <Playground name="scroll-area" component={ScrollArea} />,
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
        blurBehavior: { default: undefined, options: ["add", "clear"] },
        addOnPaste: false,
      }}
    />
  ),

  Toast: () => <Playground name="toast" component={ToastGroup} />,
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
  Listbox: () => (
    <Playground
      name="listbox"
      component={Listbox}
      defaultProps={{
        disabled: false,
        selectionMode: {
          default: "single",
          options: ["single", "multiple", "extended"],
        },
      }}
    />
  ),
  FloatingPanel: () => (
    <Playground
      name="floating-panel"
      component={FloatingPanel}
      defaultProps={{
        resizable: true,
        draggable: true,
        disabled: false,
        lockAspectRatio: false,
      }}
    />
  ),
  PasswordInput: () => (
    <Playground
      name="password-input"
      component={PasswordInput}
      defaultProps={{
        disabled: false,
        ignorePasswordManagers: true,
      }}
    />
  ),
  Marquee: () => (
    <Playground
      name="marquee"
      component={Marquee}
      defaultProps={{
        side: {
          default: "start",
          options: ["start", "end", "top", "bottom"],
        },
        speed: 100,
        pauseOnInteraction: false,
      }}
    />
  ),
}

export function Showcase(props: { id: keyof typeof components }) {
  const Component = components[props.id] ?? "span"
  return <Component />
}
