import { Context } from "@zag-js/types"

export type MachineContext = Context<{
  /**
   * The value of the slider
   */
  value: number
  /**
   * The name associated with the slider (when used in a form)
   */
  name?: string
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean
  /**
   * Whether the slider is read-only
   */
  readonly?: boolean
  /**
   * Whether the slider value is invalid
   */
  invalid?: boolean
  /**
   * @computed Whether the slider is interactive
   */
  readonly isInteractive: boolean
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
   * @internal The move threshold of the slider thumb before it is considered to be moved
   */
  threshold: number
  /**
   * The orientation of the slider
   */
  orientation?: "vertical" | "horizontal"
  /**
   * - "start": Useful when the value represents an absolute value
   * - "center": Useful when the value represents an offset (relative)
   */
  origin?: "start" | "center"
  /**
   * The aria-label of the slider. Useful for providing an accessible name to the slider
   */
  "aria-label"?: string
  /**
   * The `id` of the element that labels the slider. Useful for providing an accessible name to the slider
   */
  "aria-labelledby"?: string
  /**
   * Whether to focus the slider thumb after interaction (scrub and keyboard)
   */
  focusThumbOnChange?: boolean
  /**
   * Function that returns a human readable value for the slider
   */
  getAriaValueText?(value: number): string
  /**
   * Function invoked when the value of the slider changes
   */
  onChange?(value: number): void
  /**
   * Function invoked when the slider value change is done
   */
  onChangeEnd?(value: number): void
  /**
   * Function invoked when the slider value change is started
   */
  onChangeStart?(value: number): void
  /**
   * @internal The slider thumb dimensions
   */
  thumbSize: { width: number; height: number }
  /**
   * @computed Whether the slider is horizontal
   */
  readonly isHorizontal: boolean
  /**
   * @computed Whether the slider is vertical
   */
  readonly isVertical: boolean
  /**
   * @computed Whether the slider is in RTL mode
   */
  readonly isRtl: boolean
}>

export type SharedContext = {
  min: number
  max: number
  step: number
  dir?: "ltr" | "rtl"
  isRtl: boolean
  isVertical: boolean
  isHorizontal: boolean
  value: number
  thumbSize: { width: number; height: number }
  orientation?: "horizontal" | "vertical"
}

export type MachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}
