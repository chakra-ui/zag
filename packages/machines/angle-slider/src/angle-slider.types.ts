import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"
import type { EventObject, Service } from "@zag-mini/core"

export interface ElementIds {
  root: string
  thumb: string
  hiddenInput: string
  control: string
  valueText: string
}

export interface ValueChangeDetails {
  value: number
  valueAsDegree: string
}

export interface AngleSliderProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the machine.
   * Useful for composition.
   */
  ids?: Partial<ElementIds>
  /**
   * The step value for the slider.
   * @default 1
   */
  step?: number
  /**
   * The value of the slider.
   */
  value?: number
  /**
   * The default value of the slider.
   * @default 0
   */
  defaultValue?: number
  /**
   * The callback function for when the value changes.
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * The callback function for when the value changes ends.
   */
  onValueChangeEnd?: (details: ValueChangeDetails) => void
  /**
   * Whether the slider is disabled.
   */
  disabled?: boolean
  /**
   * Whether the slider is read-only.
   */
  readOnly?: boolean
  /**
   * Whether the slider is invalid.
   */
  invalid?: boolean
  /**
   * The name of the slider. Useful for form submission.
   */
  name?: string
}

export interface AngleSliderSchema {
  state: "idle" | "focused" | "dragging"
  props: AngleSliderProps
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

export interface MarkerProps {
  /**
   * The value of the marker
   */
  value: number
}

export interface MachineApi<T extends PropTypes = PropTypes> {
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
  setValue(value: number): void
  /**
   * Whether the slider is being dragged.
   */
  dragging: boolean

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getHiddenInputProps(): T["element"]
  getControlProps(): T["element"]
  getThumbProps(): T["element"]
  getValueTextProps(): T["element"]
  getMarkerGroupProps(): T["element"]
  getMarkerProps(props: MarkerProps): T["element"]
}
