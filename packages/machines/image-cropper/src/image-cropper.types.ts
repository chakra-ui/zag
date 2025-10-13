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

export interface ZoomChangeDetails {
  zoom: number
}

export interface RotationChangeDetails {
  rotation: number
}

export type ElementIds = Partial<{
  root: string
  viewport: string
  selection: string
  handle: (position: string) => string
}>

export interface ImageCropperProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the image cropper elements
   */
  ids?: ElementIds
  /**
   * The initial rectangle of the crop area.
   * If not provided, a smart default will be computed based on viewport size and aspect ratio.
   */
  initialCrop?: Rect
  /**
   * The minimum width of the crop area
   * @default 40
   */
  minWidth?: number
  /**
   * The minimum height of the crop area
   * @default 40
   */
  minHeight?: number
  /**
   * The maximum width of the crop area
   * @default Infinity
   */
  maxWidth?: number
  /**
   * The maximum height of the crop area
   * @default Infinity
   */
  maxHeight?: number
  /**
   * The aspect ratio to maintain for the crop area (width / height).
   * For example, an aspect ratio of 16 / 9 will maintain a width to height ratio of 16:9.
   * If not provided, the crop area can be freely resized.
   */
  aspectRatio?: number
  /**
   * The controlled zoom level of the image.
   */
  zoom?: number
  /**
   * The controlled rotation of the image in degrees (0 - 360).
   */
  rotation?: number
  /**
   * The initial zoom factor to apply to the image.
   * @default 1
   */
  defaultZoom?: number
  /**
   * The initial rotation to apply to the image in degrees.
   * @default 0
   */
  defaultRotation?: number
  /**
   * The amount of zoom applied per wheel step.
   * @default 0.1
   */
  zoomStep?: number
  /**
   * Controls how responsive pinch-to-zoom is.
   * @default 2
   */
  zoomSensitivity?: number
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
  /**
   * The base nudge step for keyboard arrow keys (in pixels).
   * @default 1
   */
  nudgeStep?: number
  /**
   * The nudge step when Shift key is held (in pixels).
   * @default 10
   */
  nudgeStepShift?: number
  /**
   * The nudge step when Ctrl/Cmd key is held (in pixels).
   * @default 50
   */
  nudgeStepCtrl?: number
  /**
   * Callback fired when the zoom level changes.
   */
  onZoomChange?: ((details: ZoomChangeDetails) => void) | undefined
  /**
   * Callback fired when the rotation changes.
   */
  onRotationChange?: ((details: RotationChangeDetails) => void) | undefined
  /**
   * Whether the crop area is fixed in size and position.
   * @default false
   */
  fixedCropArea?: boolean
}

type PropsWithDefault =
  | "minWidth"
  | "minHeight"
  | "defaultZoom"
  | "defaultRotation"
  | "zoomStep"
  | "zoomSensitivity"
  | "minZoom"
  | "maxZoom"
  | "maxWidth"
  | "maxHeight"
  | "fixedCropArea"
  | "nudgeStep"
  | "nudgeStepShift"
  | "nudgeStepCtrl"

export interface ImageCropperSchema {
  state: "idle" | "dragging" | "panning"
  props: RequiredBy<ImageCropperProps, PropsWithDefault>
  context: {
    naturalSize: Size
    crop: Rect
    pointerStart: Point | null
    cropStart: Rect | null
    handlePosition: HandlePosition | null
    shiftLockRatio: number | null
    pinchDistance: number | null
    pinchMidpoint: Point | null
    zoom: number
    rotation: number
    offset: Point
    offsetStart: Point | null
    viewportRect: { width: number; height: number; top: number; left: number; right: number; bottom: number }
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
  /**
   * Function to set the zoom level of the image.
   */
  setZoom: (zoom: number) => void
  /**
   * Function to set the rotation of the image.
   */
  setRotation: (rotation: number) => void

  getRootProps: () => T["element"]
  getViewportProps: () => T["element"]
  getImageProps: () => T["element"]
  getSelectionProps: () => T["element"]
  getHandleProps: (props: HandleProps) => T["element"]
}
