import type { IconType } from "react-icons/lib"
import { LuBlocks, LuBookOpen, LuCompass, LuWrench } from "react-icons/lu"
import siteConfig from "site.config"

/** The URL section a page lives under: `/{section}/...` */
export type Section = "overview" | "guides" | "components" | "utilities"

export interface SidebarDoc {
  id: string
  label: string
  section: Section
  new?: boolean
  beta?: boolean
  /** external link instead of a docs page */
  href?: string
}

export interface SidebarGroup {
  label: string
  items: SidebarDoc[]
}

export interface SidebarTab {
  id: string
  label: string
  icon: IconType
  groups: SidebarGroup[]
}

const docs = (section: Section, items: Omit<SidebarDoc, "section">[]) =>
  items.map((item) => ({ ...item, section }))

export const tabs: SidebarTab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LuCompass,
    groups: [
      {
        label: "Get Started",
        items: docs("overview", [
          { label: "Introduction", id: "introduction" },
          { label: "Installation", id: "installation" },
          { label: "FAQ", id: "faq" },
          {
            label: "Changelog",
            id: "changelogs",
            href: `${siteConfig.repo.blobUrl}/CHANGELOG.md`,
          },
          { label: "LLMs.txt", id: "llms-txt" },
        ]),
      },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    icon: LuBookOpen,
    groups: [
      {
        label: "Guides",
        items: docs("guides", [
          { label: "Styling", id: "styling" },
          { label: "Composition", id: "composition" },
          { label: "Collection", id: "collection" },
          { label: "Programmatic Control", id: "programmatic-control" },
          { label: "Building Machines", id: "building-machines" },
          { label: "Framework Adapters", id: "framework-adapters" },
          { label: "Migration", id: "migration" },
        ]),
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    icon: LuBlocks,
    groups: [
      {
        label: "Forms & Inputs",
        items: docs("components", [
          { label: "Angle Slider", id: "angle-slider" },
          { label: "Cascade Select", id: "cascade-select" },
          { label: "Checkbox", id: "checkbox" },
          { label: "Color Picker", id: "color-picker" },
          { label: "Combobox", id: "combobox" },
          { label: "Date Input", id: "date-input" },
          { label: "Date Picker", id: "date-picker" },
          { label: "Editable", id: "editable" },
          { label: "Field", id: "field" },
          { label: "Fieldset", id: "fieldset" },
          { label: "File Upload", id: "file-upload" },
          { label: "Image Cropper", id: "image-cropper" },
          { label: "Listbox", id: "listbox" },
          { label: "Number Input", id: "number-input" },
          { label: "Password Input", id: "password-input" },
          { label: "Pin Input", id: "pin-input" },
          { label: "Radio Group", id: "radio-group" },
          { label: "Rating Group", id: "rating-group" },
          { label: "Segmented Control", id: "segmented-control" },
          { label: "Select", id: "select" },
          { label: "Signature Pad", id: "signature-pad" },
          { label: "Slider", id: "slider" },
          { label: "Slider (Range)", id: "range-slider" },
          { label: "Switch", id: "switch" },
          { label: "Tags Input", id: "tags-input" },
          { label: "Toggle", id: "toggle" },
          { label: "Toggle Group", id: "toggle-group" },
        ]),
      },
      {
        label: "Data Display",
        items: docs("components", [
          { label: "Avatar", id: "avatar" },
          { label: "Carousel", id: "carousel" },
          { label: "Clipboard", id: "clipboard" },
          { label: "Marquee", id: "marquee" },
          { label: "Meter", id: "meter" },
          { label: "Number Flow", id: "number-flow" },
          { label: "QR Code", id: "qr-code" },
          { label: "Scroll Area", id: "scroll-area" },
          { label: "Splitter", id: "splitter" },
          { label: "Timer", id: "timer" },
        ]),
      },
      {
        label: "Overlays",
        items: docs("components", [
          { label: "Context Menu", id: "context-menu" },
          { label: "Dialog", id: "dialog" },
          { label: "Drawer", id: "drawer" },
          { label: "Floating Panel", id: "floating-panel" },
          { label: "Hover Card", id: "hover-card" },
          { label: "Menu", id: "menu" },
          { label: "Menu (Nested)", id: "nested-menu" },
          { label: "Popover", id: "popover" },
          { label: "Tooltip", id: "tooltip" },
          { label: "Tour", id: "tour" },
        ]),
      },
      {
        label: "Navigation",
        items: docs("components", [
          { label: "Accordion", id: "accordion" },
          { label: "Collapsible", id: "collapsible" },
          { label: "Menubar", id: "menubar" },
          { label: "Navigation Menu", id: "navigation-menu" },
          { label: "Pagination", id: "pagination" },
          { label: "Steps", id: "steps" },
          { label: "Tabs", id: "tabs" },
          { label: "Tree View", id: "tree-view" },
        ]),
      },
      {
        label: "Feedback",
        items: docs("components", [
          { label: "Progress (Circular)", id: "circular-progress" },
          { label: "Progress (Linear)", id: "linear-progress" },
          { label: "Toast", id: "toast" },
        ]),
      },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: LuWrench,
    groups: [
      {
        label: "Utilities",
        items: [
          ...docs("utilities", [
            { label: "Async List", id: "async-list" },
            { label: "Drag and Drop", id: "dnd" },
            { label: "Focus Trap", id: "focus-trap" },
            { label: "Hotkeys", id: "hotkeys" },
            { label: "Infinite Scroll", id: "infinite-scroll" },
          ]),
          // a building block for the others, so it sits here; its URL stays under /components
          ...docs("components", [{ label: "Presence", id: "presence" }]),
          ...docs("utilities", [{ label: "Virtualizer", id: "virtualizer" }]),
        ],
      },
    ],
  },
]

const sectionLabels: Record<Section, string> = {
  overview: "Overview",
  guides: "Guides",
  components: "Components",
  utilities: "Utilities",
}

/** Every page grouped by URL section, in sidebar order. Used by the llms.txt routes. */
const sidebar = {
  docs: (Object.keys(sectionLabels) as Section[]).map((section) => ({
    type: "category" as const,
    id: section,
    label: sectionLabels[section],
    items: tabs
      .flatMap((tab) => tab.groups.flatMap((group) => group.items))
      .filter((item) => item.section === section)
      .map((item) => ({ type: "doc" as const, ...item })),
  })),
}

export default sidebar
