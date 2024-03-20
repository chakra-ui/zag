import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  list: string
  trigger(id: string): string
  link(id: string): string
  content(id: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the nav menu. Useful for composition.
   */
  ids?: ElementIds
  /**
   *  The orientation of the nav menu triggers.
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The `id` of the active menu.
   */
  activeId: string | null
  /**
   * The `id` of the highlighted link.
   */
  highlightedLinkId: string | null
  /**
   * The `id` of the active link for the current page.
   */
  activeLinkId: string | null
}

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
   * The `id` of the focused menu item.
   */
  focusedId: string | null
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the menu is a submenu (has a parent menu)
   */
  isSubmenu: boolean
  /**
   * @computed
   * The `id`s of the child menus
   */
  childrenIds: string[] | []
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "collapsed" | "expanded" | "collapsed:submenu"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The `id` of the iterable nav menu part
   */
  id: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Function to register a parent menu. This is used for submenus
   */
  setParent(parent: Service): void
  /**
   * Function to register a child menu. This is used for submenus
   * @param child The child menu
   * @param parentTriggerId The `id` of the parent content trigger
   */
  setChild(child: Service, parentTriggerId: string): void
  listProps: T["element"]
  itemProps: T["element"]
  getTriggerProps(props: ItemProps): T["button"]
  indicatorProps: T["element"]
  getContentProps(props: ItemProps): T["element"]
  linkContentGroupProps: T["element"]
  getLinkProps(props: ItemProps): T["a"]
}
