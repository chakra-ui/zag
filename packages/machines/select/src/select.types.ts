import type { StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { InteractOutsideEvent } from "@zag-js/interact-outside"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  content: string
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
     * The associate form of the underlying select.
     */
    form?: string
    /**
     * Whether the select is disabled
     */
    disabled?: boolean
    /**
     * Whether the select is invalid
     */
    invalid?: boolean
    /**
     * Whether the select is read-only
     */
    readOnly?: boolean
    /**
     * Whether the select should close after an option is selected
     */
    closeOnSelect?: boolean
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
     * Callback fired when an outside interaction was triggered.
     * Useful for preventing blur on select when composing it with other components.
     */
    onInteractOutside?(event: InteractOutsideEvent): void
    /**
     * The positioning options of the menu.
     */
    positioning: PositioningOptions
    /**
     * The selected option
     */
    selectedOption: Option | null
    /**
     * The highlighted option
     */
    highlightedOption: Option | null
    /**
     * Whether to loop the keyboard navigation through the options
     */
    loop?: boolean
  }

type PrivateContext = Context<{
  /**
   * Internal state of the typeahead
   */
  typeahead: TypeaheadState
  /**
   * The current placement of the menu
   */
  currentPlacement?: Placement
  /**
   * The previous highlighted option.
   * Used to determine if the user has highlighted a new option.
   */
  prevHighlightedOption?: Option | null
  /**
   * The previous selected option.
   * Used to determine if the selected option has changed.
   */
  prevSelectedOption?: Option | null
  /**
   * The initial selected option. Used for form reset.
   */
  initialSelectedOption: Option | null
}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedOption: boolean
  /**
   * @computed
   * Whether a typeahead is currently active
   */
  isTypingAhead: boolean
  /**
   * @computed
   * Whether the select is interactive
   */
  isInteractive: boolean
  selectedId: string | null
  highlightedId: string | null
  hasSelectedChanged: boolean
  hasHighlightedChanged: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type Option = {
  label: string
  value: string
}

export type OptionProps = {
  label: string
  value: string
  disabled?: boolean
  valueText?: string
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
