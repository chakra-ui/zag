import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { QrCodeGenerateOptions, QrCodeGenerateResult } from "uqr"

export interface ElementIds {
  root?: string
}

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
  /**
   * The pixel size of the qr code.
   * @default 10
   */
  pixelSize: number
}

interface PrivateContext {}

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

  getRootProps(): T["element"]
  getSvgProps(): T["svg"]
  getPathProps(): T["path"]
  getImageProps(): T["img"]
}
