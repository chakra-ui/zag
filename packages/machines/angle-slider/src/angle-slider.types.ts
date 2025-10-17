import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EventObject, Machine, Service } from "@zag-js/core"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: number
  valueAsDegree: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  thumb: string
  hiddenInput: string
  control: string
  valueText: string
  label: string
}>

export interface AngleSliderProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the machine.
   * Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The step value for the slider.
   * @default 1
   */
  step?: number | undefined
  /**
   * The value of the slider.
   */
  value?: number | undefined
  /**
   * The initial value of the slider.
   * Use when you don't need to control the value of the slider.
   * @default 0
   */
  defaultValue?: number | undefined
  /**
   * The callback function for when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The callback function for when the value changes ends.
   */
  onValueChangeEnd?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Whether the slider is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the slider is read-only.
   */
  readOnly?: boolean | undefined
  /**
   * Whether the slider is invalid.
   */
  invalid?: boolean | undefined
  /**
   * The name of the slider. Useful for form submission.
   */
  name?: string | undefined
  /**
   * The accessible label for the slider thumb.
   */
  "aria-label"?: string | undefined
  /**
   * The id of the element that labels the slider thumb.
   */
  "aria-labelledby"?: string | undefined
}

type PropsWithDefault = "step" | "defaultValue"

export interface AngleSliderSchema {
  state: "idle" | "focused" | "dragging"
  props: RequiredBy<AngleSliderProps, PropsWithDefault>
  computed: {
    interactive: boolean
    valueAsDegree: string
  }
  context: {
    value: number
  }
  action: string
  event: EventObject
  effect: string
  guard: string
}

export type AngleSliderService = Service<AngleSliderSchema>

export type AngleSliderMachine = Machine<AngleSliderSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MarkerProps {
  /**
   * The value of the marker
   */
  value: number
}

export interface AngleSliderApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the angle slider
   */
  value: number
  /**
   * The current value as a degree string
   */
  valueAsDegree: string
  /**
   * Sets the value of the angle slider
   */
  setValue: (value: number) => void
  /**
   * Whether the slider is being dragged.
   */
  dragging: boolean

  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getHiddenInputProps: () => T["element"]
  getControlProps: () => T["element"]
  getThumbProps: () => T["element"]
  getValueTextProps: () => T["element"]
  getMarkerGroupProps: () => T["element"]
  getMarkerProps: (props: MarkerProps) => T["element"]
}
