import type { StateMachine as S } from "@zag-js/core"
import { TypeaheadState } from "@zag-js/dom-utils"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  menu: string
  trigger: string
  label: string
  option(id: string | number): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the accordion. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The `name` attribute of the underlying select.
     */
    name?: string
    /**
     * Whether the select is disabled
     */
    disabled?: boolean
    /**
     * Whether the select is invalid
     */
    invalid?: boolean
    /**
     * Whether to select the highlighted option when the user presses Tab,
     * and the menu is open.
     */
    selectOnTab?: boolean
    /**
     * The callback fired when the highlighted option changes.
     */
    onHighlight?: (details: Option | null) => void
    /**
     * The callback fired when the selected option changes.
     */
    onChange?: (details: Option | null) => void
    /**
     * The callback fired when the menu is opened.
     */
    onOpen?: () => void
    /**
     * The callback fired when the menu is closed.
     */
    onClose?: () => void
    /**
     * The positioning options of the menu.
     */
    positioning: PositioningOptions
    /**
     * @experimental
     * The virtualization options of the menu.
     */
    // virtualize?: {
    //   count?: number
    // }
  }

type PrivateContext = Context<{
  /**
   * The data of the selected option
   */
  selectedOption: Option | null
  /**
   * The id of the highlighted option
   */
  highlightedId: string | null
  /**
   * The data of the highlighted option
   */
  highlightedOption: Option | null
  /**
   * The placeholder of the select
   */
  placeholder: string
  /**
   * Internal state of the typeahead
   */
  typeahead: TypeaheadState
  /**
   * The current placement of the menu
   */
  currentPlacement?: Placement
  /**
   * The id of the previous highlighted option.
   * Used to determine if the user has highlighted a new option.
   */
  previousHighlightedId?: string | null
  /**
   * The id of the previous selected option.
   * Used to determine if the selected option has changed.
   */
  previousSelectedId?: string | null
}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * The rendered value of the select
   */
  rendered: string
  /**
   * @computed
   * Whether the select has a selected option
   */
  hasValue: boolean
  /**
   * @computed
   * Whether a typeahead is currently active
   */
  isTypingAhead: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type Option = {
  id: string
  label: string
  value: string
}

export type ItemProps = {
  value: string
  disabled?: boolean
}

export type OptionProps = ItemProps & {
  label?: string
  index?: number
}

export type MachineState = {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type OptionGroupProps = {
  id: string
}

export type OptionGroupLabelProps = {
  htmlFor: string
}
