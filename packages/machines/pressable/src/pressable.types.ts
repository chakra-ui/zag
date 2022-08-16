import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

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
  /** The type of press event being fired. */
  type: "pressstart" | "pressend" | "pressup" | "press" | "longpress"
  /** The pointer type that triggered the press event. */
  pointerType: PointerType
  /** The target element of the press event. */
  target: HTMLElement
  /** The original fired event */
  originalEvent?: PointerEvent
}

type PublicContext = DirectionProperty &
  Omit<CommonProperties, "id"> & {
    id: string | null
    /**
     * The pressable element when we don't want to spread props
     */
    getElement?: () => HTMLElement | null
    /**
     * Whether the element is disabled
     */
    disabled?: boolean

    /** Whether the target should not receive focus on press. */
    preventFocusOnPress?: boolean
    /**
     * Whether press events should be canceled when the pointer leaves the target while pressed.
     * By default, this is `false`, which means if the pointer returns back over the target while
     * still pressed, onPressStart will be fired again. If set to `true`, the press is canceled
     * when the pointer leaves the target and onPressStart will not be fired if the pointer returns.
     */
    shouldCancelOnPointerExit?: boolean
    /** Whether text selection should be enabled on the pressable element. */
    allowTextSelectionOnPress?: boolean

    /** Handler that is called when the press is released over the target. */
    onPress?: (e: PressEvent) => void
    /** Handler that is called when a press interaction starts. */
    onPressStart?: (e: PressEvent) => void
    /**
     * Handler that is called when a press interaction ends, either
     * over the target or when the pointer leaves the target.
     */
    onPressEnd?: (e: PressEvent) => void

    /**
     * Handler that is called when a press is released over the target, regardless of
     * whether it started on the target or not.
     */
    onPressUp?: (e: PressEvent) => void
    /**
     * Handler that is called when the element has been pressed for 500 milliseconds
     */
    onLongPress?: (e: PressEvent) => void
  }

export interface FocusableElement extends Element, HTMLOrSVGElement {}

type PrivateContext = Context<{
  ignoreClickAfterPress: boolean
  activePointerId: any
  target: FocusableElement | null
  pointerdownEvent: PointerEvent | null
  pointerType: PointerType | null
  userSelect?: string
  abortController: AbortController | null
}>

export type UserDefinedContext = RequiredBy<PublicContext, "getElement"> | RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown" | "idle" | "pressed" | "pressedout"
  tags: "pressed" | "unpressed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
