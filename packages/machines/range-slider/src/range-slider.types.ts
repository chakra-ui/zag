import type { StateMachine as S } from "@ui-machines/core"
import { Context } from "@ui-machines/types"

export type MachineContext = Context<{
  /**
   * The aria-label of each slider thumb. Useful for providing an accessible name to the slider
   */
  "aria-label"?: string[]
  /**
   * The `id` of the elements that labels each slider thumb. Useful for providing an accessible name to the slider
   */
  "aria-labelledby"?: string[]
  /**
   * The slider thumbs dimensions
   */
  thumbSize: Array<{ width: number; height: number }> | null
  /**
   * The name associated with each slider thumb (when used in a form)
   */
  name?: string[]
  /**
   * The move threshold of the slider thumb before it is considered to be moved
   */
  threshold: number
  /**
   * The active index of the range slider. This represents
   * the currently dragged/focused thumb.
   */
  activeIndex: number
  /**
   * The value of the range slider
   */
  value: number[]
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean
  /**
   * Whether the slider is read-only
   */
  readonly?: boolean
  readonly isInteractive: boolean
  /**
   * Function invoked when the value of the slider changes
   */
  onChange?(value: number[]): void
  /**
   * Function invoked when the slider value change is started
   */
  onChangeStart?(value: number[]): void
  /**
   * Function invoked when the slider value change is done
   */
  onChangeEnd?(value: number[]): void
  /**
   * Function that returns a human readable value for the slider thumb
   */
  getAriaValueText?(value: number, index: number): string
  /**
   * The minimum value of the slider
   */
  min: number
  /**
   * The maximum value of the slider
   */
  max: number
  /**
   * The step value of the slider
   */
  step: number
  /**
   * The minimum permitted steps between multiple thumbs.
   */
  minStepsBetweenThumbs: number
  /**
   * The orientation of the slider
   */
  orientation: "vertical" | "horizontal"
  /**
   * @computed Whether the slider is vertical
   */
  readonly isVertical: boolean
  /**
   * @computed Whether the slider is horizontal
   */
  readonly isHorizontal: boolean
  /**
   * @computed Whether the slider is in RTL mode
   */
  readonly isRtl: boolean
}>

export type MachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
