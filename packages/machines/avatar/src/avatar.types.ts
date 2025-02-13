import type { Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type LoadStatus = "error" | "loaded"

export interface StatusChangeDetails {
  status: LoadStatus
}

export type ElementIds = Partial<{
  root: string
  image: string
  fallback: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface AvatarProps extends CommonProperties, DirectionProperty {
  /**
   * Functional called when the image loading status changes.
   */
  onStatusChange?: ((details: StatusChangeDetails) => void) | undefined
  /**
   * The ids of the elements in the avatar. Useful for composition.
   */
  ids?: ElementIds | undefined
}

export interface AvatarSchema {
  props: AvatarProps
  context: any
  initial: "loading"
  effect: "trackImageRemoval" | "trackSrcChange"
  action: "invokeOnLoad" | "invokeOnError" | "checkImageStatus"
  event:
    | { type: "img.loaded"; src?: string }
    | { type: "img.error"; src?: string }
    | { type: "img.unmount" }
    | { type: "src.change" }
  state: "loading" | "error" | "loaded"
}

export type AvatarService = Service<AvatarSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface AvatarApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the image is loaded.
   */
  loaded: boolean
  /**
   * Function to set new src.
   */
  setSrc(src: string): void
  /**
   * Function to set loaded state.
   */
  setLoaded(): void
  /**
   * Function to set error state.
   */
  setError(): void

  getRootProps(): T["element"]
  getImageProps(): T["img"]
  getFallbackProps(): T["element"]
}
