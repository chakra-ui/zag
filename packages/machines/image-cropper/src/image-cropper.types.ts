import type { EventObject, Service, Machine } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Point, PropTypes, Rect, RequiredBy, Size } from "@zag-js/types"

export type HandlePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"

export type ElementIds = Partial<{
  root: string
  viewport: string
  selection: string
  overlay: string
  handle: (position: string) => string
}>

export interface ImageCropperProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the image cropper elements
   */
  ids?: ElementIds
  /**
   * The initial rectangle of the crop area
   */
  initialCrop: Rect
  /**
   * The minimum size of the crop area
   * @default { width: 40, height: 40 }
   */
  minCropSize?: Size
  /**
   * The aspect ratio to maintain for the crop area (width / height).
   * For example, an aspect ratio of 16 / 9 will maintain a width to height ratio of 16:9.
   * If not provided, the crop area can be freely resized.
   */
  aspectRatio?: number
  /**
   * The amount of zoom applied per wheel step.
   * @default 0.1
   */
  zoomStep?: number
  /**
   * The minimum zoom factor allowed.
   * @default 1
   */
  minZoom?: number
  /**
   * The maximum zoom factor allowed.
   * @default 5
   */
  maxZoom?: number
}

type PropsWithDefault = "initialCrop" | "minCropSize" | "zoomStep" | "minZoom" | "maxZoom"

export interface ImageCropperSchema {
  state: "idle" | "dragging"
  props: RequiredBy<ImageCropperProps, PropsWithDefault>
  context: {
    naturalSize: Size
    crop: Rect
    pointerStart: Point | null
    cropStart: Rect | null
    handlePosition: HandlePosition | null
    shiftLockRatio: number | null
    lastShiftKey: boolean
    zoom: number
    offset: Point
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type ImageCropperService = Service<ImageCropperSchema>

export type ImageCropperMachine = Machine<ImageCropperSchema>

export interface HandleProps {
  /**
   * The position of the handle
   */
  position: HandlePosition
}

export interface ImageCropperApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T["element"]
  getViewportProps: () => T["element"]
  getImageProps: () => T["element"]
  getSelectionProps: () => T["element"]
  getOverlayProps: () => T["element"]
  getHandleProps: (props: HandleProps) => T["element"]
}
