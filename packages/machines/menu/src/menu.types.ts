import type { Machine, StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-utils"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { Point } from "@zag-js/rect-utils"
import type { Context, DirectionProperty } from "@zag-js/types"

type ElementIds = Partial<{
  trigger: string
  contextTrigger: string
  content: string
  label(id: string): string
  group(id: string): string
}>

type PublicContext = DirectionProperty & {
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
  onValueChange?: (details: { name: string; value: string | string[] }) => void
  /**
   * The `id` of the active menu item.
   */
  activeId: string | null
  /**
   * Function called when a menu item is selected.
   */
  onSelect?: (value: string) => void
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
}

export type UserDefinedContext = Partial<PublicContext>

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
   * Whether the dynamic placement has been computed
   */
  isPlacementComplete: boolean
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

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown" | "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu"
  tags: "visible"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

export type Api = {
  getItemProps: (opts: ItemProps) => Record<string, any>
  triggerProps: Record<string, any>
}

export type ItemProps = {
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

export type OptionItemProps = Partial<ItemProps> & {
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

export type GroupProps = {
  /**
   * The `id` of the element that provides accessibility label to the option group
   */
  id: string
}

export type LabelProps = {
  /**
   * The `id` of the group this refers to
   */
  htmlFor: string
}
