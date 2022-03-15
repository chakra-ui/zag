import { Placement } from "@ui-machines/popper"
import type { StateMachine as S } from "@ui-machines/core"
import type { LiveRegion } from "@ui-machines/dom-utils"
import type { Context } from "@ui-machines/types"

export type MachineState = {
  value: "unknown" | "idle" | "focused" | "suggesting" | "interacting"
  tags: "expanded" | "focused" | "idle"
}

export type MachineContext = Context<{
  /**
   * The current value of the combobox's input
   */
  inputValue: string
  /**
   * @computed Whether the input's value is empty
   */
  readonly isInputValueEmpty: boolean
  /**
   * The selected option's value
   */
  selectedValue: string
  /**
   * @internal
   * The value of the option when the user hovers/navigates with keyboard
   */
  navigationValue: string
  /**
   * The active option's id. Used to set the `aria-activedescendant` attribute
   */
  activeId: string | null
  /**
   * The `name` attribute of the combobox's input. Useful for form submission
   */
  name?: string
  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean
  /**
   * Whether the combobox is readonly. This puts the combobox in a "non-editable" mode
   * but the user can still interact with it
   */
  readonly?: boolean
  /**
   * Whether the combobox is required
   */
  required?: boolean
  /**
   * The placeholder text of the combobox's input
   */
  placeholder?: string
  /**
   * Whether the combobox should automatically select the focused option.
   */
  autoComplete: boolean
  /**
   * Whether the combobox should automatically highlight the first option.
   * This is useful when you have a static list of options.
   */
  autoHighlight: boolean
  /**
   * Whether to autofocus the input on mount
   */
  autoFocus?: boolean
  /**
   * Whether to select the input's text content on focus
   */
  selectOnFocus?: boolean
  /**
   * Whether to return focus to the input on click the clear button
   */
  focusOnClear?: boolean
  /**
   * Whether to open the combobox popup on initial click on the input
   */
  openOnClick?: boolean
  /**
   * Whether to allow custom values or free values in the input
   */
  allowCustomValue?: boolean
  /**
   * Function called to validate the input value
   */
  isCustomValue?: (opts: { inputValue: string; previousValue: string }) => boolean
  /**
   * Whether to loop the keyboard navigation through the options
   */
  loop?: boolean
  /**
   * Function called when the input's value changes
   */
  onInputChange?: (value: string) => void
  /**
   * Function called when a new option is selected
   */
  onSelect?: (value: string) => void
  /**
   * Function called when an options is highlighted using the pointer
   * or keyboard navigation.
   */
  onHighlight?: (value: string) => void
  /**
   * Function called when the popup is opened
   */
  onOpen?: () => void
  /**
   * Function called when the popup is closed
   */
  onClose?: () => void
  /**
   * @internal
   * The live region used to announce changes in the combobox
   */
  liveRegion?: LiveRegion | null
  /**
   * @internal
   * Whether the pointer is hovering the combobox input. Used to show/hide the clear button
   */
  isHoveringInput: boolean
  /**
   * The accessible label to use for the toggle button when the popup is closed
   */
  openText?: string
  /**
   * The accessible label to use for the toggle button when the popup is open
   */
  closeText?: string
  /**
   * The accessible label to use for the clear button
   */
  clearText?: string
  /**
   * Returns the accessible label to use when announcing the available number of options
   */
  getOptionCountText: (count: number) => string
  /**
   * @internal
   * Whether the combobox popover is rendered. We use this to dynamically position
   * the popover relative to the input.
   */
  isPopoverRendered?: boolean
  /**
   * @internal
   * The placement of the combobox popover.
   */
  currentPlacement?: Placement
}>

export type OptionData = {
  /**
   * The label of the option. Used to populate the combobox's input when selected
   */
  label: string
  /**
   * The actual value of the option
   */
  value: string
}

export type OptionProps = OptionData & {
  /**
   * The index of the option. Used to set the `aria-posinset` attribute
   * and allow options with same value
   */
  index?: number
  /**
   * The total count of options. Used to set the `aria-setsize` attribute
   */
  count?: number
  /**
   * Whether the option is disabled
   */
  disabled?: boolean
}

export type OptionGroupProps = {
  /**
   * The accessible label that describes the group
   */
  label: string
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
