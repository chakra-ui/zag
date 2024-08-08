import type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType } from "@zag-js/color-utils"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

export type ExtendedColorChannel = ColorChannel | "hex" | "css"

interface EyeDropper {
  new (): EyeDropper
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>
  [Symbol.toStringTag]: "EyeDropper"
}

declare global {
  interface Window {
    EyeDropper: EyeDropper
  }
}

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

export interface FormatChangeDetails {
  format: ColorFormat
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  control: string
  trigger: string
  label: string
  input: string
  hiddenInput: string
  content: string
  area: string
  areaGradient: string
  positioner: string
  formatSelect: string
  areaThumb: string
  channelInput(id: string): string
  channelSliderTrack(id: ColorChannel): string
  channelSliderThumb(id: ColorChannel): string
}>

interface PublicContext extends CommonProperties, DirectionProperty, InteractOutsideHandlers {
  /**
   * The ids of the elements in the color picker. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The current color value
   * @default #000000
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
   * Whether the color picker is required
   */
  required?: boolean
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
   * The positioning options for the color picker
   */
  positioning: PositioningOptions
  /**
   * The initial focus element when the color picker is opened.
   */
  initialFocusEl?: () => HTMLElement | null
  /**
   * Whether the color picker is open
   */
  open?: boolean
  /**
   * Whether the color picker open state is controlled by the user
   */
  "open.controlled"?: boolean
  /**
   * The color format to use
   * @default "rgba"
   */
  format: ColorFormat
  /**
   * Function called when the color format changes
   */
  onFormatChange?: (details: FormatChangeDetails) => void
  /**
   * Whether to close the color picker when a swatch is selected
   * @default false
   */
  closeOnSelect?: boolean
}

interface PrivateContext {
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
  /**
   *  @internal
   * Whether the color picker should return focus to the trigger when closed
   */
  restoreFocus?: boolean
}

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
  /**
   * @computed
   * The area value as a Color object
   */
  areaValue: Color
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed" | "dragging" | "focused"
  value: "idle" | "focused" | "open" | "open:dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ChannelProps {
  channel: ColorChannel
  orientation?: Orientation
}

export interface ChannelSliderProps extends ChannelProps {
  format?: ColorFormat
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
  /**
   * Whether the swatch trigger is disabled
   */
  disabled?: boolean
}

export interface SwatchTriggerState {
  value: Color
  valueAsString: string
  checked: boolean
  disabled: boolean
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

export interface TransparencyGridProps {
  size?: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the color picker is being dragged
   */
  dragging: boolean
  /**
   * Whether the color picker is open
   */
  open: boolean
  /**
   * The current color value (as a string)
   */
  value: Color
  /**
   * The current color value (as a Color object)
   */
  valueAsString: string
  /**
   * Function to set the color value
   */
  setValue(value: string | Color): void
  /**
   * Function to set the color value
   */
  getChannelValue(channel: ColorChannel): string
  /**
   * Function to get the formatted and localized value of a specific channel
   */
  getChannelValueText(channel: ColorChannel, locale: string): string
  /**
   * Function to set the color value of a specific channel
   */
  setChannelValue(channel: ColorChannel, value: number): void
  /**
   * The current color format
   */
  format: ColorFormat
  /**
   * Function to set the color format
   */
  setFormat(format: ColorFormat): void
  /**
   * The alpha value of the color
   */
  alpha: number
  /**
   * Function to set the color alpha
   */
  setAlpha(value: number): void
  /**
   * Function to open or close the color picker
   */
  setOpen(open: boolean): void

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getTriggerProps(): T["button"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getHiddenInputProps(): T["input"]
  getValueTextProps(): T["element"]

  getAreaProps(props?: AreaProps): T["element"]
  getAreaBackgroundProps(props?: AreaProps): T["element"]
  getAreaThumbProps(props?: AreaProps): T["element"]

  getChannelInputProps(props: ChannelInputProps): T["input"]

  getChannelSliderProps(props: ChannelSliderProps): T["element"]
  getChannelSliderTrackProps(props: ChannelSliderProps): T["element"]
  getChannelSliderThumbProps(props: ChannelSliderProps): T["element"]
  getChannelSliderLabelProps(props: ChannelProps): T["element"]
  getChannelSliderValueTextProps(props: ChannelProps): T["element"]

  getTransparencyGridProps(props?: TransparencyGridProps): T["element"]

  getEyeDropperTriggerProps(): T["button"]

  getSwatchGroupProps(): T["element"]
  getSwatchTriggerProps(props: SwatchTriggerProps): T["button"]
  getSwatchTriggerState(props: SwatchTriggerProps): SwatchTriggerState
  getSwatchProps(props: SwatchProps): T["element"]
  getSwatchIndicatorProps(props: SwatchProps): T["element"]

  getFormatSelectProps(): T["select"]
  getFormatTriggerProps(): T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType, PositioningOptions }
