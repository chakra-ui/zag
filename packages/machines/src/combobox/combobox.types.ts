import { StateMachine as S } from "@ui-machines/core"
import { Context, LiveRegion } from "../utils"

export type ComboboxMachineState = {
  value: "unknown" | "focused" | "open" | "closed"
}

export type ComboboxMachineContext = Context<{
  /**
   * The name applied to the `input` element. Useful for form submissions.
   */
  name?: string
  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean
  /**
   * Whether to close the menu when the input is blurred
   */
  closeOnBlur?: boolean
  /**
   * Whether to focus the input when it is mounted
   */
  autoFocus?: boolean
  /**
   * Whether to close the popup when an option is selected
   * with keyboard or pointer
   */
  closeOnSelect?: boolean | ((value: OptionData) => boolean)
  /**
   * Whether to clear the input value when `Esc` key is pressed
   */
  clearOnEsc?: boolean
  /**
   * Whether the popup should open on focus
   */
  openOnClick?: boolean
  /**
   * Whether the input's value should be selected
   * on focus. This is useful if the user is likely
   * to delete the entire value in the input (e.g browser search bar)
   */
  selectOnFocus?: boolean
  /**
   * Whether the combobox is in read-only mode
   */
  readonly?: boolean
  /**
   * Whether the combobox is required
   */
  required?: boolean
  /**
   * The initial value that shows up in the input
   */
  inputValue: string
  /**
   * The selected value for the combobox
   */
  selectedValue: string
  /**
   * The value of the option when navigating with the keyboard/pointer
   */
  navigationValue: string
  /**
   *  The input placeholder
   */
  placeholder?: string
  /**
   * This determines how the combobox behaves as the user navigates
   * with the keyboard.
   *
   * - `autocomplete`: The combobox will update the input value as user navigates
   * - `autoselect`: The combobox will highlight the first option, requiring the user to press enter to select
   * - `manual`: The combobox will not highlihgt or select the first option, requiring the user to press manually
   * navigate using the up and down keys, and pressing enter to select
   */
  selectionMode?: "autocomplete" | "autoselect" | "manual"
  /**
   * Function called when the input value changes
   */
  onInputValueChange?: (value: string) => string
  /**
   * Function called when an option is selected by pointer or keyboard
   */
  onSelect?: (value: string) => void
  /**
   * The `id` of the highlighted option
   */
  activeId: string | null
  /**
   * The event source for triggers highlighted option change
   */
  eventSource: "pointer" | "keyboard" | null
  /**
   * The live region for the combobox
   */
  liveRegion?: LiveRegion | null
  /**
   * Whether the label of the selected option should be displayed in the input.
   */
  shouldInputRenderValue?: boolean
  /**
   * Whether to focus the input on clear button click
   */
  focusOnClear?: boolean
}>

export type OptionData = {
  label: string
  value: string
}

export type ComboboxOptionProps = OptionData & {
  virtualized?: true
  index?: number
  noOfOptions?: number
  disabled?: boolean
}

export type ComboboxState = S.State<ComboboxMachineContext, ComboboxMachineState>

export type ComboboxSend = S.Send<S.AnyEventObject>
