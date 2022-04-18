import { StateMachine as S } from "@zag-js/core"
import { Context, DirectionProperty } from "@zag-js/types"

/////////////////////////////////////////////////////////////////////////

type IntlMessages = {
  ratingValueText(index: number): string
}

/////////////////////////////////////////////////////////////////////////

type ElementIds = Partial<{
  root: string
  label: string
  input: string
  itemGroup: string
  item(id: string): string
}>

/////////////////////////////////////////////////////////////////////////

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the rating. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
  /**
   * The maximum rating value.
   */
  max: number
  /**
   * The name attribute of the rating element (used in forms).
   */
  name?: string
  /**
   * The current rating value.
   */
  value: number
  /**
   * The initial rating value.
   */
  initialValue: number
  /**
   * Whether the rating is readonly.
   */
  readonly?: boolean
  /**
   * Whether the rating is disabled.
   */
  disabled?: boolean
  /**
   * Whether to allow half stars.
   */
  allowHalf?: boolean
  /**
   * Whether to autofocus the rating.
   */
  autoFocus?: boolean
  /**
   * Function to be called when the rating value changes.
   */
  onChange?: (details: { value: number }) => void
  /**
   * Function to be called when the rating value is hovered.
   */
  onHover?: (details: { value: number }) => void
}

export type UserDefinedContext = Partial<PublicContext>

/////////////////////////////////////////////////////////////////////////

type ComputedContext = Readonly<{
  /**
   * @computed Whether the rating is interactive
   */
  readonly isInteractive: boolean
  /**
   * @computed Whether the pointer is hovering over the rating
   */
  readonly isHovering: boolean
}>

/////////////////////////////////////////////////////////////////////////

type PrivateContext = Context<{
  /**
   * @internal The value of the hovered rating.
   */
  hoveredValue: number
}>

/////////////////////////////////////////////////////////////////////////

export type MachineContext = PublicContext & ComputedContext & PrivateContext

/////////////////////////////////////////////////////////////////////////

export type MachineState = {
  value: "unknown" | "idle" | "hover" | "focus"
}

export type State = S.State<MachineContext, MachineState>

/////////////////////////////////////////////////////////////////////////

export type Send = S.Send<S.AnyEventObject>
