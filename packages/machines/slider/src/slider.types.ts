import type { EventObject, Machine, Service } from "@zag-js/core"
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
  thumb: (index: number) => string
  hiddenInput: (index: number) => string
  control: string
  track: string
  range: string
  label: string
  valueText: string
  marker: (index: number) => string
}>

export interface SliderProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the slider. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The aria-label of each slider thumb. Useful for providing an accessible name to the slider
   */
  "aria-label"?: string[] | undefined
  /**
   * The `id` of the elements that labels each slider thumb. Useful for providing an accessible name to the slider
   */
  "aria-labelledby"?: string[] | undefined
  /**
   * The name associated with each slider thumb (when used in a form)
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input element.
   */
  form?: string | undefined
  /**
   * The controlled value of the slider
   */
  value?: number[] | undefined
  /**
   * The initial value of the slider when rendered.
   * Use when you don't need to control the value of the slider.
   */
  defaultValue?: number[] | undefined
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the slider is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the slider is invalid
   */
  invalid?: boolean | undefined
  /**
   * Function invoked when the value of the slider changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function invoked when the slider value change is done
   */
  onValueChangeEnd?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function invoked when the slider's focused index changes
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * Function that returns a human readable value for the slider thumb
   */
  getAriaValueText?: ((details: ValueTextDetails) => string) | undefined
  /**
   * The minimum value of the slider
   * @default 0
   */
  min?: number | undefined
  /**
   * The maximum value of the slider
   * @default 100
   */
  max?: number | undefined
  /**
   * The step value of the slider
   * @default 1
   */
  step?: number | undefined
  /**
   * The minimum permitted steps between multiple thumbs.
   *
   * `minStepsBetweenThumbs` * `step` should reflect the gap between the thumbs.
   *
   * - `step: 1` and `minStepsBetweenThumbs: 10` => gap is `10`
   * - `step: 10` and `minStepsBetweenThumbs: 2` => gap is `20`
   *
   * @default 0
   */
  minStepsBetweenThumbs?: number | undefined
  /**
   * The orientation of the slider
   * @default "horizontal"
   */
  orientation?: "vertical" | "horizontal" | undefined
  /**
   * The origin of the slider range. The track is filled from the origin
   * to the thumb for single values.
   * - "start": Useful when the value represents an absolute value
   * - "center": Useful when the value represents an offset (relative)
   * - "end": Useful when the value represents an offset from the end
   *
   * @default "start"
   */
  origin?: "start" | "center" | "end" | undefined
  /**
   * The alignment of the slider thumb relative to the track
   * - `center`: the thumb will extend beyond the bounds of the slider track.
   * - `contain`: the thumb will be contained within the bounds of the track.
   *
   * @default "contain"
   */
  thumbAlignment?: "contain" | "center" | undefined
  /**
   * The slider thumbs dimensions
   */
  thumbSize?: { width: number; height: number } | undefined
}

type PropsWithDefault =
  | "dir"
  | "min"
  | "max"
  | "step"
  | "orientation"
  | "defaultValue"
  | "origin"
  | "thumbAlignment"
  | "minStepsBetweenThumbs"

type Computed = Readonly<{
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

interface Context {
  /**
   * The active index of the range slider. This represents
   * the currently dragged/focused thumb.
   */
  focusedIndex: number
  /**
   * @internal
   * Whether the slider fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * The value of the range slider
   */
  value: number[]
  /**
   * The size of the slider thumbs
   */
  thumbSize: Size | null
}

export interface SliderSchema {
  state: "idle" | "dragging" | "focus"
  props: RequiredBy<SliderProps, PropsWithDefault>
  context: Context
  refs: {
    /**
     * The offset from the thumb center when pointer down occurs.
     * Used to maintain constant offset during drag.
     */
    thumbDragOffset: { x: number; y: number } | null
  }
  computed: Computed
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type SliderService = Service<SliderSchema>

export type SliderMachine = Machine<SliderSchema>

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
  name?: string | undefined
}

export interface DraggingIndicatorProps {
  index: number
}

export interface SliderApi<T extends PropTypes = PropTypes> {
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
  setValue: (value: number[]) => void
  /**
   * Returns the value of the thumb at the given index.
   */
  getThumbValue: (index: number) => number
  /**
   * Sets the value of the thumb at the given index.
   */
  setThumbValue: (index: number, value: number) => void
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
  getThumbPercent: (index: number) => number
  /**
   * Sets the percent of the thumb at the given index.
   */
  setThumbPercent: (index: number, percent: number) => void
  /**
   * Returns the min value of the thumb at the given index.
   */
  getThumbMin: (index: number) => number
  /**
   * Returns the max value of the thumb at the given index.
   */
  getThumbMax: (index: number) => number
  /**
   * Function to increment the value of the slider at the given index.
   */
  increment: (index: number) => void
  /**
   * Function to decrement the value of the slider at the given index.
   */
  decrement: (index: number) => void
  /**
   * Function to focus the slider. This focuses the first thumb.
   */
  focus: VoidFunction

  getLabelProps: () => T["label"]
  getRootProps: () => T["element"]
  getValueTextProps: () => T["element"]
  getTrackProps: () => T["element"]
  getThumbProps: (props: ThumbProps) => T["element"]
  getHiddenInputProps: (props: ThumbProps) => T["input"]
  getRangeProps: () => T["element"]
  getControlProps: () => T["element"]
  getMarkerGroupProps: () => T["element"]
  getMarkerProps: (props: MarkerProps) => T["element"]
  getDraggingIndicatorProps: (props: DraggingIndicatorProps) => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export interface SharedContext {
  min: number
  max: number
  step: number
  dir?: "ltr" | "rtl" | undefined
  isRtl: boolean
  isVertical: boolean
  isHorizontal: boolean
  value: number
  thumbSize: Size | null
  thumbAlignment?: "contain" | "center" | undefined
  orientation?: "horizontal" | "vertical" | undefined
  readonly hasMeasuredThumbSize: boolean
}
