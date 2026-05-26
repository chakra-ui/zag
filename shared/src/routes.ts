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
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "marquee",
    label: "Marquee",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "image-cropper",
    label: "Image Cropper",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "circle", title: "Circle" },
      { slug: "fixed", title: "Fixed Crop Area" },
    ],
  },
  {
    slug: "drawer",
    label: "Drawer",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "snap-points", title: "Snap Points" },
      { slug: "active-snap-point", title: "Active Snap Point" },
      { slug: "indent-effect", title: "Indent Effect" },
      { slug: "swipe-area", title: "Swipe Area" },
      { slug: "cross-axis-scroll", title: "Cross-Axis Scroll" },
      { slug: "range-input", title: "Range Input" },
      { slug: "action-sheet", title: "Action Sheet" },
      { slug: "controlled", title: "Controlled" },
      { slug: "mobile-nav", title: "Mobile Nav" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
      { slug: "nested", title: "Nested" },
      { slug: "non-modal", title: "Non-Modal" },
    ],
  },
  {
    slug: "scroll-area",
    label: "Scroll Area",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "nested", title: "Nested" },
      { slug: "column-reverse", title: "Column Reverse" },
    ],
  },
  {
    slug: "async-list",
    label: "Async List",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "password-input",
    label: "Password Input",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "listbox",
    label: "Listbox",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "grid", title: "Grid" },
      { slug: "controlled-ignore", title: "Controlled Ignore" },
      { slug: "external-value-change", title: "External Value Change" },
      { slug: "transfer", title: "Transfer" },
      { slug: "search", title: "Search" },
      { slug: "virtualized", title: "Virtualized" },
    ],
  },
  {
    slug: "navigation-menu",
    label: "Navigation Menu",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "viewport", title: "Viewport" },
    ],
  },
  {
    slug: "toggle",
    label: "Toggle",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "angle-slider",
    label: "Angle Slider",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "steps",
    label: "Steps",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "qr-code",
    label: "QR Code",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "download", title: "Download" },
    ],
  },
  {
    slug: "signature-pad",
    label: "Signature Pad",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "floating-panel",
    label: "Floating Panel",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled", title: "Controlled" },
      { slug: "focus-trap", title: "Focus Trap" },
      { slug: "popover-inside", title: "Popover Inside" },
    ],
  },
  {
    slug: "tour",
    label: "Tour",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "wait-step", title: "Wait Step" },
      { slug: "wait-for-input-event", title: "Wait for Input" },
      { slug: "step-types", title: "Step Types" },
      { slug: "conditional", title: "Conditional" },
    ],
  },
  {
    slug: "collapsible",
    label: "Collapsible",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "nested", title: "Nested" },
    ],
  },
  {
    slug: "clipboard",
    label: "Clipboard",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "tree-view",
    label: "Tree View",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "async", title: "Async" },
      { slug: "checkbox", title: "Checkbox" },
      { slug: "rename", title: "Rename" },
      { slug: "filtering", title: "Filtering" },
      { slug: "links", title: "Links" },
    ],
  },
  {
    slug: "progress",
    label: "Progress",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "file-upload",
    label: "File Upload",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "with-rejections", title: "Multiple + Rejections" },
      { slug: "cover", title: "Cover" },
      { slug: "react-hook-form", title: "Hook Form" },
      { slug: "transform", title: "Transform" },
    ],
  },
  {
    slug: "presence",
    label: "Presence",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "avatar",
    label: "Avatar",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "color-picker",
    label: "Color Picker",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "inline", title: "Inline" },
      { slug: "in-dialog", title: "Dialog" },
    ],
  },
  {
    slug: "switch",
    label: "Switch",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "carousel",
    label: "Carousel",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "thumbnail", title: "Thumbnail" },
      { slug: "dialog", title: "With Dialog" },
    ],
  },
  {
    slug: "date-picker",
    label: "Date Picker",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "range", title: "Range" },
      { slug: "range-calendar", title: "Range calendar" },
      { slug: "multi", title: "Multi" },
      { slug: "inline", title: "Inline" },
      { slug: "month-range", title: "Month + Range" },
      { slug: "year-range", title: "Year + Range" },
      { slug: "custom-calendar", title: "Custom Calendar" },
      { slug: "date-time", title: "Date Time" },
      { slug: "date-input-date-picker", title: "Date Input" },
      { slug: "month", title: "Month" },
      { slug: "year", title: "Year" },
      { slug: "format-parse", title: "Format + Parse" },
      { slug: "composition-min-max", title: "Min Max" },
      { slug: "multiple-months", title: "Multiple Months" },
      { slug: "composition-inline", title: "Inline" },
      { slug: "week-numbers", title: "Week Numbers" },
      { slug: "dynamic-max", title: "Dynamic Max" },
      { slug: "unavailable", title: "Unavailable" },
    ],
  },
  {
    slug: "date-input",
    label: "Date Input",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled", title: "Controlled" },
      { slug: "time-only", title: "Time Only" },
      { slug: "time-only-controlled", title: "Time Only (Controlled)" },
      { slug: "timezone", title: "Timezone" },
      { slug: "hour-cycle", title: "Hour Cycle" },
      { slug: "min-max", title: "Min Max" },
      { slug: "range", title: "Range" },
      { slug: "custom-calendar", title: "Custom Calendar" },
    ],
  },
  {
    slug: "select",
    label: "Select",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled-ignore", title: "Controlled Ignore" },
      { slug: "external-value-change", title: "External Value Change" },
      { slug: "async", title: "Async" },
      { slug: "combobox", title: "With Combobox" },
      { slug: "in-dialog", title: "Dialog" },
      { slug: "in-popover", title: "Popover" },
      { slug: "multiple-controlled", title: "Multiple Controlled" },
      { slug: "tabs", title: "Tabs" },
      { slug: "virtualized", title: "Virtualized" },
    ],
  },
  {
    slug: "accordion",
    label: "Accordion",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "checkbox",
    label: "Checkbox",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "combobox",
    label: "Combobox",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "async", title: "Async" },
      { slug: "controlled-ignore", title: "Controlled Ignore" },
      { slug: "external-value-change", title: "External Value Change" },
      { slug: "multiple", title: "Multiple" },
      { slug: "cmdk", title: "Command K" },
      { slug: "combo-tags", title: "Tags Input" },
      { slug: "combo-textarea", title: "Textarea" },
      { slug: "tabs", title: "Tabs" },
      { slug: "custom-value", title: "Custom Value" },
      { slug: "controlled-input", title: "Controlled Input" },
      { slug: "rehydrate", title: "Rehydrate" },
      { slug: "virtualized", title: "Virtualized" },
      { slug: "emoji-picker", title: "Emoji Picker" },
    ],
  },
  {
    slug: "editable",
    label: "Editable",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled", title: "Controlled" },
    ],
  },
  {
    slug: "dialog",
    label: "Dialog",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "cloudinary", title: "Cloudinary" },
      { slug: "controlled", title: "Controlled" },
      { slug: "datepicker", title: "With Date Picker" },
      { slug: "delayed-close", title: "Delayed Close" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
      { slug: "multiple-trigger-controlled", title: "Multiple Trigger Controlled" },
      { slug: "popover-nested", title: "Popover Nested" },
      { slug: "scroll-outside", title: "Scroll Outside" },
    ],
  },
  {
    slug: "hover-card",
    label: "Hover Card",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "hovercard-in-dialog", title: "With Dialog" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
    ],
  },
  {
    slug: "menu",
    label: "Menu",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "overflow", title: "Overflow" },
      { slug: "nested", title: "Nested" },
      { slug: "options", title: "With options" },
      { slug: "combobox", title: "With Combobox" },
      { slug: "in-dialog", title: "With Dialog" },
      { slug: "lazy-mounted", title: "Lazy Mounted" },
      { slug: "links", title: "Links" },
      { slug: "multiple-controlled", title: "Multiple Controlled" },
      { slug: "multiple-nested", title: "Multiple Nested" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
    ],
  },
  {
    slug: "context-menu",
    label: "Context Menu",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
    ],
  },
  {
    slug: "number-input",
    label: "Number Input",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "wrapped", title: "Wrapped" },
    ],
  },
  {
    slug: "pagination",
    label: "Pagination",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "pin-input",
    label: "Pin Input",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "controlled", title: "Controlled" },
      { slug: "transform-paste", title: "Transform Paste" },
    ],
  },
  {
    slug: "popper",
    label: "Popper",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "popover",
    label: "Popover",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "composition-controlled", title: "Controlled" },
      { slug: "in-dialog", title: "With Dialog" },
      { slug: "multiple-controlled", title: "Multiple Controlled" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
      { slug: "nested", title: "Nested" },
      { slug: "selection", title: "Selection" },
      { slug: "single-tab-stop", title: "Single Tab Stop" },
      { slug: "responsive", title: "Responsive" },
      { slug: "sibling-dialog", title: "Sibling Dialog" },
      { slug: "tooltip", title: "Tooltip" },
    ],
  },
  {
    slug: "radio-group",
    label: "Radio Group",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "range-slider",
    label: "Range Slider",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "rating-group",
    label: "Rating Group",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "slider",
    label: "Slider",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "change-end", title: "Change End" },
      { slug: "number-input", title: "With Number Input" },
      { slug: "in-popover", title: "With Popover" },
      { slug: "tooltip", title: "With Tooltip" },
    ],
  },
  {
    slug: "tabs",
    label: "Tabs",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "with-link", title: "With Links" },
    ],
  },
  {
    slug: "tags-input",
    label: "Tags Input",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "validate", title: "Validate" },
      { slug: "allow-duplicates", title: "Allow Duplicates" },
      { slug: "sentence-builder", title: "Builder" },
    ],
  },
  {
    slug: "timer",
    label: "Timer",
    examples: [
      { slug: "countdown", title: "CountDown" },
      { slug: "stopwatch", title: "StopWatch" },
    ],
  },
  {
    slug: "toast",
    label: "Toast",
    examples: [
      { slug: "stacked", title: "Stacked" },
      { slug: "overlap", title: "Overlap" },
    ],
  },
  {
    slug: "toggle-group",
    label: "Toggle Group",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "toc",
    label: "TOC",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "indicator", title: "Indicator" },
      { slug: "scroll-element", title: "Scroll Element" },
    ],
  },
  {
    slug: "tooltip",
    label: "Tooltip",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "dialog", title: "With Dialog" },
      { slug: "follow-cursor", title: "Follow Cursor" },
      { slug: "multiple-trigger", title: "Multiple Trigger" },
    ],
  },
  {
    slug: "segment-control",
    label: "Segment Control",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "splitter",
    label: "Splitter",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "collapsible", title: "Collapsible" },
      { slug: "conditional", title: "Conditional" },
      { slug: "controlled", title: "Controlled" },
      { slug: "multiple", title: "Multiple" },
      { slug: "nested", title: "Nested" },
      { slug: "fixed-size", title: "Fixed Size" },
      { slug: "group-resize-behavior", title: "Group Resize Behavior" },
      { slug: "persistent-layout", title: "Persistent Layout" },
      { slug: "pixel-constraints", title: "Pixel Constraints" },
      { slug: "relative-units", title: "Relative Units" },
    ],
  },
  {
    slug: "json-tree",
    label: "JSON Tree",
    examples: [{ slug: "basic", title: "Basic" }],
  },
  {
    slug: "hotkeys",
    label: "Hotkeys",
    examples: [
      { slug: "basic", title: "Basic" },
      { slug: "sequences", title: "Sequences" },
      { slug: "scopes", title: "Scopes" },
      { slug: "command-dialog", title: "Command Dialog" },
      { slug: "key-recorder", title: "Key Recorder" },
    ],
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
