import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type IntlTranslations = {
  ratingValueText(index: number): string
}

export type ItemProps = {
  index: number
}

type ElementIds = Partial<{
  root: string
  label: string
  hiddenInput: string
  control: string
  rating(id: string): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the rating. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
    /**
     * The maximum rating value.
     */
    max: number
    /**
     * The name attribute of the rating element (used in forms).
     */
    name?: string
    /**
     * The associate form of the underlying input element.
     */
    form?: string
    /**
     * The current rating value.
     */
    value: number
    /**
     * Whether the rating is readonly.
     */
    readOnly?: boolean
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

export type UserDefinedContext = RequiredBy<PublicContext, "id">

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

type PrivateContext = Context<{
  /**
   * @internal The value of the hovered rating.
   */
  hoveredValue: number
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "idle" | "hover" | "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
