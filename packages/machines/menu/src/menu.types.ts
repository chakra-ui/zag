import type { Machine, StateMachine as S } from "@zag-js/core"
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

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type ElementIds = Partial<{
  trigger: string
  contextTrigger: string
  content: string
  groupLabel(id: string): string
  group(id: string): string
  positioner: string
  arrow: string
}>

interface PublicContext extends DirectionProperty, CommonProperties, DismissableElementHandlers {
  /**
   * The ids of the elements in the menu. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The value of the highlighted menu item.
   */
  highlightedValue: string | null
  /**
   * Function called when the highlighted menu item changes.
   */
  onHighlightChange?: (details: HighlightChangeDetails) => void
  /**
   * Function called when a menu item is selected.
   */
  onSelect?: (details: SelectionDetails) => void
  /**
   * The positioning point for the menu. Can be set by the context menu trigger or the button trigger.
   */
  anchorPoint: Point | null
  /**
   * Whether to loop the keyboard navigation.
   * @default false
   */
  loopFocus: boolean
  /**
   * The options used to dynamically position the menu
   */
  positioning: PositioningOptions
  /**
   * Whether to close the menu when an option is selected
   * @default true
   */
  closeOnSelect: boolean
  /**
   * The accessibility label for the menu
   */
  "aria-label"?: string
  /**
   * Whether the menu is open
   */
  open?: boolean
  /**
   * Function called when the menu opens or closes
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   *  Whether the menu's open state is controlled by the user
   */
  "open.controlled"?: boolean
  /**
   * Whether the pressing printable characters should trigger typeahead navigation
   * @default true
   */
  typeahead: boolean
  /**
   * Whether the menu is a composed with other composite widgets like a combobox or tabs
   * @default true
   */
  composite: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the menu is a submenu (has a parent menu)
   */
  isSubmenu: boolean
  /**
   * @computed
   * Whether the writing direction is rtl
   */
  isRtl: boolean
  /**
   * @computed
   * Whether a typeahead search is ongoing
   */
  isTypingAhead: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * The menu's parent. Used for submenus.
   */
  parent: Service | null
  /**
   * @internal
   * The child menus. Used for submenus.
   */
  children: Record<string, Service>
  /**
   * @internal
   * The polygon tells us if the pointer is moving toward the submenu
   */
  intentPolygon: Point[] | null
  /**
   * @internal
   * Whether to suspend listening to pointer-over events on a submenu.
   * This is used to prevent the menu from closing when the user is hovering to a submenu.
   */
  suspendPointer: boolean
  /**
   * @internal
   * The `id` of the menu item that is currently being highlighted.
   */
  lastHighlightedValue: string | null
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @internal
   * The typeahead state for faster keyboard navigation
   */
  typeaheadState: TypeaheadState
  /**
   * @internal
   * Whether to return focus to the trigger when the menu is closed
   */
  restoreFocus?: boolean
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu"
  tags: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface Api {
  getItemProps: (opts: ItemProps) => Record<string, any>
  getTriggerProps(): Record<string, any>
}

export interface ItemProps {
  /**
   * The unique value of the menu item option.
   */
  value: string
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean
  /**
   * The textual value of the option. Used in typeahead navigation of the menu.
   * If not provided, the text content of the menu item will be used.
   */
  valueText?: string
  /**
   * Whether the menu should be closed when the option is selected.
   */
  closeOnSelect?: boolean
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
  onCheckedChange?(checked: boolean): void
}

export interface ItemState {
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

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * Function to open or close the menu
   */
  setOpen(open: boolean): void
  /**
   * The id of the currently highlighted menuitem
   */
  highlightedValue: string | null
  /**
   * Function to set the highlighted menuitem
   */
  setHighlightedValue(value: string): void
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent(parent: Service): void
  /**
   * Function to register a child menu. This is used for submenus
   */
  setChild(child: Service): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void
  /**
   * Returns the state of the option item
   */
  getOptionItemState(props: OptionItemProps): OptionItemState
  /**
   * Returns the state of the menu item
   */
  getItemState(props: ItemProps): ItemState
  getContextTriggerProps(): T["element"]
  getTriggerItemProps<A extends Api>(childApi: A): T["element"]
  getTriggerProps(): T["button"]
  getIndicatorProps(): T["element"]
  getPositionerProps(): T["element"]
  getArrowProps(): T["element"]
  getArrowTipProps(): T["element"]
  getContentProps(): T["element"]
  getSeparatorProps(): T["element"]
  getItemProps(options: ItemProps): T["element"]
  getOptionItemProps(option: OptionItemProps): T["element"]
  getItemIndicatorProps(option: OptionItemProps): T["element"]
  getItemTextProps(option: OptionItemProps): T["element"]
  getItemGroupLabelProps(options: ItemGroupLabelProps): T["element"]
  getItemGroupProps(options: ItemGroupProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { PositioningOptions, Point }
