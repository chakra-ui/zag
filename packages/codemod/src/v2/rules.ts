/**
 * Rename tables for the v1 -> v2 migration. Each entry mirrors a row of
 * website/data/guides/migration.mdx.
 */

/** `@zag-js/*` packages that are not state machines. */
export const NON_MACHINE_PACKAGES = new Set([
  "anatomy",
  "anatomy-icons",
  "aria-hidden",
  "auto-resize",
  "collection",
  "color-utils",
  "core",
  "date-utils",
  "dismissable",
  "docs",
  "dom-query",
  "file-utils",
  "focus-trap",
  "focus-visible",
  "fuzzy",
  "highlight-word",
  "hotkeys",
  "i18n-utils",
  "interact-outside",
  "json-tree-utils",
  "live-region",
  "popper",
  "preact",
  "react",
  "rect-utils",
  "remove-scroll",
  "safe-area",
  "scroll-snap",
  "solid",
  "store",
  "stringify-state",
  "svelte",
  "types",
  "utils",
  "vanilla",
  "virtualizer",
  "vue",
])

const PREVIOUS_TRIGGER_SCOPES = ["carousel", "date-picker", "pagination", "scheduler", "steps"]

/**
 * Part renames, applied to `data-{scope}-{part}` attribute names.
 * Ordered longest-first so that `item-text` wins over `item`.
 */
export const PART_RENAMES: Array<{ scope: string; from: string; to: string }> = [
  ...PREVIOUS_TRIGGER_SCOPES.map((scope) => ({ scope, from: "prev-trigger", to: "previous-trigger" })),
  { scope: "tree-view", from: "branch-indent-guide", to: "indent-guide" },
  { scope: "tree-view", from: "branch-indicator", to: "node-indicator" },
  { scope: "tree-view", from: "branch-content", to: "node-group-content" },
  { scope: "tree-view", from: "branch-control", to: "node" },
  { scope: "tree-view", from: "branch-trigger", to: "node-expand-trigger" },
  { scope: "tree-view", from: "branch-text", to: "node-text" },
  { scope: "tree-view", from: "branch", to: "node-group" },
  { scope: "tree-view", from: "item-indicator", to: "node-indicator" },
  { scope: "tree-view", from: "item-text", to: "node-text" },
  { scope: "tree-view", from: "item", to: "node" },
]

export interface MemberRule {
  /** Packages whose `api` has this member in v1. */
  pkgs: string[]
  from: string
  to: string
  /**
   * The name is common outside zag (`loading`, `getItemProps`), so it is only
   * renamed when the receiver is known to be this package's api.
   */
  generic?: boolean
  /** Only exists in zag, so it is safe to rename even without an import. */
  unique?: boolean
  /** Extra argument handling, see script transform. */
  special?: "clear-highlight" | "indicator-expanded" | "indicator-selected"
}

const ASYNC_LIST = ["async-list"]
const TREE_VIEW = ["tree-view"]
const HIGHLIGHT = ["combobox", "select", "cascade-select"]

export const MEMBER_RULES: MemberRule[] = [
  { pkgs: PREVIOUS_TRIGGER_SCOPES, from: "getPrevTriggerProps", to: "getPreviousTriggerProps", unique: true },
  { pkgs: ["carousel"], from: "scrollPrev", to: "scrollPrevious" },
  { pkgs: ["carousel"], from: "canScrollPrev", to: "canScrollPrevious" },
  { pkgs: ["date-picker", "scheduler"], from: "goToPrev", to: "goToPrevious" },
  { pkgs: ["pagination"], from: "goToPrevPage", to: "goToPreviousPage" },
  { pkgs: ["steps"], from: "goToPrevStep", to: "goToPreviousStep" },
  { pkgs: ["steps", "tour"], from: "hasPrevStep", to: "hasPreviousStep" },
  { pkgs: ["tabs"], from: "selectPrev", to: "selectPrevious" },
  { pkgs: ["tour"], from: "prev", to: "previous", generic: true },
  { pkgs: HIGHLIGHT, from: "setHighlightValue", to: "setHighlightedValue" },
  { pkgs: HIGHLIGHT, from: "clearHighlightValue", to: "setHighlightedValue", special: "clear-highlight" },
  { pkgs: ["listbox"], from: "highlightValue", to: "setHighlightedValue", generic: true },

  // tree view: unified node model
  { pkgs: TREE_VIEW, from: "getCellProps", to: "getNodeCellProps", generic: true },
  { pkgs: TREE_VIEW, from: "getBranchProps", to: "getNodeGroupProps", unique: true },
  { pkgs: TREE_VIEW, from: "getBranchControlProps", to: "getNodeProps", unique: true },
  { pkgs: TREE_VIEW, from: "getBranchContentProps", to: "getNodeGroupContentProps", unique: true },
  { pkgs: TREE_VIEW, from: "getBranchTextProps", to: "getNodeTextProps", unique: true },
  { pkgs: TREE_VIEW, from: "getBranchTriggerProps", to: "getNodeExpandTriggerProps", unique: true },
  { pkgs: TREE_VIEW, from: "getBranchIndentGuideProps", to: "getIndentGuideProps", unique: true },
  {
    pkgs: TREE_VIEW,
    from: "getBranchIndicatorProps",
    to: "getNodeIndicatorProps",
    unique: true,
    special: "indicator-expanded",
  },
  { pkgs: TREE_VIEW, from: "getItemProps", to: "getNodeProps", generic: true },
  { pkgs: TREE_VIEW, from: "getItemTextProps", to: "getNodeTextProps", generic: true },
  {
    pkgs: TREE_VIEW,
    from: "getItemIndicatorProps",
    to: "getNodeIndicatorProps",
    generic: true,
    special: "indicator-selected",
  },

  // async list
  { pkgs: ASYNC_LIST, from: "setFilterText", to: "setFilter", generic: true },
  { pkgs: ASYNC_LIST, from: "sort", to: "setSorting", generic: true },
  { pkgs: ASYNC_LIST, from: "filterText", to: "filter", generic: true },
  { pkgs: ASYNC_LIST, from: "sorting", to: "isSorting", generic: true },
  { pkgs: ASYNC_LIST, from: "sortDescriptor", to: "sorting", generic: true },
  { pkgs: ASYNC_LIST, from: "loading", to: "isLoading", generic: true },
  { pkgs: ASYNC_LIST, from: "empty", to: "isEmpty", generic: true },
]

