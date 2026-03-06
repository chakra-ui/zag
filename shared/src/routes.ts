export interface ExampleRoute {
  component: string
  componentLabel: string
  title: string
  path: `/${string}`
}

export interface ExampleNode {
  slug: string
  title: string
}

export interface ComponentRoute {
  slug: string
  label: string
  examples: ExampleNode[]
}

export const componentRoutes: ComponentRoute[] = [
  {
    slug: "cascade-select",
    label: "Cascade Select",
    examples: [{ slug: "basic", title: "Cascade Select" }],
  },
  {
    slug: "marquee",
    label: "Marquee",
    examples: [{ slug: "basic", title: "Marquee" }],
  },
  {
    slug: "image-cropper",
    label: "Image Cropper",
    examples: [
      { slug: "basic", title: "Image Cropper" },
      { slug: "circle", title: "Image Cropper (Circle)" },
      { slug: "fixed", title: "Image Cropper (Fixed Crop Area)" },
    ],
  },
  {
    slug: "drawer",
    label: "Drawer",
    examples: [
      { slug: "basic", title: "Drawer" },
      { slug: "snap-points", title: "Drawer (Snap Points)" },
      { slug: "default-active-snap-point", title: "Drawer (Active Snap Point)" },
      { slug: "indent-background", title: "Drawer (Indent Background)" },
    ],
  },
  {
    slug: "scroll-area",
    label: "Scroll Area",
    examples: [
      { slug: "basic", title: "Scroll Area" },
      { slug: "nested", title: "Scroll Area (Nested)" },
    ],
  },
  {
    slug: "async-list",
    label: "Async List",
    examples: [{ slug: "basic", title: "Async List" }],
  },
  {
    slug: "password-input",
    label: "Password Input",
    examples: [{ slug: "basic", title: "Password Input" }],
  },
  {
    slug: "listbox",
    label: "Listbox",
    examples: [
      { slug: "basic", title: "Listbox" },
      { slug: "grid", title: "Listbox (Grid)" },
      { slug: "controlled-ignore", title: "Listbox Controlled Ignore" },
      { slug: "external-value-change", title: "Listbox External Value Change" },
      { slug: "transfer", title: "Listbox Transfer" },
      { slug: "search", title: "Listbox Search" },
      { slug: "virtualized", title: "Listbox Virtualized" },
    ],
  },
  {
    slug: "navigation-menu",
    label: "Navigation Menu",
    examples: [
      { slug: "basic", title: "Navigation Menu" },
      { slug: "viewport", title: "Navigation Menu (Viewport)" },
    ],
  },
  {
    slug: "toggle",
    label: "Toggle",
    examples: [{ slug: "basic", title: "Toggle" }],
  },
  {
    slug: "angle-slider",
    label: "Angle Slider",
    examples: [{ slug: "basic", title: "Angle Slider" }],
  },
  {
    slug: "steps",
    label: "Steps",
    examples: [{ slug: "basic", title: "Steps" }],
  },
  {
    slug: "qr-code",
    label: "QR Code",
    examples: [
      { slug: "basic", title: "QR Code" },
      { slug: "download", title: "QR Code w/ Download" },
    ],
  },
  {
    slug: "signature-pad",
    label: "Signature Pad",
    examples: [{ slug: "basic", title: "Signature Pad" }],
  },
  {
    slug: "floating-panel",
    label: "Floating Panel",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled", title: "Controlled Size + Position" },
    ],
  },
  {
    slug: "tour",
    label: "Tour",
    examples: [
      { slug: "basic", title: "Tour" },
      { slug: "with-input-event", title: "Tour with Input Event" },
    ],
  },
  {
    slug: "collapsible",
    label: "Collapsible",
    examples: [
      { slug: "basic", title: "Collapsible" },
      { slug: "nested", title: "Collapsible (Nested)" },
    ],
  },
  {
    slug: "clipboard",
    label: "Clipboard",
    examples: [{ slug: "basic", title: "Clipboard" }],
  },
  {
    slug: "tree-view",
    label: "Tree View",
    examples: [
      { slug: "basic", title: "Tree View" },
      { slug: "async", title: "Tree View (Async)" },
      { slug: "checkbox", title: "Tree View (Checkbox)" },
      { slug: "rename", title: "Tree View (Rename)" },
      { slug: "filtering", title: "Tree View (Filtering)" },
      { slug: "links", title: "Tree View (Links)" },
    ],
  },
  {
    slug: "progress",
    label: "Progress",
    examples: [{ slug: "basic", title: "Progress" }],
  },
  {
    slug: "file-upload",
    label: "File Upload",
    examples: [
      { slug: "basic", title: "File Upload" },
      { slug: "cover", title: "File Upload - Cover" },
      { slug: "react-hook-form", title: "File Upload - Hook Form" },
      { slug: "transform", title: "File Upload - Transform" },
    ],
  },
  {
    slug: "presence",
    label: "Presence",
    examples: [{ slug: "basic", title: "Presence" }],
  },
  {
    slug: "avatar",
    label: "Avatar",
    examples: [{ slug: "basic", title: "Avatar" }],
  },
  {
    slug: "color-picker",
    label: "Color Picker",
    examples: [
      { slug: "basic", title: "Color Picker" },
      { slug: "inline", title: "Color Picker Inline" },
      { slug: "in-dialog", title: "Color Picker + Dialog" },
    ],
  },
  {
    slug: "switch",
    label: "Switch",
    examples: [{ slug: "basic", title: "Switch" }],
  },
  {
    slug: "carousel",
    label: "Carousel",
    examples: [
      { slug: "basic", title: "Carousel" },
      { slug: "thumbnail", title: "Carousel Thumbnail" },
    ],
  },
  {
    slug: "date-picker",
    label: "Date Picker",
    examples: [
      { slug: "basic", title: "Date Picker (Single)" },
      { slug: "range", title: "Date Picker (Range)" },
      { slug: "multi", title: "Date Picker (Multi)" },
      { slug: "inline", title: "Date Picker (Inline)" },
      { slug: "month-range", title: "Date Picker (Month + Range)" },
      { slug: "year-range", title: "Date Picker (Year + Range)" },
      { slug: "custom-calendar", title: "Date Picker (Custom Calendar)" },
      { slug: "date-time", title: "Date Picker (Date Time)" },
      { slug: "date-input-date-picker", title: "Date Input + Date Picker" },
      { slug: "month", title: "Date Picker / Month" },
      { slug: "year", title: "Date Picker / Year" },
      { slug: "format-parse", title: "Date Picker / Format + Parse" },
      { slug: "composition-min-max", title: "Date Picker / Min Max" },
      { slug: "multiple-months", title: "Date Picker / Multiple Months" },
      { slug: "composition-inline", title: "Date Picker / Inline" },
      { slug: "week-numbers", title: "Date Picker / Week Numbers" },
      { slug: "dynamic-max", title: "Date Picker / Dynamic Max" },
      { slug: "unavailable", title: "Date Picker / Unavailable" },
    ],
  },
  {
    slug: "date-input",
    label: "Date Input",
    examples: [
      { slug: "basic", title: "Date Input" },
      { slug: "range", title: "Date Input (Range)" },
    ],
  },
  {
    slug: "select",
    label: "Select",
    examples: [
      { slug: "basic", title: "Select" },
      { slug: "controlled-ignore", title: "Select Controlled Ignore" },
      { slug: "external-value-change", title: "Select External Value Change" },
      { slug: "async", title: "Select Async" },
      { slug: "combobox", title: "Select Combobox" },
      { slug: "in-dialog", title: "Select + Dialog" },
      { slug: "multiple-controlled", title: "Select Multiple Controlled" },
      { slug: "tabs", title: "Select Tabs" },
      { slug: "virtualized", title: "Select Virtualized" },
    ],
  },
  {
    slug: "accordion",
    label: "Accordion",
    examples: [{ slug: "basic", title: "Accordion" }],
  },
  {
    slug: "checkbox",
    label: "Checkbox",
    examples: [{ slug: "basic", title: "Checkbox" }],
  },
  {
    slug: "combobox",
    label: "Combobox",
    examples: [
      { slug: "basic", title: "Combobox" },
      { slug: "async", title: "Combobox Async" },
      { slug: "controlled-ignore", title: "Combobox Controlled Ignore (Bug #2954)" },
      { slug: "external-value-change", title: "Combobox External Value Change (Bug #2967)" },
      { slug: "multiple", title: "Combobox (Multiple)" },
      { slug: "cmdk", title: "Combobox + Dialog (Command K)" },
      { slug: "combo-tags", title: "Combobox + Tags Input" },
      { slug: "combo-textarea", title: "Combobox + Textarea" },
      { slug: "tabs", title: "Combobox + Tabs" },
      { slug: "custom-value", title: "Combobox Custom Value" },
      { slug: "controlled-input", title: "Combobox Controlled Input" },
      { slug: "rehydrate", title: "Combobox Rehydrate" },
      { slug: "virtualized", title: "Combobox Virtualized" },
      { slug: "emoji-picker", title: "Emoji Picker" },
    ],
  },
  {
    slug: "editable",
    label: "Editable",
    examples: [
      { slug: "basic", title: "Editable" },
      { slug: "controlled", title: "Editable Controlled" },
    ],
  },
  {
    slug: "dialog",
    label: "Dialog",
    examples: [
      { slug: "basic", title: "Dialog" },
      { slug: "cloudinary", title: "Dialog Cloudinary" },
      { slug: "controlled", title: "Dialog Controlled" },
      { slug: "datepicker", title: "Dialog + Date Picker" },
      { slug: "delayed-close", title: "Dialog Delayed Close" },
      { slug: "popover-nested", title: "Dialog Popover Nested" },
      { slug: "scroll-outside", title: "Dialog Scroll Outside" },
    ],
  },
  {
    slug: "hover-card",
    label: "Hover Card",
    examples: [
      { slug: "basic", title: "Hover Card" },
      { slug: "hovercard-in-dialog", title: "Hovercard + Dialog" },
    ],
  },
  {
    slug: "menu",
    label: "Menu",
    examples: [
      { slug: "basic", title: "Menu" },
      { slug: "overflow", title: "Menu Overflow" },
      { slug: "nested", title: "Menu Nested" },
      { slug: "options", title: "Menu With options" },
      { slug: "combobox", title: "Menu + Combobox" },
      { slug: "in-dialog", title: "Menu + Dialog" },
      { slug: "lazy-mounted", title: "Menu Lazy Mounted" },
      { slug: "links", title: "Menu Links" },
      { slug: "multiple-controlled", title: "Menu Multiple Controlled" },
      { slug: "multiple-nested", title: "Menu Multiple Nested" },
    ],
  },
  {
    slug: "context-menu",
    label: "Context Menu",
    examples: [{ slug: "basic", title: "Context Menu" }],
  },
  {
    slug: "number-input",
    label: "Number Input",
    examples: [
      { slug: "basic", title: "Number Input" },
      { slug: "wrapped", title: "Number Input - Wrapped" },
    ],
  },
  {
    slug: "pagination",
    label: "Pagination",
    examples: [{ slug: "basic", title: "Pagination" }],
  },
  {
    slug: "pin-input",
    label: "Pin Input",
    examples: [{ slug: "basic", title: "Pin Input" }],
  },
  {
    slug: "popper",
    label: "Popper",
    examples: [{ slug: "basic", title: "Popper" }],
  },
  {
    slug: "popover",
    label: "Popover",
    examples: [
      { slug: "basic", title: "Popover" },
      { slug: "composition-controlled", title: "Popover Controlled" },
      { slug: "in-dialog", title: "Popover + Dialog" },
      { slug: "multiple-controlled", title: "Popover Multiple Controlled" },
      { slug: "selection", title: "Popover Selection" },
      { slug: "responsive", title: "Popover Responsive" },
      { slug: "tooltip", title: "Popover Tooltip" },
    ],
  },
  {
    slug: "radio-group",
    label: "Radio Group",
    examples: [{ slug: "basic", title: "Radio Group" }],
  },
  {
    slug: "range-slider",
    label: "Range Slider",
    examples: [{ slug: "basic", title: "Range Slider" }],
  },
  {
    slug: "rating-group",
    label: "Rating Group",
    examples: [{ slug: "basic", title: "Rating Group" }],
  },
  {
    slug: "slider",
    label: "Slider",
    examples: [
      { slug: "basic", title: "Slider" },
      { slug: "change-end", title: "Slider Change End" },
      { slug: "number-input", title: "Slider + Number Input" },
      { slug: "in-popover", title: "Slider + Popover" },
      { slug: "tooltip", title: "Slider + Tooltip" },
    ],
  },
  {
    slug: "tabs",
    label: "Tabs",
    examples: [
      { slug: "basic", title: "Tabs" },
      { slug: "with-link", title: "Tabs w/ Links" },
    ],
  },
  {
    slug: "tags-input",
    label: "Tags Input",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "validate", title: "Custom Validate" },
      { slug: "allow-duplicates", title: "Allow Duplicates" },
      { slug: "sentence-builder", title: "Sentence Builder" },
    ],
  },
  {
    slug: "timer",
    label: "Timer",
    examples: [
      { slug: "countdown", title: "Timer (CountDown)" },
      { slug: "stopwatch", title: "Timer (StopWatch)" },
    ],
  },
  {
    slug: "toast",
    label: "Toast",
    examples: [
      { slug: "stacked", title: "Toast (Stacked)" },
      { slug: "overlap", title: "Toast (Overlap)" },
    ],
  },
  {
    slug: "toggle-group",
    label: "Toggle Group",
    examples: [{ slug: "basic", title: "Toggle Group" }],
  },
  {
    slug: "tooltip",
    label: "Tooltip",
    examples: [
      { slug: "basic", title: "Tooltip" },
      { slug: "dialog", title: "Tooltip + Dialog" },
      { slug: "follow-cursor", title: "Tooltip Follow Cursor" },
    ],
  },
  {
    slug: "segment-control",
    label: "Segment Control",
    examples: [{ slug: "basic", title: "Segment Control" }],
  },
  {
    slug: "splitter",
    label: "Splitter",
    examples: [{ slug: "basic", title: "Splitter" }],
  },
  {
    slug: "json-tree",
    label: "JSON Tree",
    examples: [{ slug: "basic", title: "JSON Tree" }],
  },
]

export const exampleRoutes: ExampleRoute[] = componentRoutes.flatMap((componentRoute) =>
  componentRoute.examples.map((example) => ({
    component: componentRoute.slug,
    componentLabel: componentRoute.label,
    title: example.title,
    path: `/${componentRoute.slug}/${example.slug}` as `/${string}`,
  })),
)

const componentsMap = new Map(
  componentRoutes.map((component) => [component.slug, { slug: component.slug, label: component.label }]),
)

export const componentRoutesData = Array.from(componentsMap.values()).sort((a, b) => a.label.localeCompare(b.label))

export function getComponentExamples(component: string): ExampleRoute[] {
  return exampleRoutes.filter((route) => route.component === component).sort((a, b) => a.title.localeCompare(b.title))
}

const componentByPath = new Map<string, string>()
for (const route of exampleRoutes) {
  componentByPath.set(route.path, route.component)
}

export function getComponentByPath(path: string): string | null {
  return componentByPath.get(path) ?? null
}

export function isKnownComponent(component: string): boolean {
  return componentsMap.has(component)
}

type RouteData = {
  path: `/${string}`
  label: string
}

export const routesData: RouteData[] = exampleRoutes.map((route) => ({ label: route.title, path: route.path }))
