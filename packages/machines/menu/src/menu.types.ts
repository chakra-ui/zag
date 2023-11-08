import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { Point } from "@zag-js/rect-utils"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

export interface ValueChangeDetails {
  name: string
  value: string | string[]
}

export interface SelectionDetails {
  value: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type ElementIds = Partial<{
  trigger: string
  contextTrigger: string
  content: string
  label(id: string): string
  group(id: string): string
  positioner: string
  arrow: string
}>

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the menu. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The values of radios and checkboxes in the menu.
   */
  value?: Record<string, string | string[]>
  /**
   * Callback to be called when the menu values change (for radios and checkboxes).
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * The `id` of the active menu item.
   */
  highlightedId: string | null
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
   */
  loop: boolean
  /**
   * The options used to dynamically position the menu
   */
  positioning: PositioningOptions
  /**
   * Whether to close the menu when an option is selected
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

type PrivateContext = Context<{
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
   * The `id` of the menu item that is currently being hovered.
   */
  hoverId: string | null
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @internal
   * The typeahead state for faster keyboard navigation
   */
  typeahead: TypeaheadState
  /**
   * @internal
   * Whether to return focus to the trigger when the menu is closed
   */
  focusTriggerOnClose?: boolean
}>

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu"
  tags: "visible"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface Api {
  getItemProps: (opts: ItemProps) => Record<string, any>
  triggerProps: Record<string, any>
}

export interface ItemProps {
  /**
   * The `id` of the menu item option.
   */
  id: string
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
   * The option's name as specified in menu's `context.values` object
   */
  name: string
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
  onCheckedChange?: (checked: boolean) => void
}

export interface ItemState {
  isDisabled: boolean
  isHighlighted: boolean
}

export interface OptionItemState extends ItemState {
  isChecked: boolean
}

export interface GroupProps {
  /**
   * The `id` of the element that provides accessibility label to the option group
   */
  id: string
}

export interface LabelProps {
  /**
   * The `id` of the group this refers to
   */
  htmlFor: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the menu is open
   */
  isOpen: boolean
  /**
   * Function to open the menu
   */
  open(): void
  /**
   * Function to close the menu
   */
  close(): void
  /**
   * The id of the currently highlighted menuitem
   */
  highlightedId: string | null
  /**
   * Function to set the highlighted menuitem
   */
  setHighlightedId(id: string): void
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent(parent: Service): void
  /**
   * Function to register a child menu. This is used for submenus
   */
  setChild(child: Service): void
  /**
   * The value of the menu options item
   */
  value: Record<string, string | string[]> | undefined
  /**
   * Function to set the value of the menu options item
   */
  setValue: (name: string, value: any) => void
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
  contextTriggerProps: T["element"]
  getTriggerItemProps<A extends Api>(childApi: A): T["element"]
  triggerProps: T["button"]
  indicatorProps: T["element"]
  positionerProps: T["element"]
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  contentProps: T["element"]
  separatorProps: T["element"]
  getItemProps(options: ItemProps): T["element"]
  getOptionItemProps(option: OptionItemProps): T["element"]
  getOptionItemIndicatorProps(option: OptionItemProps): T["element"]
  getOptionItemTextProps(option: OptionItemProps): T["element"]
  getItemGroupLabelProps(options: LabelProps): T["element"]
  getItemGroupProps(options: GroupProps): T["element"]
}
