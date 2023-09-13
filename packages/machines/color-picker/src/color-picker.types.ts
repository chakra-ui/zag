import type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType } from "@zag-js/color-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string
  valueAsColor: Color
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ExtendedColorChannel = ColorChannel | "hex" | "css"

type ElementIds = Partial<{
  content: string
  area: string
  areaGradient: string
  areaThumb: string
  channelInput(id: string): string
  channelSliderTrack(id: ColorChannel): string
  channelSliderThumb(id: ColorChannel): string
}>

interface PublicContext extends CommonProperties {
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
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Handler that is called when the user stops dragging.
   */
  onValueChangeEnd?: (details: ValueChangeDetails) => void
  /**
   *  The name for the form input
   */
  name?: string
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
  valueAsColor: Color
  /**
   * @computed
   * Whether the color picker is disabled
   */
  isDisabled: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ColorChannelProps {
  channel: ColorChannel
  orientation?: Orientation
}

export interface ColorChannelInputProps {
  channel: ExtendedColorChannel
  orientation?: Orientation
}

export interface ColorAreaProps {
  xChannel: ColorChannel
  yChannel: ColorChannel
}

export interface ColorSwatchProps {
  readOnly?: boolean
  value: string | Color
}

export interface MachineApi<T extends PropTypes = PropTypes> {
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

  contentProps: T["element"]
  hiddenInputProps: T["input"]
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

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType }
