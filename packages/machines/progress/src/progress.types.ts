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

export interface ValueTranslationDetails {
  value: number | null
  max: number
  min: number
  percent: number
}

export interface IntlTranslations {
  value(details: ValueTranslationDetails): string
}

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   *  The current value of the progress bar.
   */
  value: number | null
  /**
   * The minimum allowed value of the progress bar.
   */
  min: number
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
  /**
   * @computed
   * Whether the progress bar is in RTL mode.
   */
  isRtl: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface ViewProps {
  state: ProgressState
}

export interface MachineApi<T extends PropTypes> {
  /**
   * The current value of the progress bar.
   */
  value: number | null
  /**
   * The current value of the progress bar as a string.
   */
  valueAsString: string
  /**
   * Sets the current value of the progress bar.
   */
  setValue(value: number | null): void
  /**
   * Sets the current value of the progress bar to the max value.
   */
  setToMax(): void
  rootProps: T["element"]
  labelProps: T["element"]
  trackProps: T["element"]
  valueTextProps: T["element"]
  rangeProps: T["element"]
  getViewProps(props: ViewProps): T["element"]
  circleProps: T["svg"]
  circleTrackProps: T["circle"]
  circleRangeProps: T["circle"]
}
