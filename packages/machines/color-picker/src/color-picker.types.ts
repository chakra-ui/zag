import { Color, ColorAxes, ColorChannel } from "@zag-js/color-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, Orientation, RequiredBy } from "@zag-js/types"

export type ChannelProps = {
  channel: ColorChannel
  orientation?: Orientation
}

export type ExtendedColorChannel = ColorChannel | "hex" | "css"

export type ChannelInputProps = {
  channel: ExtendedColorChannel
  orientation?: Orientation
}

export type AreaProps = {
  xChannel: ColorChannel
  yChannel: ColorChannel
}

export type SwatchProps = {
  readOnly?: boolean
  value: string | Color
}

type ChangeDetails = {
  value: string
  valueAsColor: Color
}

type PublicContext = CommonProperties & {
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
  activeChannelOrientation: Orientation | null
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
