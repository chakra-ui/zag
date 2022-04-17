import { StateMachine as S } from "@zag-js/core"
import { Context, DirectionProperty } from "@zag-js/types"

/////////////////////////////////////////////////////////////////////////

type ElementIds = Partial<{
  root: string
  splitter: string
  label: string
  toggleBtn: string
  primaryPane: string
  secondaryPane: string
}>

/////////////////////////////////////////////////////////////////////////

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the splitter. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether to allow the separator to be dragged.
   */
  fixed?: boolean
  /**
   * The orientation of the split view.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The minimum size of the primary pane.
   */
  min: number
  /**
   * The maximum size of the primary pane.
   */
  max: number
  /**
   * The size of the primary pane.
   */
  value: number
  /**
   * The step increments of the primary pane when it is dragged
   * or resized with keyboard.
   */
  step: number
  /**
   * Callback to be invoked when the primary pane is resized.
   */
  onChange?: (details: { value: number }) => void
  /**
   * Callback to be invoked when the primary pane's resize session starts
   */
  onChangeStart?: (details: { value: number }) => void
  /**
   * Callback to be invoked when the primary pane's resize session ends
   */
  onChangeEnd?: (details: { value: number }) => void
  /**
   * Whether the primary pane is disabled.
   */
  disabled?: boolean
  /**
   * The minimum offset needed to snap the primary pane to its minimum or maximum size.
   */
  snapOffset: number
}

export type UserDefinedContext = Partial<PublicContext>

/////////////////////////////////////////////////////////////////////////

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the primary pane is at its minimum size.
   */
  isAtMin: boolean
  /**
   * @computed
   * Whether the primary pane is at its maximum size.
   */
  isAtMax: boolean
  /**
   * @computed
   * Whether the orientation is horizontal.
   */
  isHorizontal: boolean
}>

/////////////////////////////////////////////////////////////////////////

type PrivateContext = Context<{}>

/////////////////////////////////////////////////////////////////////////

export type MachineContext = PublicContext & ComputedContext & PrivateContext

/////////////////////////////////////////////////////////////////////////

export type MachineState = {
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

/////////////////////////////////////////////////////////////////////////

export type Send = S.Send<S.AnyEventObject>
