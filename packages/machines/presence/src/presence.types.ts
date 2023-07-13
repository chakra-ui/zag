import type { StateMachine as S } from "@zag-js/core"

type PublicContext = {
  present: boolean
  onExitComplete?: () => void
}

export type PublicApi = {
  /**
   * Whether the node is present in the DOM.
   */
  isPresent: boolean
  /**
   * Function to set the node (as early as possible)
   */
  setNode(node: HTMLElement | null): void
}

type PrivateContext = {
  node: HTMLElement | null
  styles: CSSStyleDeclaration | null
  prevPresent?: boolean
  prevAnimationName: string
}

export type UserDefinedContext = PublicContext

export type MachineContext = PublicContext & PrivateContext

export type MachineState = {
  value: "mounted" | "unmountSuspended" | "unmounted"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
