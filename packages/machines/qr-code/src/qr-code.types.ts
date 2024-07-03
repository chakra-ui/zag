import type { Machine, StateMachine as S } from "@zag-js/core"
import type { DataUrlType } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { QrCodeGenerateOptions, QrCodeGenerateResult } from "uqr"

export type ElementIds = Partial<{
  root: string
  frame: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The value to encode.
   */
  value: string
  /**
   * The element ids.
   */
  ids?: ElementIds
  /**
   * The qr code encoding options.
   */
  encoding?: QrCodeGenerateOptions
}

interface PrivateContext {
  /**
   * The pixel size of the qr code.
   */
  pixelSize: number
}

type ComputedContext = Readonly<{
  encoded: QrCodeGenerateResult
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The value to encode.
   */
  value: string
  /**
   * Set the value to encode.
   */
  setValue(value: string): void
  /**
   * Returns the data URL of the qr code.
   */
  getDataUrl(type: DataUrlType, quality?: number): Promise<string>

  getRootProps(): T["element"]
  getFrameProps(): T["svg"]
  getPatternProps(): T["path"]
  getOverlayProps(): T["element"]
}

export type { QrCodeGenerateOptions, QrCodeGenerateResult } from "uqr"
