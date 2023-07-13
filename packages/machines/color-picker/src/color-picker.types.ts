import type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType } from "@zag-js/color-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

export type ColorChannelProps = {
  channel: ColorChannel
  orientation?: Orientation
}

export type ExtendedColorChannel = ColorChannel | "hex" | "css"

export type ColorChannelInputProps = {
  channel: ExtendedColorChannel
  orientation?: Orientation
}

export type ColorAreaProps = {
  xChannel: ColorChannel
  yChannel: ColorChannel
}

export type ColorSwatchProps = {
  readOnly?: boolean
  value: string | Color
}

type ChangeDetails = {
  value: string
  valueAsColor: Color
}

type ElementIds = Partial<{
  content: string
  area: string
  areaGradient: string
  areaThumb: string
  channelInput(id: string): string
  channelSliderTrack(id: ColorChannel): string
  channelSliderThumb(id: ColorChannel): string
}>

type PublicContext = CommonProperties & {
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
  value: string
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
  onChange?: (details: ChangeDetails) => void
  /**
   * Handler that is called when the user stops dragging.
   */
  onChangeEnd?: (details: ChangeDetails) => void
}

export type PublicApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the color picker is being dragged
   */
  isDragging: boolean
  /**
   * The current color value (as a string)
   */
  value: string
  /**
   * The current color value (as a Color object)
   */
  valueAsColor: Color
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
  contentProps: T["element"]
  getAreaProps(props: ColorAreaProps): T["element"]
  getAreaGradientProps(props: ColorAreaProps): T["element"]
  getAreaThumbProps(props: ColorAreaProps): T["element"]
  getChannelSliderTrackProps(props: ColorChannelProps): T["element"]
  getChannelSliderBackgroundProps(props: ColorChannelProps): T["element"]
  getChannelSliderThumbProps(props: ColorChannelProps): T["element"]
  getChannelInputProps(props: ColorChannelInputProps): T["input"]
  eyeDropperTriggerProps: T["button"]
  getSwatchBackgroundProps(props: ColorSwatchProps): T["element"]
  getSwatchProps(props: ColorSwatchProps): T["element"]
}

type PrivateContext = Context<{
  /**
   * The id of the thumb that is currently being dragged
   */
  activeId: string | null
  /**
   * The color value as a Color object
   */
  valueAsColor: Color
  /**
   * The channel that is currently being interacted with
   */
  activeChannel: Partial<ColorAxes> | null
  /**
   * The orientation of the channel that is currently being interacted with
   */
  activeOrientation: Orientation | null
}>

type ComputedContext = Readonly<{
  /**
   * Whether the color picker is in RTL mode
   */
  isRtl: boolean
  /**
   * Whether the color picker is interactive
   */
  isInteractive: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType }
