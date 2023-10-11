import type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType } from "@zag-js/color-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, MaybeElement, Orientation, PropTypes, RequiredBy } from "@zag-js/types"
import type { MaybeFunction } from "@zag-js/utils"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: Color
  valueAsString: string
}

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ExtendedColorChannel = ColorChannel | "hex" | "css"

type ElementIds = Partial<{
  root: string
  control: string
  trigger: string
  label: string
  input: string
  content: string
  area: string
  areaGradient: string
  areaThumb: string
  channelInput(id: string): string
  channelSliderTrack(id: ColorChannel): string
  channelSliderThumb(id: ColorChannel): string
}>

interface PublicContext extends CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the color picker. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The direction of the color picker
   */
  dir: "ltr" | "rtl"
  /**
   * The current color value
   */
  value: Color
  /**
   * Whether the color picker is disabled
   */
  disabled?: boolean
  /**
   * Whether the color picker is read-only
   */
  readOnly?: boolean
  /**
   * Handler that is called when the value changes, as the user drags.
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Handler that is called when the user stops dragging.
   */
  onValueChangeEnd?: (details: ValueChangeDetails) => void
  /**
   * Handler that is called when the user opens or closes the color picker.
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The name for the form input
   */
  name?: string
  /**
   * The color format to use (rgb, hsl, hsb)
   * @default "hsl"
   */
  format?: ColorFormat
  /**
   * The alpha format to use (decimal, percent)
   * @default "decimal"
   */
  alphaFormat?: "decimal" | "percent"
  /**
   * The positioning options for the color picker
   */
  positioning: PositioningOptions
  /**
   * Whether to automatically set focus on the first focusable
   * content within the color picker when opened.
   */
  autoFocus?: boolean
  /**
   * The initial focus element when the color picker is opened.
   */
  initialFocusEl?: MaybeFunction<MaybeElement>
}

type PrivateContext = Context<{
  /**
   * @internal
   * The id of the thumb that is currently being dragged
   */
  activeId: string | null
  /**
   * @internal
   * The channel that is currently being interacted with
   */
  activeChannel: Partial<ColorAxes> | null
  /**
   * @internal
   * The orientation of the channel that is currently being interacted with
   */
  activeOrientation: Orientation | null
  /**
   * @internal
   * Whether the checkbox's fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * @internal
   * The current placement of the color picker
   */
  currentPlacement?: PositioningOptions["placement"]
}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the color picker is in RTL mode
   */
  isRtl: boolean
  /**
   * @computed
   * Whether the color picker is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * The color value as a Color object
   */
  valueAsString: string
  /**
   * @computed
   * Whether the color picker is disabled
   */
  isDisabled: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed" | "dragging" | "focused"
  value: "idle" | "focused" | "open" | "open:dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ChannelProps {
  channel: ColorChannel
  orientation?: Orientation
}

export interface ChannelInputProps {
  channel: ExtendedColorChannel
  orientation?: Orientation
}

export interface AreaProps {
  xChannel?: ColorChannel
  yChannel?: ColorChannel
}

export interface SwatchTriggerProps {
  /**
   * The color value
   */
  value: string | Color
}

export interface SwatchProps {
  /**
   * The color value
   */
  value: string | Color
  /**
   * Whether to include the alpha channel in the color
   */
  respectAlpha?: boolean
}

export interface TransparancyGridProps {
  size: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the color picker is being dragged
   */
  isDragging: boolean
  /**
   * Whether the color picker is open
   */
  isOpen: boolean
  /**
   * The current color value (as a string)
   */
  value: Color
  /**
   * The current color value (as a Color object)
   */
  valueAsString: string
  /**
   * The alpha value of the color
   */
  alpha: number
  /**
   * The current color channels of the color
   */
  channels: [ColorChannel, ColorChannel, ColorChannel]
  /**
   * Function to set the color value
   */
  setColor(value: string | Color): void
  /**
   * Function to set the color value of a specific channel
   */
  setChannelValue(channel: ColorChannel, value: number): void
  /**
   * Function to set the color format
   */
  setFormat(format: ColorFormat): void
  /**
   * Function to set the color alpha
   */
  setAlpha(value: number): void

  rootProps: T["element"]
  labelProps: T["element"]
  controlProps: T["element"]
  inputProps: T["input"]
  triggerProps: T["button"]
  positionerProps: T["element"]
  contentProps: T["element"]
  hiddenInputProps: T["input"]

  getAreaProps(props: AreaProps): T["element"]
  getAreaBackgroundProps(props: AreaProps): T["element"]
  getAreaThumbProps(props: AreaProps): T["element"]

  getChannelSliderProps(props: ChannelProps): T["element"]
  getChannelSliderTrackProps(props: ChannelProps): T["element"]
  getChannelSliderThumbProps(props: ChannelProps): T["element"]
  getChannelInputProps(props: ChannelInputProps): T["input"]

  getTransparencyGridProps(props: TransparancyGridProps): T["element"]

  eyeDropperTriggerProps: T["button"]

  swatchGroupProps: T["element"]
  getSwatchTriggerProps(props: SwatchTriggerProps): T["button"]
  getSwatchProps(props: SwatchProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType }
