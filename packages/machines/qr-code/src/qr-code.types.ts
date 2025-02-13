import type { EventObject, Service } from "@zag-js/core"
import type { DataUrlType } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { QrCodeGenerateOptions, QrCodeGenerateResult } from "uqr"

export type ElementIds = Partial<{
  root: string
  frame: string
}>

export interface ValueChangeDetails {
  value: string
}

export interface QrCodeProps extends DirectionProperty, CommonProperties {
  /**
   * The value to encode.
   */
  value?: string | undefined
  /**
   * The default value to encode.
   */
  defaultValue?: string | undefined
  /**
   * The element ids.
   */
  ids?: ElementIds | undefined
  /**
   * The qr code encoding options.
   */
  encoding?: QrCodeGenerateOptions | undefined
  /**
   * Callback fired when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The pixel size of the qr code.
   */
  pixelSize?: number | undefined
}

type PropsWithDefault = "pixelSize" | "defaultValue"

type Computed = Readonly<{
  encoded: QrCodeGenerateResult
}>

export interface QrCodeSchema {
  props: RequiredBy<QrCodeProps, PropsWithDefault>
  context: {
    value: string
  }
  computed: Computed
  state: "idle"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type QrCodeService = Service<QrCodeSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface DownloadTriggerProps {
  /**
   * The mime type of the image.
   */
  mimeType: DataUrlType
  /**
   * The quality of the image.
   */
  quality?: number
  /**
   * The name of the file.
   */
  fileName: string
}

export interface QrCodeApi<T extends PropTypes = PropTypes> {
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
  getDownloadTriggerProps(props: DownloadTriggerProps): T["button"]
}

export type { QrCodeGenerateOptions, QrCodeGenerateResult } from "uqr"
