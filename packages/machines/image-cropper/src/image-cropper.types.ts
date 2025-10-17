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

export interface FlipState {
  horizontal: boolean
  vertical: boolean
}

export interface FlipChangeDetails {
  flip: FlipState
}

export interface CropChangeDetails {
  crop: Rect
}

export interface PreviewDescriptionDetails {
  zoom: number | null
  rotation: number | null
  crop: Rect
}

export interface SelectionLabelDetails {
  shape: "rectangle" | "circle"
}

export interface SelectionValueTextDetails extends Rect {
  shape: "rectangle" | "circle"
}

export interface IntlTranslations {
  rootLabel: string
  rootRoleDescription: string
  previewLoading: string
  previewDescription: (details: PreviewDescriptionDetails) => string
  selectionLabel: (details: SelectionLabelDetails) => string
  selectionRoleDescription: string
  selectionInstructions: string
  selectionValueText: (details: SelectionValueTextDetails) => string
}

export type ElementIds = Partial<{
  root: string
  viewport: string
  image: string
  selection: string
  handle: (position: string) => string
}>

export interface ImageCropperProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the image cropper elements
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identify accessibility elements and their states.
   */
  translations?: IntlTranslations
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
   * The shape of the crop area.
   * @default "rectangle"
   */
  cropShape?: "rectangle" | "circle"
  /**
   * The controlled zoom level of the image.
   */
  zoom?: number
  /**
   * The controlled rotation of the image in degrees (0 - 360).
   */
  rotation?: number
  /**
   * The controlled flip state of the image.
   */
  flip?: FlipState
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
   * The initial flip state to apply to the image.
   * @default { horizontal: false, vertical: false }
   */
  defaultFlip?: FlipState
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
   * Callback fired when the flip state changes.
   */
  onFlipChange?: ((details: FlipChangeDetails) => void) | undefined
  /**
   * Callback fired when the crop area changes.
   */
  onCropChange?: ((details: CropChangeDetails) => void) | undefined
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
  | "defaultFlip"
  | "zoomStep"
  | "zoomSensitivity"
  | "minZoom"
  | "maxZoom"
  | "maxWidth"
  | "maxHeight"
  | "fixedCropArea"
  | "cropShape"
  | "nudgeStep"
  | "nudgeStepShift"
  | "nudgeStepCtrl"
  | "translations"

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
    flip: FlipState
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

export interface GetCroppedImageOptions {
  /**
   * The output format of the cropped image.
   * @default "image/png"
   */
  type?: string
  /**
   * The quality of the output image (0-1) for lossy formats like JPEG.
   * @default 1
   */
  quality?: number
  /**
   * Whether to return a Blob or a data URL.
   * @default "blob"
   */
  output?: "blob" | "dataUrl"
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
  /**
   * Function to set the flip state of the image.
   */
  setFlip: (flip: Partial<FlipState>) => void
  /**
   * Function to flip the image horizontally. Pass a boolean to set explicitly or omit to toggle.
   */
  flipHorizontally: (value?: boolean) => void
  /**
   * Function to flip the image vertically. Pass a boolean to set explicitly or omit to toggle.
   */
  flipVertically: (value?: boolean) => void
  /**
   * Function to resize the crop area from a handle programmatically.
   */
  resize: (handlePosition: HandlePosition, delta: number) => void
  /**
   * Function to get the cropped image with all transformations applied.
   * Returns a Promise that resolves to either a Blob or data URL.
   */
  getCroppedImage: (options?: GetCroppedImageOptions) => Promise<Blob | string | null>

  getRootProps: () => T["element"]
  getViewportProps: () => T["element"]
  getImageProps: () => T["element"]
  getSelectionProps: () => T["element"]
  getHandleProps: (props: HandleProps) => T["element"]
}
