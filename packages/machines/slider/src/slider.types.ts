import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  thumb: string
  control: string
  track: string
  range: string
  label: string
  output: string
  hiddenInput: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the slider. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The value of the slider
     */
    value: number
    /**
     * The name associated with the slider (when used in a form)
     */
    name?: string
    /**
     * The associate form of the underlying input element.
     */
    form?: string
    /**
     * Whether the slider is disabled
     */
    disabled?: boolean
    /**
     * Whether the slider is read-only
     */
    readOnly?: boolean
    /**
     * Whether the slider value is invalid
     */
    invalid?: boolean
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
    onChange?(details: { value: number }): void
    /**
     * Function invoked when the slider value change is done
     */
    onChangeEnd?(details: { value: number }): void
    /**
     * Function invoked when the slider value change is started
     */
    onChangeStart?(details: { value: number }): void
    /**
     * The alignment of the slider thumb relative to the track
     * - `center`: the thumb will extend beyond the bounds of the slider track.
     * - `contain`: the thumb will be contained within the bounds of the track.
     */
    thumbAlignment?: "contain" | "center"
    /**
     * The slider thumb dimensions.If not provided, the thumb size will be measured automatically.
     */
    thumbSize: { width: number; height: number } | null
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the slider is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether the thumb size has been measured
   */
  hasMeasuredThumbSize: boolean
  /**
   * @computed
   * Whether the slider is horizontal
   */
  isHorizontal: boolean
  /**
   * @computed
   * Whether the slider is vertical
   */
  isVertical: boolean
  /**
   * @computed
   * Whether the slider is in RTL mode
   */
  isRtl: boolean
  /**
   * @computed
   * The value of the slider as a percentage
   */
  valuePercent: number
  /**
   * @computed
   * Whether the slider is disabled
   */
  isDisabled: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The move threshold of the slider thumb before it is considered to be moved
   */
  threshold: number
  /**
   * @internal
   * Whether the slider fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "idle" | "dragging" | "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type SharedContext = {
  min: number
  max: number
  step: number
  dir?: "ltr" | "rtl"
  isRtl: boolean
  isVertical: boolean
  isHorizontal: boolean
  value: number
  thumbSize: { width: number; height: number } | null
  thumbAlignment?: "contain" | "center"
  orientation?: "horizontal" | "vertical"
  readonly hasMeasuredThumbSize: boolean
}

export type Point = {
  x: number
  y: number
}

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the slider is focused.
   */
  isFocused: boolean
  /**
   * Whether the slider is being dragged.
   */
  isDragging: boolean
  /**
   * The value of the slider.
   */
  value: number
  /**
   * The value of the slider as a percent.
   */
  percent: number
  /**
   * Function to set the value of the slider.
   */
  setValue(value: number): void
  /**
   * Returns the value of the slider at the given percent.
   */
  getPercentValue: (percent: number) => number
  /**
   * Returns the percent of the slider at the given value.
   */
  getValuePercent: (value: number) => number
  /**
   * Function to focus the slider.
   */
  focus(): void
  /**
   * Function to increment the value of the slider by the step.
   */
  increment(): void
  /**
   * Function to decrement the value of the slider by the step.
   */
  decrement(): void
  rootProps: T["element"]
  labelProps: T["label"]
  thumbProps: T["element"]
  hiddenInputProps: T["input"]
  outputProps: T["output"]
  trackProps: T["element"]
  rangeProps: T["element"]
  controlProps: T["element"]
  markerGroupProps: T["element"]
  getMarkerProps({ value }: { value: number }): T["element"]
}
