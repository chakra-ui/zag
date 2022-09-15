import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  separator(index: number): string
  pane(index: number): string
}>

export type PaneProps = {
  index: number
}

export type SeparatorProps = {
  index: number
}

type ChangeDetails = {
  value: number
  index: number
  values: PublicContext["values"]
}

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the splitter. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Whether to allow the separator to be dragged.
     */
    fixed?: boolean[]
    /**
     * The orientation of the split view.
     */
    orientation: "horizontal" | "vertical"
    /**
     * The minimum size of a pane.
     */
    min: number | number[]
    /**
     * The maximum size of a pane.
     */
    max: number | number[]
    /**
     * The size of the panes.
     */
    values: number[]
    /**
     * The step increments of a pane when it is dragged
     * or resized with keyboard.
     */
    step: number | number[]
    /**
     * Callback to be invoked when a pane is resized.
     */
    onChange?: (details: ChangeDetails) => void
    /**
     * Callback to be invoked when a pane's resize session starts
     */
    onChangeStart?: (details: ChangeDetails) => void
    /**
     * Callback to be invoked when a pane's resize session ends
     */
    onChangeEnd?: (details: ChangeDetails) => void
    /**
     * The minimum offset needed to snap a pane to its minimum or maximum size.
     */
    snapOffset: number | number[]
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the orientation is horizontal.
   */
  isHorizontal: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The default values
   */
  defaultValues: PublicContext["values"]
  /**
   * @internal
   * The focused spearator
   */
  focusedSeparator: number | null
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
