import type { StateMachine as S } from "@zag-js/core"
import { Context } from "@zag-js/types"

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
   * @internal The slider thumbs dimensions
   */
  thumbSize: Array<{ width: number; height: number }> | null
  /**
   * @computed Whether the slider thumb has been measured
   */
  readonly hasMeasuredThumbSize: boolean
  /**
   * The name associated with each slider thumb (when used in a form)
   */
  name?: string
  /**
   * The move threshold of the slider thumb before it is considered to be moved
   */
  threshold: number
  /**
   * @internal The active index of the range slider. This represents
   * the currently dragged/focused thumb.
   */
  activeIndex: number
  /**
   * The value of the range slider
   */
  value: number[]
  /**
   * The value of the slider when it was initially rendered.
   * Used when the `form.reset(...)` is called.
   */
  initialValue: number[]
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean
  /**
   * Whether the slider is read-only
   */
  readonly?: boolean
  /**
   * @computed Whether the slider is interactive
   */
  readonly isInteractive: boolean
  /**
   * Function invoked when the value of the slider changes
   */
  onChange?(details: { value: number[] }): void
  /**
   * Function invoked when the slider value change is started
   */
  onChangeStart?(details: { value: number[] }): void
  /**
   * Function invoked when the slider value change is done
   */
  onChangeEnd?(details: { value: number[] }): void
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
   * The raw value of the space between each thumb
   */
  readonly spacing: number
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
