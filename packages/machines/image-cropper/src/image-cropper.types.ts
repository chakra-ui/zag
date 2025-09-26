import type { EventObject, Service, Machine } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, RequiredBy } from "@zag-js/types"

export type ElementIds = Partial<{
  root: string
}>

export interface ImageCropperProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the image cropper elements
   */
  ids?: ElementIds
}

type PropsWithDefault = never

export interface ImageCropperSchema {
  state: "idle"
  props: RequiredBy<ImageCropperProps, PropsWithDefault>
  context: {}
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type ImageCropperService = Service<ImageCropperSchema>

export type ImageCropperMachine = Machine<ImageCropperSchema>
