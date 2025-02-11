import type { Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

export type LoadStatus = "error" | "loaded"

export interface StatusChangeDetails {
  status: LoadStatus
}

export type ElementIds = Partial<{
  root: string
  image: string
  fallback: string
}>

export interface AvatarProps extends CommonProperties, DirectionProperty {
  ids: ElementIds
  onStatusChange?: (e: StatusChangeDetails) => void
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

export interface AvatarApi<T extends PropTypes = PropTypes> {
  loaded: boolean
  setSrc(src: string): void
  setLoaded(): void
  setError(): void
  getRootProps(): T["element"]
  getImageProps(): T["img"]
  getFallbackProps(): T["element"]
}
