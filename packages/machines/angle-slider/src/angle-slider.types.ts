import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

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

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the machine.
   * Useful for composition.
   */
  ids?: Partial<ElementIds>
  /**
   * The step value for the slider.
   * @default 1
   */
  step: number
  /**
   * The value of the slider.
   * @default 0
   */
  value: number
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

interface PrivateContext {}

type ComputedContext = Readonly<{
  /**
   * Whether the slider is interactive.
   */
  interactive: boolean
  /**
   * The value of the slider as a degree string.
   */
  valueAsDegree: string
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

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
