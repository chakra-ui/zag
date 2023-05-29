import { Checkbox } from "./machines/checkbox"
import { Radio } from "./machines/radio"
import { Accordion } from "./machines/accordion"
import { Dialog } from "./machines/dialog"
import { Editable } from "./machines/editable"
import { Menu } from "./machines/menu"
import { NumberInput } from "./machines/number-input"
import { PinInput } from "./machines/pin-input"
import { Popover } from "./machines/popover"
import { RangeSlider } from "./machines/range-slider"
import { Slider } from "./machines/slider"
import { Tabs } from "./machines/tabs"
import { TagsInput } from "./machines/tags-input"
import { ToastGroup } from "./machines/toast"
import { Tooltip } from "./machines/tooltip"
import { Playground } from "./playground"
import { Rating } from "components/machines/rating"
import { Pressable } from "components/machines/pressable"
import { ContextMenu } from "components/machines/context-menu"
import { NestedMenu } from "components/machines/nested-menu"
import { HoverCard } from "components/machines/hover-card"
import { Pagination } from "components/machines/pagination"
import { Select } from "./machines/select"
import { Combobox } from "components/machines/combobox"
import { Switch } from "components/machines/switch"
import { SegmentedControl } from "components/machines/segmented-control"

const components = {
  Dialog: () => (
    <Playground
      component={Dialog}
      defaultProps={{
        preventScroll: true,
        closeOnOutsideClick: true,
        closeOnEsc: true,
        role: { options: ["dialog", "alertdialog"], default: "dialog" },
      }}
    />
  ),
  Checkbox: () => (
    <Playground
      component={Checkbox}
      defaultProps={{
        indeterminate: false,
        disabled: false,
        readOnly: false,
      }}
    />
  ),
  Combobox: () => (
    <Playground
      component={Combobox}
      defaultProps={{
        disabled: false,
        readOnly: false,
        blurOnSelect: false,
        loop: false,
        inputBehavior: {
          default: "autohighlight",
          options: ["autohighlight", "autocomplete", "none"],
        },
      }}
    />
  ),
  Radio: () => (
    <Playground
      component={Radio}
      defaultProps={{
        disabled: false,
        readOnly: false,
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
  Pagination: () => (
    <Playground
      component={Pagination}
      defaultProps={{
        pageSize: 10,
        siblingCount: 1,
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
  Accordion: () => (
    <Playground
      component={Accordion}
      defaultProps={{
        collapsible: true,
        multiple: false,
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
  Pressable: () => (
    <Playground
      component={Pressable}
      defaultProps={{
        disabled: false,
        preventFocusOnPress: false,
        cancelOnPointerExit: false,
        allowTextSelectionOnPress: false,
      }}
    />
  ),
  NumberInput: () => (
    <Playground
      component={NumberInput}
      defaultProps={{
        disabled: false,
        minFractionDigits: 0,
        maxFractionDigits: 5,
        min: -10,
        max: 20,
        step: 1,
        allowMouseWheel: false,
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
  Menu: () => <Playground component={Menu} />,
  ContextMenu: () => <Playground component={ContextMenu} />,
  NestedMenu: () => <Playground component={NestedMenu} />,
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
  Toast: () => (
    <Playground
      component={ToastGroup}
      defaultProps={{
        pauseOnPageIdle: false,
        pauseOnInteraction: true,
      }}
    />
  ),
  Select: () => (
    <Playground
      component={Select}
      defaultProps={{
        loop: false,
        selectOnTab: false,
        disabled: false,
        readOnly: false,
      }}
    />
  ),
  SegmentedControl: () => (
    <Playground
      component={SegmentedControl}
      defaultProps={{
        disabled: false,
        readOnly: false,
      }}
    />
  ),
}

export function Showcase(props: { id: keyof typeof components }) {
  const Component = components[props.id] ?? "span"
  return <Component />
}
