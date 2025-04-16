import { AiOutlineCompass, AiOutlineBook } from "react-icons/ai"
import { HiOutlineViewGrid } from "react-icons/hi"
import { IconType } from "react-icons/lib"

interface CategoryItem {
  type: "category"
  icon?: IconType
  id: string
  label: string
  collapsible?: boolean
  collapsed?: boolean
  items: SidebarItem[]
}

interface DocItem {
  type: "doc"
  id: string
  label: string
  new?: boolean
  beta?: boolean
  href?: string
}

interface LinkItem {
  type: "link"
  id: string
  label: string
  href: string
}

type SidebarItem = CategoryItem | DocItem | LinkItem

const sidebar: Record<"docs", SidebarItem[]> = {
  docs: [
    {
      type: "category",
      label: "Overview",
      icon: AiOutlineCompass,
      id: "overview",
      items: [
        { type: "doc", label: "Introduction", id: "introduction" },
        { type: "doc", label: "Installation", id: "installation" },
        { type: "doc", label: "State machine", id: "whats-a-machine" },
        { type: "doc", label: "FAQ", id: "faq" },
        {
          type: "doc",
          label: "Changelog",
          id: "changelogs",
          href: "https://github.com/chakra-ui/zag/blob/main/CHANGELOG.md",
        },
        { type: "doc", label: "LLMs.txt", id: "llms-txt" },
      ],
    },
    {
      type: "category",
      label: "Guides",
      icon: AiOutlineBook,
      id: "guides",
      items: [
        { type: "doc", label: "Styling", id: "styling" },
        { type: "doc", label: "Composition", id: "composition" },
        { type: "doc", label: "Collection", id: "collection" },
        {
          type: "doc",
          label: "Programmatic Control",
          id: "programmatic-control",
        },
        { type: "doc", label: "Migration", id: "migration" },
      ],
    },
    {
      type: "category",
      label: "Components",
      icon: HiOutlineViewGrid,
      id: "components",
      items: [
        { type: "doc", label: "Accordion", id: "accordion" },
        { type: "doc", label: "Angle Slider", id: "angle-slider" },
        { type: "doc", label: "Avatar", id: "avatar" },
        { type: "doc", label: "Carousel", id: "carousel", beta: true },
        { type: "doc", label: "Checkbox", id: "checkbox" },
        { type: "doc", label: "Clipboard", id: "clipboard" },
        { type: "doc", label: "Collapsible", id: "collapsible" },
        { type: "doc", label: "ColorPicker", id: "color-picker" },
        { type: "doc", label: "Combobox", id: "combobox" },
        { type: "doc", label: "Date Picker", id: "date-picker" },
        { type: "doc", label: "Dialog", id: "dialog" },
        { type: "doc", label: "Editable", id: "editable" },
        { type: "doc", label: "File Upload", id: "file-upload" },
        {
          type: "doc",
          label: "Floating Panel",
          id: "floating-panel",
          beta: true,
        },
        { type: "doc", label: "Hover Card", id: "hover-card" },
        { type: "doc", label: "Listbox", id: "listbox", beta: true },
        { type: "doc", label: "Menu", id: "menu" },
        { type: "doc", label: "Context Menu", id: "context-menu" },
        { type: "doc", label: "Nested Menu", id: "nested-menu" },
        { type: "doc", label: "Number Input", id: "number-input" },
        { type: "doc", label: "Pagination", id: "pagination" },
        { type: "doc", label: "Pin Input", id: "pin-input" },
        { type: "doc", label: "Popover", id: "popover" },
        { type: "doc", label: "Presence", id: "presence" },
        {
          type: "doc",
          label: "Progress - Linear",
          id: "linear-progress",
        },
        {
          type: "doc",
          label: "Progress - Circular",
          id: "circular-progress",
        },
        { type: "doc", label: "QR Code", id: "qr-code" },
        { type: "doc", label: "Radio Group", id: "radio-group" },
        { type: "doc", label: "Range Slider", id: "range-slider" },
        { type: "doc", label: "Rating Group", id: "rating-group" },
        { type: "doc", label: "Segmented Control", id: "segmented-control" },
        { type: "doc", label: "Select", id: "select" },
        { type: "doc", label: "Signature Pad", id: "signature-pad" },
        { type: "doc", label: "Slider", id: "slider" },
        { type: "doc", label: "Splitter", id: "splitter" },
        { type: "doc", label: "Steps", id: "steps" },
        { type: "doc", label: "Switch", id: "switch" },
        { type: "doc", label: "Tabs", id: "tabs" },
        { type: "doc", label: "Tags Input", id: "tags-input" },
        // { type: "doc", label: "Time picker", id: "time-picker", beta: true },
        { type: "doc", label: "Timer", id: "timer" },
        { type: "doc", label: "Toast", id: "toast" },
        { type: "doc", label: "Toggle Group", id: "toggle-group" },
        { type: "doc", label: "Tooltip", id: "tooltip" },
        { type: "doc", label: "Tour", id: "tour", beta: true },
        { type: "doc", label: "Tree View", id: "tree-view", beta: true },
      ],
    },
  ],
}

export default sidebar
