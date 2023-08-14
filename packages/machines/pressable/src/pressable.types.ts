import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual"

export interface Rect {
  top: number
  right: number
  bottom: number
  left: number
}

export interface EventPoint {
  clientX: number
  clientY: number
  width?: number
  height?: number
  radiusX?: number
  radiusY?: number
}

export interface PressEvent {
  /**
   * The type of press event being fired.
   */
  type: "pressstart" | "pressend" | "pressup" | "press" | "longpress"
  /**
   * The pointer type that triggered the press event.
   */
  pointerType: PointerType
  /**
   * The target element of the press event.
   */
  target: HTMLElement
}

export type PressHandlers = {
  /**
   * Handler that is called when the press is released over the target.
   */
  onPress?: (event: PressEvent) => void
  /**
   * Handler that is called when a press interaction starts.
   */
  onPressStart?: (event: PressEvent) => void
  /**
   * Handler that is called when a press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onPressEnd?: (event: PressEvent) => void
  /**
   * Handler that is called when a press is released over the target, regardless of
   * whether it started on the target or not.
   */
  onPressUp?: (event: PressEvent) => void
  /**
   * Handler that is called when the element has been pressed for 500 milliseconds
   */
  onLongPress?: (event: PressEvent) => void
}

type PublicContext = DirectionProperty &
  CommonProperties &
  PressHandlers & {
    /**
     * Whether the element is disabled
     */
    disabled?: boolean
    /**
     * Whether the target should not receive focus on press.
     */
    preventFocusOnPress?: boolean
    /**
     * Whether press events should be canceled when the pointer leaves the target while pressed.
     *
     * By default, this is `false`, which means if the pointer returns back over the target while
     * still pressed, onPressStart will be fired again.
     *
     * If set to `true`, the press is canceled when the pointer leaves the target and
     * onPressStart will not be fired if the pointer returns.
     */
    cancelOnPointerExit?: boolean
    /**
     * Whether text selection should be enabled on the pressable element.
     */
    allowTextSelectionOnPress?: boolean
    /**
     * The amount of time (in milliseconds) to wait before firing the `onLongPress` event.
     */
    longPressDelay: number
  }

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the element is pressed.
   */
  isPressed: boolean
  pressableProps: T["element"]
}

interface FocusableElement extends HTMLElement, HTMLOrSVGElement {}

type PrivateContext = Context<{
  ignoreClickAfterPress: boolean
  target: FocusableElement | null
  pointerId: number | null
  pointerType: PointerType | null
  cleanups: VoidFunction[]
  wasPressedDown: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "pressed:in" | "pressed:out"
  tags: "pressed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
