import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string | null
}

interface Size {
  width: number
  height: number
}

interface Rect extends Size {
  y: number
  x: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The value of the menu
   */
  value: string | null
  /**
   * Function called when the value of the menu changes
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * The delay before the menu opens
   */
  openDelay: number
  /**
   * The delay before the menu closes
   */
  closeDelay: number
}

interface PrivateContext {
  /**
   * @internal
   * The previous value of the menu
   */
  previousValue: string | null
  /**
   * @internal
   * The size of the viewport
   */
  viewportSize: Size | null
  /**
   * @internal
   * Whether the viewport is rendered
   */
  isViewportRendered: boolean
  /**
   * @internal
   * Whether the menu was closed by a click
   */
  wasClickCloseRef: string | null
  /**
   * @internal
   * Whether the menu was closed by escape key
   */
  wasEscapeCloseRef: boolean
  /**
   * @internal
   * Whether the menu was open by pointer move
   */
  hasPointerMoveOpenedRef: string | null
  /**
   * @internal
   * The active content node
   */
  activeContentNode: HTMLElement | null
  /**
   * @internal
   * The cleanup function for the active content node
   */
  activeContentCleanup: VoidFunction | null
  /**
   * @internal
   * The active trigger node
   */
  activeTriggerRect: Rect | null
  /**
   * @internal
   * The active trigger node
   */
  activeTriggerNode: HTMLElement | null
  /**
   * @internal
   * The cleanup function for the active trigger node
   */
  activeTriggerCleanup: VoidFunction | null
  /**
   * @internal
   * The parent menu of this menu
   */
  parentMenu: Service | null
  /**
   * @internal
   * The cleanup function for the inert attribute
   */
  tabOrderCleanup: VoidFunction | null
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "opening" | "open" | "closing" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the item
   */
  value: string
  /**
   * Whether the item is disabled
   */
  disabled?: boolean | undefined
}

export interface ArrowProps {
  /**
   * The value of the item
   */
  value: string
}

export interface LinkProps {
  /**
   * The value of the item this link belongs to
   */
  value: string
  /**
   * Whether the link is the current link
   */
  current?: boolean | undefined
  /**
   * Function called when the link is selected
   */
  onSelect?: (event: CustomEvent) => void
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the menu
   */
  value: string | null
  /**
   * Sets the value of the menu
   */
  setValue: (value: string) => void
  /**
   * Whether the menu is open
   */
  open: boolean

  getRootProps(): T["element"]
  getListProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getIndicatorTrackProps(): T["element"]
  getIndicatorProps(): T["element"]
  getArrowProps(props?: ArrowProps): T["element"]
  getTriggerProps(props: ItemProps): T["button"]
  getLinkProps(props: LinkProps): T["element"]
  getContentProps(props: LinkProps): T["element"]
  getViewportPositionerProps(): T["element"]
  getViewportProps(): T["element"]
}
