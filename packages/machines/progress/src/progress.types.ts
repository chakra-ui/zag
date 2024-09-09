import type { Machine, StateMachine as S } from "@zag-js/core"
import type {
  CommonProperties,
  DirectionProperty,
  Orientation,
  OrientationProperty,
  PropTypes,
  RequiredBy,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

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

export type ElementIds = Partial<{
  root: string
  track: string
  label: string
  circle: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the progress bar. Useful for composition.
   */
  ids?: ElementIds
  /**
   *  The current value of the progress bar.
   * @default 50
   */
  value: number | null
  /**
   * The minimum allowed value of the progress bar.
   * @default 0
   */
  min: number
  /**
   * The maximum allowed value of the progress bar.
   * @default 100
   */
  max: number
  /**
   * The localized messages to use.
   */
  translations: IntlTranslations
}

interface PrivateContext {}

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

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

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
  /**
   * Sets the current value of the progress bar to the min value.
   */
  setToMin(): void
  /**
   * The percentage of the progress bar's value.
   */
  percent: number
  /**
   * The percentage of the progress bar's value as a string.
   */
  percentAsString: string
  /**
   * The minimum allowed value of the progress bar.
   */
  min: number
  /**
   * The maximum allowed value of the progress bar.
   */
  max: number
  /**
   * Whether the progress bar is indeterminate.
   */
  indeterminate: boolean

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getTrackProps(): T["element"]
  getValueTextProps(): T["element"]
  getRangeProps(): T["element"]
  getViewProps(props: ViewProps): T["element"]
  getCircleProps(): T["svg"]
  getCircleTrackProps(): T["circle"]
  getCircleRangeProps(): T["circle"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
