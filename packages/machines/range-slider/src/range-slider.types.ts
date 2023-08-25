import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  thumb(index: number): string
  control: string
  track: string
  range: string
  label: string
  output: string
  marker(index: number): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the range slider. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The aria-label of each slider thumb. Useful for providing an accessible name to the slider
     */
    "aria-label"?: string[]
    /**
     * The `id` of the elements that labels each slider thumb. Useful for providing an accessible name to the slider
     */
    "aria-labelledby"?: string[]
    /**
     * The name associated with each slider thumb (when used in a form)
     */
    name?: string
    /**
     * The associate form of the underlying input element.
     */
    form?: string
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
    readOnly?: boolean
    /**
     * Whether the slider is invalid
     */
    invalid?: boolean
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
     * Function invoked when the slider's focused index changes
     */
    onFocusChange?(details: { index: number; value: number[] }): void
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
     * The alignment of the slider thumb relative to the track
     * - `center`: the thumb will extend beyond the bounds of the slider track.
     * - `contain`: the thumb will be contained within the bounds of the track.
     */
    thumbAlignment?: "contain" | "center"
    /**
     * The slider thumbs dimensions
     */
    thumbSize: { width: number; height: number } | null
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the slider thumb has been measured
   */
  hasMeasuredThumbSize: boolean
  /**
   * @computed
   * Whether the slider is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * The raw value of the space between each thumb
   */
  spacing: number
  /**
   * @computed
   * Whether the slider is vertical
   */
  isVertical: boolean
  /**
   * @computed
   * Whether the slider is horizontal
   */
  isHorizontal: boolean
  /**
   * @computed
   * Whether the slider is in RTL mode
   */
  isRtl: boolean
  /**
   * @computed
   * The percentage of the slider value relative to the slider min/max
   */
  valuePercent: number[]
  /**
   * @computed
   * Whether the slider is disabled
   */
  isDisabled: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The active index of the range slider. This represents
   * the currently dragged/focused thumb.
   */
  focusedIndex: number
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

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * The value of the slider.
   */
  value: number[]
  /**
   * Whether the slider is being dragged.
   */
  isDragging: boolean
  /**
   * Whether the slider is focused.
   */
  isFocused: boolean
  /**
   * Function to set the value of the slider.
   */
  setValue(value: number[]): void
  /**
   * Returns the value of the thumb at the given index.
   */
  getThumbValue(index: number): number
  /**
   * Sets the value of the thumb at the given index.
   */
  setThumbValue(index: number, value: number): void
  /**
   * Returns the percent of the thumb at the given index.
   */
  getValuePercent: (value: number) => number
  /**
   * Returns the value of the thumb at the given percent.
   */
  getPercentValue: (percent: number) => number
  /**
   * Returns the percent of the thumb at the given index.
   */
  getThumbPercent(index: number): number
  /**
   * Sets the percent of the thumb at the given index.
   */
  setThumbPercent(index: number, percent: number): void
  /**
   * Returns the min value of the thumb at the given index.
   */
  getThumbMin(index: number): number
  /**
   * Returns the max value of the thumb at the given index.
   */
  getThumbMax(index: number): number
  /**
   * Function to increment the value of the slider at the given index.
   */
  increment(index: number): void
  /**
   * Function to decrement the value of the slider at the given index.
   */
  decrement(index: number): void
  /**
   * Function to focus the slider. This focuses the first thumb.
   */
  focus(): void
  labelProps: T["label"]
  rootProps: T["element"]
  outputProps: T["output"]
  trackProps: T["element"]
  getThumbProps(index: number): T["element"]
  getHiddenInputProps(index: number): T["input"]
  rangeProps: T["element"]
  controlProps: T["element"]
  markerGroupProps: T["element"]
  getMarkerProps({ value }: { value: number }): T["element"]
}