/** Members that were removed and need a manual change. */
export const REMOVED_MEMBERS: Array<{ pkgs: string[]; name: string; message: string }> = [
  {
    pkgs: ["avatar"],
    name: "setSrc",
    message: "avatar: `api.setSrc` is removed. Update `src` on the image you render.",
  },
  {
    pkgs: ["popover"],
    name: "portalled",
    message:
      "popover: `api.portalled` is removed and popover always portals. Render the Portal unconditionally (`api.portalled ? Portal : Fragment` becomes `Portal`) and remove imports that are no longer used.",
  },
  {
    pkgs: ["color-picker"],
    name: "gamutOverlay",
    message: "color-picker: `api.gamutOverlay` is now `api.getGamutOverlay(props)`.",
  },
  {
    pkgs: ["number-input"],
    name: "valueAsNumber",
    message:
      "number-input: `valueAsNumber` is removed. `value` is now `number | null`; read the text from `formattedValue`.",
  },
]

export interface PropRule {
  from: string
  to: string
}

/** Machine prop key renames, by package. */
export const PROP_RENAMES: Record<string, PropRule[]> = {
  carousel: [
    { from: "slideCount", to: "count" },
    { from: "autoplay", to: "autoPlay" },
    { from: "padding", to: "itemSpacing" },
  ],
  "pin-input": [{ from: "sanitizeValue", to: "normalizeValue" }],
  "async-list": [
    { from: "initialFilterText", to: "initialFilter" },
    { from: "initialSortDescriptor", to: "initialSorting" },
  ],
}

/** Module exports renamed, by package (`ns.x`, `ns.X` types and named imports). */
export const EXPORT_RENAMES: Record<string, PropRule[]> = {
  "floating-panel": [
    { from: "resizeTriggerAxes", to: "resizeTriggerPlacements" },
    { from: "ResizeTriggerAxis", to: "HandlePosition" },
  ],
  "image-cropper": [{ from: "handles", to: "placements" }],
}

/** Keys renamed inside the `ids` and `translations` props. */
export const NESTED_RENAMES: Record<string, { ids?: PropRule[]; translations?: PropRule[] }> = {
  carousel: {
    ids: [{ from: "prevTrigger", to: "previousTrigger" }],
    translations: [{ from: "prevTrigger", to: "previousTrigger" }],
  },
  "date-picker": {
    ids: [{ from: "prevTrigger", to: "previousTrigger" }],
    translations: [{ from: "prevTrigger", to: "previousTrigger" }],
  },
  pagination: {
    ids: [{ from: "prevTrigger", to: "previousTrigger" }],
    translations: [
      { from: "prevTrigger", to: "previousTrigger" },
      { from: "prevTriggerLabel", to: "previousTriggerLabel" },
    ],
  },
  scheduler: {
    ids: [{ from: "prevTrigger", to: "previousTrigger" }],
    translations: [
      { from: "prevTrigger", to: "previousTrigger" },
      { from: "prevTriggerLabel", to: "previousTriggerLabel" },
    ],
  },
  steps: {
    ids: [{ from: "prevTrigger", to: "previousTrigger" }],
    translations: [{ from: "prevTrigger", to: "previousTrigger" }],
  },
  tour: { translations: [{ from: "prevStep", to: "previousStep" }] },
}

/** Props removed without replacement. */
export const REMOVED_PROPS: Record<string, string[]> = {
  accordion: ["loopFocus"],
  "pin-input": ["selectOnFocus"],
  popover: ["portalled"],
}

/**
 * Defaults that changed in v2. When a props object leaves the prop out, the
 * codemod reports it so the user can decide whether to keep the v1 behavior.
 */
export const CHANGED_DEFAULTS: Record<string, { prop: string; v1: string; note: string }> = {
  accordion: { prop: "collapsible", v1: "false", note: "accordion: `collapsible` now defaults to `true`" },
  "tags-input": { prop: "editable", v1: "true", note: "tags-input: `editable` now defaults to `false`" },
  toc: { prop: "multiple", v1: "true", note: "toc: `multiple` now defaults to `false`" },
}

export function changedDefaultMessage(changed: { prop: string; v1: string; note: string }): string {
  return `${changed.note}. Pass \`${changed.prop}: ${changed.v1}\` to keep the v1 behavior.`
}
