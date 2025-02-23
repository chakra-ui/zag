import type { Color, ColorAxes, ColorChannel, ColorFormat, ColorType } from "@zag-js/color-utils"
import type { EventObject, Machine, Service } from "@zag-js/core"
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

export interface ColorPickerProps extends CommonProperties, DirectionProperty, InteractOutsideHandlers {
  /**
   * The ids of the elements in the color picker. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled color value of the color picker
   */
  value?: Color | undefined
  /**
   * The initial color value when rendered.
   * Use when you don't need to control the color value of the color picker.
   * @default #000000
   */
  defaultValue?: Color | undefined
  /**
   * Whether the color picker is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the color picker is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the color picker is required
   */
  required?: boolean | undefined
  /**
   * Whether the color picker is invalid
   */
  invalid?: boolean | undefined
  /**
   * Handler that is called when the value changes, as the user drags.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Handler that is called when the user stops dragging.
   */
  onValueChangeEnd?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Handler that is called when the user opens or closes the color picker.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The name for the form input
   */
  name?: string | undefined
  /**
   * The positioning options for the color picker
   */
  positioning?: PositioningOptions | undefined
  /**
   * The initial focus element when the color picker is opened.
   */
  initialFocusEl?: (() => HTMLElement | null) | undefined
  /**
   * The controlled open state of the color picker
   */
  open?: boolean | undefined
  /**
   * The initial open state of the color picker when rendered.
   * Use when you don't need to control the open state of the color picker.
   */
  defaultOpen?: boolean | undefined
  /**
   * The controlled color format to use
   */
  format?: ColorFormat | undefined
  /**
   * The initial color format when rendered.
   * Use when you don't need to control the color format of the color picker.
   * @default "rgba"
   */
  defaultFormat?: ColorFormat | undefined
  /**
   * Function called when the color format changes
   */
  onFormatChange?: ((details: FormatChangeDetails) => void) | undefined
  /**
   * Whether to close the color picker when a swatch is selected
   * @default false
   */
  closeOnSelect?: boolean | undefined
  /**
   * Whether to auto focus the color picker when it is opened
   * @default true
   */
  openAutoFocus?: boolean | undefined
}

type PropsWithDefault = "defaultFormat" | "defaultValue" | "openAutoFocus" | "dir" | "positioning"

export type ColorPickerSchema = {
  tag: "open" | "closed" | "dragging" | "focused"
  state: "idle" | "focused" | "open" | "open:dragging"
  props: RequiredBy<ColorPickerProps, PropsWithDefault>
  computed: {
    disabled: boolean
    rtl: boolean
    interactive: boolean
    valueAsString: string
    areaValue: Color
  }
  context: {
    format: ColorFormat
    value: Color
    activeId: string | null
    activeChannel: Partial<ColorAxes> | null
    activeOrientation: Orientation | null
    fieldsetDisabled: boolean
    currentPlacement: PositioningOptions["placement"] | undefined
    restoreFocus: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type ColorPickerService = Service<ColorPickerSchema>

export type ColorPickerMachine = Machine<ColorPickerSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ChannelProps {
  channel: ColorChannel
  orientation?: Orientation | undefined
}

export interface ChannelSliderProps extends ChannelProps {
  format?: ColorFormat | undefined
}

export interface ChannelInputProps {
  channel: ExtendedColorChannel
  orientation?: Orientation | undefined
}

export interface AreaProps {
  xChannel?: ColorChannel | undefined
  yChannel?: ColorChannel | undefined
}

export interface SwatchTriggerProps {
  /**
   * The color value
   */
  value: string | Color
  /**
   * Whether the swatch trigger is disabled
   */
  disabled?: boolean | undefined
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
  respectAlpha?: boolean | undefined
}

export interface TransparencyGridProps {
  size?: string | undefined
}

export interface ColorPickerApi<T extends PropTypes = PropTypes> {
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
