import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { StrokeOptions } from "perfect-freehand"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

interface Point {
  x: number
  y: number
  pressure: number
}

export interface DrawDetails {
  paths: string[]
}

export interface DrawingOptions extends StrokeOptions {
  /**
   * The color of the stroke.
   * Note: Must be a valid CSS color string, not a css variable.
   */
  fill?: string
}

export type DataUrlType = "image/png" | "image/jpeg" | "image/svg+xml"

export interface DrawEndDetails {
  paths: string[]
  getDataUrl(type: DataUrlType, quality?: number): Promise<string>
}

export interface DataUrlOptions {
  type: DataUrlType
  quality?: number
}

export type ElementIds = Partial<{
  root: string
  control: string
  hiddenInput: string
  label: string
}>

export interface IntlTranslations {
  clearTrigger: string
  control: string
}

export type { StrokeOptions }

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the signature pad elements. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The translations of the signature pad. Useful for internationalization.
   */
  translations?: IntlTranslations
  /**
   * Callback when the signature pad is drawing.
   */
  onDraw?(details: DrawDetails): void
  /**
   * Callback when the signature pad is done drawing.
   */
  onDrawEnd?(details: DrawEndDetails): void
  /**
   * The drawing options.
   * @default '{ size: 2, simulatePressure: true }'
   */
  drawing: DrawingOptions
  /**
   * Whether the signature pad is disabled.
   */
  disabled?: boolean
  /**
   * Whether the signature pad is required.
   */
  required?: boolean
  /**
   * Whether the signature pad is read-only.
   */
  readOnly?: boolean
  /**
   * The name of the signature pad. Useful for form submission.
   */
  name?: string
}

interface PrivateContext {
  /**
   * The layers of the signature pad. A layer is a snapshot of a single stroke interaction.
   */
  paths: string[]
  /**
   * The current layer points.
   */
  currentPoints: Point[]
  /**
   * The current stroke path
   */
  currentPath: string | null
}

type ComputedContext = Readonly<{
  isInteractive: boolean
  isEmpty: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "drawing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface SegmentPathProps {
  path: string
}

export interface HiddenInputProps {
  value: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the signature pad is empty.
   */
  empty: boolean
  /**
   * Whether the user is currently drawing.
   */
  drawing: boolean
  /**
   * The current path being drawn.
   */
  currentPath: string | null
  /**
   * The paths of the signature pad.
   */
  paths: string[]
  /**
   * Returns the data URL of the signature pad.
   */
  getDataUrl(type: DataUrlType, quality?: number): Promise<string>
  /**
   * Clears the signature pad.
   */
  clear(): void

  getLabelProps(): T["element"]
  getRootProps(): T["element"]
  getControlProps(): T["element"]
  getSegmentProps(): T["svg"]
  getSegmentPathProps(props: SegmentPathProps): T["path"]
  getHiddenInputProps(props: HiddenInputProps): T["input"]
  getGuideProps(): T["element"]
  getClearTriggerProps(): T["element"]
}
