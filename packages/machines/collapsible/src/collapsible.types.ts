import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type ElementIds = Partial<{
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
  __controlled?: boolean
}

type ComputedContext = Readonly<{}>

type PrivateContext = Context<{
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
   * Whether the mount animation is prevented
   */
  isMountAnimationPrevented: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export type MachineState = {
  value: "open" | "closed" | "closing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the collapsible is open.
   */
  isOpen: boolean
  /**
   * Whether the collapsible is disabled
   */
  isDisabled: boolean
  /**
   * Whether the checkbox is focused
   */
  isFocused: boolean | undefined
  /**
   * Function to open the collapsible.
   */
  open(): void
  /**
   * Function to close the collapsible.
   */
  close(): void
  rootProps: T["element"]
  triggerProps: T["button"]
  contentProps: T["element"]
}
