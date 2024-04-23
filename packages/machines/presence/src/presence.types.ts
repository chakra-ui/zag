import type { StateMachine as S } from "@zag-js/core"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext {
  /**
   * Whether the node is present (controlled by the user)
   */
  present: boolean
  /**
   * Function called when the animation ends in the closed state.
   */
  onExitComplete?(): void
}

interface PrivateContext {
  initial: boolean
  node: HTMLElement | null
  styles: CSSStyleDeclaration | null
  unmountAnimationName: string | null
  prevAnimationName: string | null
  rafId?: number
}

export interface UserDefinedContext extends PublicContext {}

export interface MachineContext extends PublicContext, PrivateContext {}

export interface MachineState {
  value: "mounted" | "unmountSuspended" | "unmounted"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi {
  /**
   * Whether the animation should be skipped.
   */
  skip: boolean
  /**
   * Whether the node is present in the DOM.
   */
  present: boolean
  /**
   * Function to set the node (as early as possible)
   */
  setNode(node: HTMLElement | null): void
  /**
   * Function to programmatically unmount the node
   */
  unmount(): void
}
