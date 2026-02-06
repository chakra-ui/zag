import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { Point } from "@zag-js/rect-utils"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  /**
   * Whether the menu is open
   */
  open: boolean
}

export interface SelectionDetails {
  /**
   * The value of the selected menu item
   */
  value: string
}

export interface HighlightChangeDetails {
  /**
   * The value of the highlighted menu item
   */
  highlightedValue: string | null
}

export interface NavigateDetails {
  value: string
  node: HTMLAnchorElement
  href: string
}

export type ElementIds = Partial<{
  trigger: string
  contextTrigger: string
  content: string
  groupLabel: (id: string) => string
  group: (id: string) => string
  positioner: string
  arrow: string
}>

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
   * The options used to dynamically position the menu
   */
  positioning?: PositioningOptions | undefined
  /**
   * Whether to close the menu when an option is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * Whether the menu should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only menu content will be visible to screen readers
   * - scrolling is blocked
   * - focus is trapped within the menu
   *
   * @default false
   */
  modal?: boolean | undefined
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
   * Whether the menu is a composed with other composite widgets like a combobox or tabs
   * @default true
   */
  composite?: boolean | undefined
  /**
   * Function to navigate to the selected item if it's an anchor element
   */
  navigate?: ((details: NavigateDetails) => void) | null | undefined
}

type PropsWithDefault = "closeOnSelect" | "typeahead" | "composite" | "positioning" | "loopFocus" | "modal"

export interface MenuSchema {
  props: RequiredBy<MenuProps, PropsWithDefault>
  context: {
    highlightedValue: string | null
    lastHighlightedValue: string | null
    currentPlacement: Placement | undefined
    intentPolygon: Point[] | null
    anchorPoint: Point | null
    suspendPointer: boolean
    isSubmenu: boolean
  }
  computed: {
    isRtl: boolean
    isTypingAhead: boolean
    highlightedId: string | null
  }
  refs: {
    parent: ParentMenuService | null
    children: Record<string, ChildMenuService>
    typeaheadState: TypeaheadState
    positioningOverride: Partial<PositioningOptions>
  }

  action: string
  effect: string
  guard: string
  event: EventObject

  state: "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu"

  tag: "open" | "closed"
}

export type MenuService = Service<MenuSchema>

export type MenuMachine = Machine<MenuSchema>

/**
 * Minimal interface required for child menu relationship.
 */
// zag-ignore-export
export type ChildMenuService = Pick<MenuService, "prop" | "send" | "scope" | "context">
/**
 * Minimal interface required for parent menu relationship.
 */
// zag-ignore-export
export type ParentMenuService = Pick<MenuService, "prop" | "send" | "refs" | "context">

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
  setOpen: (open: boolean) => void
  /**
   * The id of the currently highlighted menuitem
   */
  highlightedValue: string | null
  /**
   * Function to set the highlighted menuitem
   */
  setHighlightedValue: (value: string) => void
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent: (parent: ParentMenuService) => void
  /**
   * Function to register a child menu. This is used for submenus
   */
  setChild: (child: ChildMenuService) => void
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

  getContextTriggerProps: () => T["element"]
  getTriggerItemProps: <A extends Api>(childApi: A) => T["element"]
  getTriggerProps: () => T["button"]
  getIndicatorProps: () => T["element"]
  getPositionerProps: () => T["element"]
  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
  getContentProps: () => T["element"]
  getSeparatorProps: () => T["element"]
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
