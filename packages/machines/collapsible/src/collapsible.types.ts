import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  content: string
  trigger: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the collapsible. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Function called when the animation ends in the closed state.
   */
  onExitComplete?: () => void
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Whether the collapsible is open
   */
  open?: boolean
  /**
   * Whether the collapsible is disabled
   */
  disabled?: boolean
  /**
   *  Whether the collapsible open state is controlled by the user
   */
  "open.controlled"?: boolean
}

type ComputedContext = Readonly<{}>

interface PrivateContext {
  /**
   * @internal
   * The height of the content
   */
  height: number
  /**
   * @internal
   * The width of the content
   */
  width: number
  /**
   * @internal
   * The styles of the content
   */
  stylesRef: Record<string, any> | null
  /**
   * @internal
   * Whether the initial animation is allowed
   */
  initial: boolean
  /**
   * @internal
   * The requestAnimationFrame id
   */
  _rafCleanup?: VoidFunction
  /**
   * @internal
   * The unmount animation name
   */
  unmountAnimationName: string | null
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export type MachineState = {
  value: "open" | "closed" | "closing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the collapsible is open.
   */
  open: boolean
  /**
   * Whether the collapsible is visible (open or closing)
   */
  visible: boolean
  /**
   * Whether the collapsible is disabled
   */
  disabled: boolean
  /**
   * Function to open or close the collapsible.
   */
  setOpen(open: boolean): void

  getRootProps(): T["element"]
  getTriggerProps(): T["button"]
  getContentProps(): T["element"]
}
