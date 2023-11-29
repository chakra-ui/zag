import type { StateMachine as S } from "@zag-js/core"
import type {
  CommonProperties,
  Context,
  DirectionProperty,
  OrientationProperty,
  PropTypes,
  RequiredBy,
} from "@zag-js/types"

export type ProgressState = "indeterminate" | "loading" | "complete"

export interface ValueLabelOptions {
  value: number | null
  max: number
  percent: number
}

interface IntlTranslations {
  value(opts: ValueLabelOptions): string
}

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   *  The current value of the progress bar.
   */
  value: number | null
  /**
   * The maximum allowed value of the progress bar.
   */
  max: number
  /**
   * The localized messages to use.
   */
  translations: IntlTranslations
}

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the progress bar is indeterminate.
   */
  isIndeterminate: boolean
  /**
   * @computed
   * The percentage of the progress bar's value.
   */
  percent: number
  /**
   * @computed
   * Whether the progress bar is at its minimum value.
   */
  isAtMax: boolean
  /**
   * @computed
   *  Whether the progress bar is horizontal.
   */
  isHorizontal: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface IndicatorProps {
  state: ProgressState
}

export interface MachineApi<T extends PropTypes> {
  value: number | null
  valueAsString: string
  setValue(value: number | null): void
  setToMax(): void
  rootProps: T["element"]
  labelProps: T["element"]
  trackProps: T["element"]
  valueTextProps: T["element"]
  rangeProps: T["element"]
  getIndicatorProps(props: IndicatorProps): T["element"]
}
