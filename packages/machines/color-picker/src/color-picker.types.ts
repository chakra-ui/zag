import { Color, ColorChannel, ColorFormat, ColorAxes } from "@zag-js/color-utils"
import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, RequiredBy } from "@zag-js/types"

export type ChannelProps = {
  channel: ColorChannel
  orientation?: "vertical" | "horizontal"
}

export type AreaProps = {
  xChannel: ColorChannel
  yChannel: ColorChannel
}

export type PreviewProps = {
  format?: ColorFormat
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
   * The active color format
   */
  format: ColorFormat
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
  valueAsColor: Color
  activeChannel: Partial<ColorAxes> | null
}>

type ComputedContext = Readonly<{
  displayColor: Color
  isRtl: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
