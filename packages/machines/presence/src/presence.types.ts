import type { StateMachine as S } from "@zag-js/core"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext {
  present: boolean
  onExitComplete?: () => void
}

interface PrivateContext {
  node: HTMLElement | null
  styles: CSSStyleDeclaration | null
  prevPresent?: boolean
  prevAnimationName: string
}

export type UserDefinedContext = PublicContext

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
   * Whether the node is present in the DOM.
   */
  isPresent: boolean
  /**
   * Function to set the node (as early as possible)
   */
  setNode(node: HTMLElement | null): void
}
