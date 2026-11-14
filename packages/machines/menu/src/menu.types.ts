import type { ListCollection } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers, LayerSnapshot } from "@zag-js/dismissable"
import type { AnimationFrame, ModifierKeys, TypeaheadState } from "@zag-js/dom-query"
import type { Placement, PlacementSide, PositioningOptions } from "@zag-js/popper"
import type { Point } from "@zag-js/rect-utils"
import type {
  CommonProperties,
  DirectionProperty,
  MaybeElement,
  PopupActivationDirection,
  PropTypes,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ScrollToIndexDetails {
  index: number
  getElement: () => HTMLElement | null
}

/**
 * What opened or closed the menu:
 * - `trigger-click`: the trigger was pressed by pointer or Enter/Space
 * - `arrow-key`: an arrow key opened or closed the menu
 * - `context-menu`: the context trigger was right-clicked or long-pressed
 * - `trigger-hover`: the pointer hovered, or left, a trigger or submenu. With `setOpen`, focus stays put
 * - `sibling-open`: another menu in the menubar opened
 * - `item-select`: an item was selected
 * - `escape-key`: Escape was pressed
 * - `interact-outside`: the pointer was pressed outside
 * - `focus-outside`: focus moved outside
 * - `tab-key`: Tab moved focus out of the menu
 * - `script`: `setOpen` was called
 */
export type OpenChangeReason =
  | "trigger-click"
  | "arrow-key"
  | "context-menu"
  | "trigger-hover"
  | "sibling-open"
  | "item-select"
  | "escape-key"
  | "interact-outside"
  | "focus-outside"
  | "tab-key"
  | "script"

export interface OpenChangeDetails {
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * What opened or closed the menu
   */
  reason?: OpenChangeReason | undefined
}

export interface TriggerValueChangeDetails {
  /**
   * The value of the trigger
   */
  value: string | null
  /**
   * The trigger element
   */
  triggerElement: HTMLElement | null
}

export interface SelectionDetails {
  /**
   * The value of the selected menu item
   */
  value: string
  /**
   * The modifier keys held when the item was activated
   */
  modifiers: ModifierKeys
}

export type HighlightChangeReason = "keyboard" | "pointer" | "script"

export interface HighlightChangeDetails {
  /**
   * The value of the highlighted menu item
   */
  highlightedValue: string | null
  /**
   * What caused the highlight to change
   */
  reason: HighlightChangeReason
}

export interface NavigateDetails {
  value: string
  node: HTMLAnchorElement
  href: string
  /**
   * The modifier keys held when the item was activated
   */
  modifiers: ModifierKeys
}

export interface ElementIds {
  trigger?: (string | ((value?: string) => string)) | undefined
  contextTrigger?: (string | ((value?: string) => string)) | undefined
  content?: string | undefined
  groupLabel?: ((id: string) => string) | undefined
  group?: ((id: string) => string) | undefined
  positioner?: string | undefined
  arrow?: string | undefined
  input?: string | undefined
  list?: string | undefined
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface MenuProps extends DirectionProperty, CommonProperties, DismissableElementHandlers {
  /**
   * The ids of the elements in the menu. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The initial highlighted value of the menu item when rendered.
   * Use when you don't need to control the highlighted value of the menu item.
   */
  defaultHighlightedValue?: string | null | undefined
  /**
   * The controlled highlighted value of the menu item.
   */
  highlightedValue?: string | null | undefined
  /**
   * The menu's items, in order. Set it when the items are virtualized, so the keyboard
   * and typeahead can reach items that aren't rendered.
   */
  collection?: ListCollection<any> | undefined
  /**
   * Scrolls the item at an index into view, for virtualized items. Used with `collection`.
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Function called when the highlighted menu item changes.
   */
  onHighlightChange?: ((details: HighlightChangeDetails) => void) | undefined
  /**
   * Function called when a menu item is selected.
   */
  onSelect?: ((details: SelectionDetails) => void) | undefined
  /**
   * The positioning point for the menu. Can be set by the context menu trigger or the button trigger.
   */
  anchorPoint?: Point | null | undefined
  /**
   * Whether to loop the keyboard navigation.
   * @default false
   */
  loopFocus?: boolean | undefined
  /**
   * The element to focus when the menu opens.
   * Return `false` to skip moving focus, or `null` to use the default.
   */
  initialFocusEl?: (() => MaybeElement | false) | undefined
  /**
   * The element to focus when the menu closes.
   * Return `null` to use the default (the trigger, or the element focused before a context menu opened).
   */
  finalFocusEl?: (() => MaybeElement) | undefined
  /**
   * The options used to dynamically position the menu
   */
  positioning?: PositioningOptions | undefined
  /**
   * Whether to close the menu when an option is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * The accessibility label for the menu
   */
  "aria-label"?: string | undefined
  /**
   * The controlled open state of the menu
   */
  open?: boolean | undefined
  /**
   * Function called when the menu opens or closes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The initial open state of the menu when rendered.
   * Use when you don't need to control the open state of the menu.
   */
  defaultOpen?: boolean | undefined
  /**
   * Whether the pressing printable characters should trigger typeahead navigation
   * @default true
   */
  typeahead?: boolean | undefined
  /**
   * Whether a filter input highlights the first item when its query changes.
   * - `true`: highlight it while the query is not empty
   * - `"always"`: highlight it even when the query is empty, and keep a highlight when the pointer leaves
   * @default false
   */
  autoHighlight?: boolean | "always" | undefined
  /**
   * The type of popup the trigger opens.
   * - `"menu"`: the content is the menu and manages keyboard focus across its items.
   * - `"dialog"`: the content is a dialog holding the menu list, for widgets that keep focus such as a filter input.
   * @default "menu"
   */
  popupType?: "menu" | "dialog" | undefined
  /**
   * Function to navigate to the selected item if it's an anchor element
   */
  navigate?: ((details: NavigateDetails) => void) | null | undefined
  /**
   * The controlled trigger value
   */
  triggerValue?: string | null | undefined
  /**
   * The initial trigger value when rendered.
   * Use when you don't need to control the trigger value.
   */
  defaultTriggerValue?: string | null | undefined
  /**
   * Function called when the trigger value changes.
   */
  onTriggerValueChange?: ((details: TriggerValueChangeDetails) => void) | undefined
  /**
   * Config provided by a parent menubar. When set, this menu acts as a menubar menu:
   * its trigger becomes a `menuitem` and it coordinates open/close/focus with sibling menus.
   * Adapters typically populate this from a menubar context. Omit it for submenus.
   */
  menubar?: MenubarContext | undefined
}

export interface MenubarContext {
  /**
   * The resolved id of the menubar root element. Used to scope the coordination events.
   */
  rootId: string
  /**
   * The id of the currently tabbable menubar trigger.
   */
  activeId: string | null
  /**
   * Whether the menubar (and therefore this menu's trigger) is disabled.
   */
  disabled?: boolean | undefined
  /**
   * The orientation of the menubar.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
}

type PropsWithDefault = "closeOnSelect" | "typeahead" | "popupType" | "positioning" | "loopFocus"

export interface MenuSchema {
  props: MenuProps
  defaultPropKey: PropsWithDefault
  context: {
    /**
     * The computed layer stack state used for declarative styles and attributes.
     */
    layer: LayerSnapshot | null
    highlightedValue: string | null
    lastHighlightedValue: string | null
    isWebKit: boolean
    currentPlacement: Placement | undefined
    intentPolygon: Point[] | null
    anchorPoint: Point | null
    isSubmenu: boolean
    triggerValue: string | null
    pointerRoutingMode: "interactive" | "locked"
    /** Whether the open/close came from swapping between menubar menus. Exposed as `data-instant`. */
    instant: boolean
    /** Where the current trigger sits relative to the previous one, after switching triggers while open */
    activationDirection: PopupActivationDirection | null
    /** The trigger value before the last switch, kept until the switch ends */
    previousTriggerValue: string | null
    /** Whether the menu is moving between triggers */
    transitioning: boolean
    /** Whether a viewport is rendered, with one content per trigger */
    viewportRendered: boolean
    /** The size of the current content, when the viewport is rendered */
    viewportSize: ViewportSize | null
  }
  computed: {
    isRtl: boolean
    isTypingAhead: boolean
    highlightedId: string | null
    isInMenubar: boolean
    menubarDisabled: boolean
  }
  refs: {
    parent: MenuService | null
    children: Record<string, MenuService>
    pointerRoutingLocked: boolean
    typeaheadState: TypeaheadState
    positioningOverride: Partial<PositioningOptions>
    menubarCloseReason: string | null
    pointerType: string | null
    focusMenuFrame: AnimationFrame
    returnFocusFrame: AnimationFrame
    returnFocusEl: HTMLElement | null
    autoHighlightFrame: AnimationFrame
    syncHighlightFrame: AnimationFrame
    cancelTriggerSwitch: VoidFunction | null
    awaitingViewportSize: boolean
  }

  action: string
  effect: string
  guard: string
  event: EventObject

  state: "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu" | "opening:requested"

  tag: "open" | "closed"
}

export type MenuService = Service<MenuSchema>

export type MenuMachine = Machine<MenuSchema>

// zag-ignore-export
export type ChildMenuService = MenuService

// zag-ignore-export
export type ParentMenuService = MenuService

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * The value that identifies this specific trigger
   */
  value?: string
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

// zag-ignore-export
export interface Api {
  getItemProps: (props: ItemProps) => Record<string, any>
  getTriggerProps: () => Record<string, any>
}

export interface ItemProps {
  /**
   * The unique value of the menu item option.
   */
  value: string
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean | undefined
  /**
   * The textual value of the option. Used in typeahead navigation of the menu.
   * If not provided, the text content of the menu item will be used.
   */
  valueText?: string | undefined
  /**
   * Whether the menu should be closed when the option is selected.
   */
  closeOnSelect?: boolean | undefined
}

export interface ItemListenerProps {
  /**
   * The id of the item. Can be obtained from the `getItemState` function.
   */
  id: string
  /**
   * Function called when the item is selected
   */
  onSelect?: VoidFunction | undefined
}

export interface OptionItemProps extends Partial<ItemProps> {
  /**
   * Whether the option is checked
   */
  checked: boolean
  /**
   * Whether the option is a radio or a checkbox
   */
  type: "radio" | "checkbox"
  /**
   * The value of the option
   */
  value: string
  /**
   * Function called when the option state is changed
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined
}

export interface ItemState {
  /**
   * The unique id of the item
   */
  id: string
  /**
   * Whether the item is disabled
   */
  disabled: boolean
  /**
   * Whether the item is highlighted
   */
  highlighted: boolean
}

export interface OptionItemState extends ItemState {
  /**
   * Whether the option item is checked
   */
  checked: boolean
}

export interface TriggerState {
  /**
   * The value that identifies this specific trigger
   */
  value: string | undefined
  /**
   * Whether this trigger is the one that opened the menu
   */
  current: boolean
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * Whether the trigger is disabled
   */
  disabled: boolean
}

export interface PositionerState {
  /**
   * Whether the menu is nested within another layered element
   */
  nested: boolean
  /**
   * Whether the menu has nested layered elements within it
   */
  hasNested: boolean
  /**
   * Whether the menu is moving between triggers
   */
  transitioning: boolean
  /**
   * Whether the menu skips its animation, e.g. when switching between menubar menus
   */
  instant: boolean
}

export interface ViewportSize {
  width: number
  height: number
}

export interface ContentProps {
  /**
   * The trigger value this content belongs to. Use one content per trigger inside the viewport.
   */
  value?: string | undefined
}

export interface ContentState {
  /**
   * Whether the content is shown. For a content with a `value`, whether its trigger is the current one.
   */
  open: boolean
  /**
   * Whether the menu is nested within another layered element
   */
  nested: boolean
  /**
   * Whether the menu has nested layered elements within it
   */
  hasNested: boolean
  /**
   * The current placement of the content relative to the trigger
   */
  placement: Placement | undefined
  /**
   * The side of the trigger the content is placed on
   */
  side: PlacementSide | undefined
  /**
   * Whether the menu skips its animation, e.g. when switching between menubar menus
   */
  instant: boolean
  /**
   * Where the current trigger sits relative to the previous one, e.g. `"right"` or `"left down"`.
   * `null` until the menu switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
}

export interface ViewportState {
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * Whether the menu skips its animation, e.g. when switching between menubar menus
   */
  instant: boolean
  /**
   * The side of the trigger the viewport is placed on
   */
  side: PlacementSide | undefined
  /**
   * Where the current trigger sits relative to the previous one, e.g. `"right"` or `"left down"`.
   * `null` until the menu switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
  /**
   * Whether the menu is moving between triggers
   */
  transitioning: boolean
}

export interface ItemGroupProps {
  /**
   * The `id` of the element that provides accessibility label to the option group
   */
  id: string
}

export interface ItemGroupLabelProps {
  /**
   * The `id` of the group this refers to
   */
  htmlFor: string
}

export interface ItemBaseProps {
  value: string
  disabled?: boolean | undefined
  checked?: boolean | undefined
  valueText?: string | undefined
}

export interface MenuApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * Function to open or close the menu
   */
  setOpen: (open: boolean, reason?: OpenChangeReason) => void
  /**
   * The trigger value
   */
  triggerValue: string | null
  /**
   * Function to set the trigger value
   */
  setTriggerValue: (value: string | null) => void
  /**
   * Where the current trigger sits relative to the previous one, after switching triggers while open
   */
  activationDirection: PopupActivationDirection | null
  /**
   * Returns the trigger values whose content to render: the current one, plus the previous one while
   * it animates out after a switch. Oldest first.
   */
  getContentValues: () => string[]
  /**
   * The id of the currently highlighted menuitem
   */
  highlightedValue: string | null
  /**
   * Function to set the highlighted menuitem
   */
  setHighlightedValue: (value: string | null) => void
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent: (parent: MenuService) => void
  /**
   * Function to register a child menu. This is used for submenus
   */
  setChild: (child: MenuService) => void
  /**
   * Function to reposition the popover
   */
  reposition: (options?: Partial<PositioningOptions>) => void
  /**
   * Returns the state of the option item
   */
  getOptionItemState: (props: OptionItemProps) => OptionItemState
  /**
   * Returns the state of the menu item
   */
  getItemState: (props: ItemProps) => ItemState
  /**
   * Setup the custom event listener for item selection event
   */
  addItemListener: (props: ItemListenerProps) => VoidFunction | undefined

  getContextTriggerProps: (props?: TriggerProps) => T["element"]
  getTriggerItemProps: <A extends Api>(childApi: A) => T["element"]
  /**
   * Returns the state of a specific trigger, including whether it's the currently active one
   */
  getTriggerState: (props?: TriggerProps) => TriggerState
  getTriggerProps: (props?: TriggerProps) => T["button"]
  getIndicatorProps: () => T["element"]
  /**
   * Returns the state of the positioner
   */
  getPositionerState: () => PositionerState
  getPositionerProps: () => T["element"]
  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
  /**
   * Returns the state of the content
   */
  getContentState: (props?: ContentProps) => ContentState
  getContentProps: (props?: ContentProps) => T["element"]
  /**
   * Returns the state of the viewport
   */
  getViewportState: () => ViewportState
  getViewportProps: () => T["element"]
  getSeparatorProps: () => T["element"]
  getInputProps: () => T["input"]
  getListProps: () => T["element"]
  getEmptyProps: () => T["element"]
  getItemProps: (options: ItemProps) => T["element"]
  getOptionItemProps: (option: OptionItemProps) => T["element"]
  getItemIndicatorProps: (option: ItemBaseProps) => T["element"]
  getItemTextProps: (option: ItemBaseProps) => T["element"]
  getItemGroupLabelProps: (options: ItemGroupLabelProps) => T["element"]
  getItemGroupProps: (options: ItemGroupProps) => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { PositioningOptions, Point }
