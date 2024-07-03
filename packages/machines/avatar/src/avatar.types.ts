import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type LoadStatus = "error" | "loaded"

export interface StatusChangeDetails {
  status: LoadStatus
}

export type ElementIds = Partial<{
  root: string
  image: string
  fallback: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends CommonProperties, DirectionProperty {
  /**
   * Functional called when the image loading status changes.
   */
  onStatusChange?: (details: StatusChangeDetails) => void
  /**
   * The ids of the elements in the avatar. Useful for composition.
   */
  ids?: ElementIds
}

interface PrivateContext {}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "loading" | "error" | "loaded"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the image is loaded.
   */
  loaded: boolean
  /**
   * Function to set new src.
   */
  setSrc(src: string): void
  /**
   * Function to set loaded state.
   */
  setLoaded(): void
  /**
   * Function to set error state.
   */
  setError(): void

  getRootProps(): T["element"]
  getImageProps(): T["img"]
  getFallbackProps(): T["element"]
}
