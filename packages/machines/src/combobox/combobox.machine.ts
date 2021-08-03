import { createMachine, preserve } from "@ui-machines/core"
import { WithDOM } from "../type-utils"

type Option = {
  label: string
  value: string
  [k: string]: string
}

export type ComboboxMachineContext = WithDOM<{
  /**
   * The name applied to the `input` element. Useful for form submissions.
   */
  name?: string
  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean
  /**
   * Whether to clear the input's value on escape
   */
  clearInputOnEsc?: boolean
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
  closeOnSelect?: boolean | ((value: Option) => boolean)
  /**
   * Whether the popup should open on focus
   */
  openOnFocus?: boolean
  /**
   * Whether the input's value should be selected
   * on focus. This is useful if the user is likely
   * to delete the entire value in the input (e.g browser search bar)
   */
  selectInputOnFocus?: boolean
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
  inputValue?: boolean
  /**
   * The selected value for the combobox
   */
  value?: boolean
  /**
   *  The input placeholder
   */
  placeholder?: string
  /**
   * Whether the label of the selected option
   * should be displayed in the input.
   */
  shouldInputRenderValue?: boolean | ((value: Option) => boolean)
  /**
   * Select the first option on input change
   */
  autoSelect?: boolean | "inline"
  /**
   * Function called when the input value changes
   */
  onInputValueChange?: (value: string) => string
  /**
   * Function called when an item is selected by mouse or keyboard
   */
  onSelect?: (item: Option) => void
}>

export type ComboboxMachineState = {
  value: "unknown" | "open" | "open:navigating" | "closed"
}

export const comboboxMachine = createMachine<
  ComboboxMachineContext,
  ComboboxMachineState
>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: "combobox",
      autoSelect: true,
      closeOnSelect: true,
      shouldInputRenderValue: true,
      openOnFocus: true,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
    },
  },
  {
    guards: {},
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
    },
  },
)
