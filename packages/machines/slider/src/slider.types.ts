import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: number[]
}

export interface FocusChangeDetails {
  focusedIndex: number
  value: number[]
}

export interface ValueTextDetails {
  value: number
  index: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  thumb(index: number): string
  hiddenInput(index: number): string
  control: string
  track: string
  range: string
  label: string
  valueText: string
  marker(index: number): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
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
  onValueChange?(details: ValueChangeDetails): void
  /**
   * Function invoked when the slider value change is done
   */
  onValueChangeEnd?(details: ValueChangeDetails): void
  /**
   * Function invoked when the slider's focused index changes
   */
  onFocusChange?(details: FocusChangeDetails): void
  /**
   * Function that returns a human readable value for the slider thumb
   */
  getAriaValueText?(details: ValueTextDetails): string
  /**
   * The minimum value of the slider
   * @default 0
   */
  min: number
  /**
   * The maximum value of the slider
   * @default 100
   */
  max: number
  /**
   * The step value of the slider
   * @default 1
   */
  step: number
  /**
   * The minimum permitted steps between multiple thumbs.
   * @default 0
   */
  minStepsBetweenThumbs: number
  /**
   * The orientation of the slider
   * @default "horizontal"
   */
  orientation: "vertical" | "horizontal"
  /**
   * The origin of the slider range
   * - "start": Useful when the value represents an absolute value
   * - "center": Useful when the value represents an offset (relative)
   *
   * @default "start"
   */
  origin?: "start" | "center"
  /**
   * The alignment of the slider thumb relative to the track
   * - `center`: the thumb will extend beyond the bounds of the slider track.
   * - `contain`: the thumb will be contained within the bounds of the track.
   *
   * @default "contain"
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

interface PrivateContext {
  /**
   * @internal
   * The active index of the range slider. This represents
   * the currently dragged/focused thumb.
   */
  focusedIndex: number
  /**
   * @internal
   * Whether the slider fieldset is disabled
   */
  fieldsetDisabled: boolean
}

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "idle" | "dragging" | "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

interface Size {
  width: number
  height: number
}

export interface MarkerProps {
  value: number
}

export interface ThumbProps {
  index: number
  name?: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the slider.
   */
  value: number[]
  /**
   * Whether the slider is being dragged.
   */
  dragging: boolean
  /**
   * Whether the slider is focused.
   */
  focused: boolean
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
  getLabelProps(): T["label"]
  getRootProps(): T["element"]
  getValueTextProps(): T["element"]
  getTrackProps(): T["element"]
  getThumbProps(props: ThumbProps): T["element"]
  getHiddenInputProps(props: ThumbProps): T["input"]
  getRangeProps(): T["element"]
  getControlProps(): T["element"]
  getMarkerGroupProps(): T["element"]
  getMarkerProps(props: MarkerProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export interface SharedContext {
  min: number
  max: number
  step: number
  dir?: "ltr" | "rtl"
  isRtl: boolean
  isVertical: boolean
  isHorizontal: boolean
  value: number
  thumbSize: Size | null
  thumbAlignment?: "contain" | "center"
  orientation?: "horizontal" | "vertical"
  readonly hasMeasuredThumbSize: boolean
}
