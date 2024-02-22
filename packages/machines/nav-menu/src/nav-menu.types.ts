import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { Point } from "@zag-js/dom-event"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type ElementIds = Partial<{
  root: string
  trigger(id: string): string
  content(id: string): string
  positioner(id: string): string
  menuItem(id: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The orientation of the nav menu
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The options used to dynamically position the menu
   */
  positioning: PositioningOptions
  /**
   * The link tied to the current page
   */
  activeLink?: string | null
}

type PrivateContext = {
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
   *
   * The id of the focused menu trigger
   */
  focusedMenuId: string | null
  /**
   * @internal
   *
   * The id of the active menu
   */
  activeId: string | null
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * The positioning point for the menu. Can be set by the context menu trigger or the button trigger.
   */
  anchorPoint: Point | null
  /**
   * @internal
   * Whether to return focus to the trigger when the menu is closed
   */
  restoreFocus?: boolean
  /**
   * @internal
   * The `id` of the active menu item.
   */
  highlightedItemId: string | null
  /**
   * @internal
   * The open content from the active menu item.
   */
  activeContentId: string | null
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the menu is a submenu (has a parent menu)
   */
  isSubmenu: boolean
  /**
   * @computed
   * Whether the nav menu items are vertical.
   */
  isVertical: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface Api {
  getMenuItemProps: (props: ItemProps & { href: string }) => Record<string, any>
  getTriggerProps: (props: ItemProps) => Record<string, any>
}

export interface ItemProps {
  id: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent(parent: Service): void
  /**
   * Function to register a child menu. This is used for submenus
   */
  setChild(child: Service): void
  rootProps: T["element"]
  separatorProps: T["element"]
  indicatorProps: T["element"]
  getTriggerProps(props: ItemProps): T["element"]
  getTriggerMenuItemProps<A extends Api>(childApi: A, id: string): T["button"]
  getPositionerProps(props: ItemProps): T["element"]
  getContentProps(props: ItemProps): T["element"]
  getMenuItemProps(props: ItemProps & { href: string }): T["element"]
}
