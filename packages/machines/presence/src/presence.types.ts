import type { StateMachine as S } from "@zag-js/core"

type PublicContext = {
  present: boolean
  onExitComplete?: () => void
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
