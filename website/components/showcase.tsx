import { Accordion } from "./machines/accordion"
import { Avatar } from "./machines/avatar"
import { Checkbox } from "./machines/checkbox"
import { CircularProgress } from "./machines/circular-progress"
import { ColorPicker } from "./machines/color-picker"
import { Combobox } from "./machines/combobox"
import { ContextMenu } from "./machines/context-menu"
import { Dialog } from "./machines/dialog"
import { Editable } from "./machines/editable"
import { FileUpload } from "./machines/file-upload"
import { HoverCard } from "./machines/hover-card"
import { LinearProgress } from "./machines/linear-progress"
import { Menu } from "./machines/menu"
import { NestedMenu } from "./machines/nested-menu"
import { NumberInput } from "./machines/number-input"
import { Pagination } from "./machines/pagination"
import { PinInput } from "./machines/pin-input"
import { Popover } from "./machines/popover"
import { Radio } from "./machines/radio"
import { RangeSlider } from "./machines/range-slider"
import { Rating } from "./machines/rating"
import { SegmentedControl } from "./machines/segmented-control"
import { Select } from "./machines/select"
import { Slider } from "./machines/slider"
import { Switch } from "./machines/switch"
import { Tabs } from "./machines/tabs"
import { TagsInput } from "./machines/tags-input"
import { ToastGroup } from "./machines/toast"
import { ToggleGroup } from "./machines/toggle-group"
import { Tooltip } from "./machines/tooltip"
import { Playground } from "./playground"

const components = {
  Accordion: () => (
    <Playground
      component={Accordion}
      defaultProps={{
        collapsible: true,
        multiple: false,
      }}
    />
  ),
  Avatar: () => (
    <Playground
      component={Avatar}
      defaultProps={{
        name: "Segun Adebayo",
        src: "https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/scale-to-width-down/300?cb=20210223094656",
      }}
    />
  ),
  Checkbox: () => (
    <Playground
      component={Checkbox}
      defaultProps={{
        disabled: false,
      }}
    />
  ),
  ColorPicker: () => (
    <Playground
      component={ColorPicker}
      defaultProps={{
        disabled: false,
        readOnly: false,
        closeOnSelect: false,
      }}
    />
  ),
  Combobox: () => (
    <Playground
      component={Combobox}
      defaultProps={{
        disabled: false,
        readOnly: false,
        loop: false,
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
      component={Dialog}
      defaultProps={{
        preventScroll: true,
        closeOnInteractOutside: true,
        closeOnEscapeKeyDown: true,
        role: { options: ["dialog", "alertdialog"], default: "dialog" },
      }}
    />
  ),
  Editable: () => (
    <Playground
      component={Editable}
      defaultProps={{
        autoResize: false,
        selectOnFocus: true,
        placeholder: "Enter text...",
        activationMode: {
          options: ["focus", "dblclick", "none"],
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
      component={HoverCard}
      defaultProps={{
        openDelay: 700,
        closeDelay: 300,
      }}
    />
  ),
  Menu: () => <Playground component={Menu} />,
  ContextMenu: () => <Playground component={ContextMenu} />,
  NestedMenu: () => <Playground component={NestedMenu} />,
  NumberInput: () => (
    <Playground
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
      component={Pagination}
      defaultProps={{
        pageSize: 10,
        siblingCount: 1,
      }}
    />
  ),
  PinInput: () => (
    <Playground
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
      component={LinearProgress}
      defaultProps={{
        min: 0,
        max: 100,
      }}
    />
  ),
  CircularProgress: () => (
    <Playground
      component={CircularProgress}
      defaultProps={{
        min: 0,
        max: 100,
      }}
    />
  ),
  Popover: () => (
    <Playground
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
      component={Radio}
      defaultProps={{
        disabled: false,
      }}
    />
  ),
  SegmentedControl: () => (
    <Playground
      component={SegmentedControl}
      defaultProps={{
        disabled: false,
        name: "",
      }}
    />
  ),
  RangeSlider: () => (
    <Playground
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
      component={Select}
      defaultProps={{
        loop: false,
        selectOnBlur: false,
        disabled: false,
        readOnly: false,
      }}
    />
  ),
  Slider: () => (
    <Playground
      component={Slider}
      defaultProps={{
        disabled: false,
        readOnly: false,
        origin: { default: "start", options: ["start", "center"] },
        dir: { default: "ltr", options: ["ltr", "rtl"] },
      }}
    />
  ),
  Switch: () => (
    <Playground
      component={Switch}
      defaultProps={{
        disabled: false,
        readOnly: false,
      }}
    />
  ),
  Tabs: () => (
    <Playground
      component={Tabs}
      defaultProps={{
        loop: false,
        activationMode: {
          default: "automatic",
          options: ["manual", "automatic"],
        },
      }}
    />
  ),
  TagsInput: () => (
    <Playground
      component={TagsInput}
      defaultProps={{
        disabled: false,
        dir: { default: "ltr", options: ["ltr", "rtl"] },
        blurBehavior: { default: "--", options: ["add", "clear"] },
        addOnPaste: false,
      }}
    />
  ),
  Toast: () => (
    <Playground
      component={ToastGroup}
      defaultProps={{
        pauseOnPageIdle: false,
        pauseOnInteraction: true,
      }}
    />
  ),
  ToggleGroup: () => (
    <Playground
      component={ToggleGroup}
      defaultProps={{
        disabled: false,
        multiple: true,
      }}
    />
  ),
  Tooltip: () => (
    <Playground
      component={Tooltip}
      defaultProps={{
        closeOnPointerDown: true,
        openDelay: 1000,
        closeDelay: 500,
      }}
    />
  ),
}

export function Showcase(props: { id: keyof typeof components }) {
  const Component = components[props.id] ?? "span"
  return <Component />
}
