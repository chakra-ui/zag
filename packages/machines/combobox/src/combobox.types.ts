import type { StateMachine as S } from "@zag-js/core"
import type { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from "@zag-js/interact-outside"
import type { LiveRegion } from "@zag-js/live-region"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type IntlTranslations = {
  triggerLabel?: string
  clearTriggerLabel?: string
  countAnnouncement(count: number): string
  navigationHint?: string
}

type ElementIds = Partial<{
  root: string
  label: string
  control: string
  input: string
  content: string
  trigger: string
  clearTrigger: string
  option(id: string, index?: number): string
  positioner: string
  optionGroup(id: string | number): string
  optionGroupLabel(id: string | number): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the combobox. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The current value of the combobox's input
     */
    inputValue: string
    /**
     * The selected option's value
     */
    selectionData: OptionData | null
    /**
     * The `name` attribute of the combobox's input. Useful for form submission
     */
    name?: string
    /**
     * The associate form of the combobox.
     */
    form?: string
    /**
     * Whether the combobox is disabled
     */
    disabled?: boolean
    /**
     * Whether the combobox is readonly. This puts the combobox in a "non-editable" mode
     * but the user can still interact with it
     */
    readOnly?: boolean
    /**
     * Whether the combobox is required
     */
    invalid?: boolean
    /**
     * The placeholder text of the combobox's input
     */
    placeholder?: string
    /**
     * Defines the auto-completion behavior of the combobox.
     *
     * - `autohighlight`: The first focused option is highlighted as the user types
     * - `autocomplete`: Navigating the listbox with the arrow keys selects the option and the input is updated
     */
    inputBehavior: "autohighlight" | "autocomplete" | "none"
    /**
     * Whether to blur the input on select
     */
    blurOnSelect?: boolean
    /**
     * The behavior of the combobox when an option is selected
     */
    selectionBehavior?: "clear" | "set"
    /**
     * Whether to select the focused option when the `Tab` key is pressed
     */
    selectOnTab: boolean
    /**
     * Whether to autofocus the input on mount
     */
    autoFocus?: boolean
    /**
     * Whether to select the input's text content on focus
     */
    selectInputOnFocus?: boolean
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
     * Whether to hide all elements besides the combobox parts. Useful for accessibility
     */
    ariaHidden?: boolean
    /**
     * Function called to validate the input value
     */
    isCustomValue?: (details: { inputValue: string; previousValue: string | undefined }) => boolean
    /**
     * Whether to loop the keyboard navigation through the options
     */
    loop?: boolean
    /**
     * The options used to dynamically position the menu
     */
    positioning: PositioningOptions
    /**
     * Function called when the input's value changes
     */
    onInputChange?: (details: { value: string }) => void
    /**
     * Function called when a new option is selected
     */
    onSelect?: (details: Partial<OptionData> & { relatedTarget: HTMLElement | null }) => void
    /**
     * Function called when an options is highlighted using the pointer
     * or keyboard navigation.
     */
    onHighlight?: (details: Partial<OptionData> & { relatedTarget: HTMLElement | null }) => void
    /**
     * Function called when the popup is opened
     */
    onOpen?: () => void
    /**
     * Function called when the popup is closed
     */
    onClose?: () => void
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
    onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
    onFocusOutside?: (event: FocusOutsideEvent) => void
    onInteractOutside?: (event: InteractOutsideEvent) => void
  }

export type PublicApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the combobox is focused
   */
  isFocused: boolean
  /**
   * Whether the combobox content or listbox is open
   */
  isOpen: boolean
  /**
   * Whether the combobox input is empty
   */
  isInputValueEmpty: boolean
  /**
   * The current value of the combobox input
   */
  inputValue: string
  /**
   * The currently focused option (by pointer or keyboard)
   */
  focusedOption: OptionData | null
  /**
   * The currently selected option value
   */
  selectedValue: string | undefined
  /**
   * Function to set the combobox value
   */
  setValue(value: string | OptionData): void
  /**
   * Function to set the combobox input value
   */
  setInputValue(value: string): void
  /**
   * Function to clear the combobox input value and selected value
   */
  clearValue(): void
  /**
   * Function to focus the combobox input
   */
  focus(): void
  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  positionerProps: T["element"]
  inputProps: T["input"]
  triggerProps: T["button"]
  contentProps: T["element"]
  clearTriggerProps: T["button"]
  getOptionState(props: OptionProps): {
    isDisabled: boolean
    isHighlighted: boolean
    isChecked: boolean
  }
  getOptionProps(props: OptionProps): T["element"]
  getOptionGroupProps(props: OptionGroupProps): T["element"]
  getOptionGroupLabelProps(props: OptionGroupLabelProps): T["element"]
}

/**
 * This is the actual context exposed to the user.
 */
export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the input's value is empty
   */
  isInputValueEmpty: boolean
  /**
   * @computed
   * Whether the combobox is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   */
  autoComplete: boolean
  /**
   * @computed
   */
  autoHighlight: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The active option's id. Used to set the `aria-activedescendant` attribute
   */
  focusedId: string | null
  /**
   * @internal
   * The data associated with the focused option
   */
  focusedOptionData: OptionData | null
  /**
   * @internal
   * The value of the option when the user hovers/navigates with keyboard
   */
  navigationData: OptionData | null
  /**
   * @internal
   * The live region used to announce changes in the combobox
   */
  liveRegion?: LiveRegion | null
  /**
   * @internal
   * Whether the pointer is hovering the combobox input. Used to show/hide the clear button
   */
  isHovering: boolean
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
  /**
   * @internal
   * The label of the closest section to the focused option
   */
  sectionLabel?: string
  /**
   * @internal
   * Whether the event source is a keyboard event
   */
  isKeyboardEvent?: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "suggesting" | "interacting"
  tags: "open" | "focused" | "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

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
  id: string
}

export type OptionGroupLabelProps = {
  htmlFor: string
}

export type { InteractOutsideEvent, Placement, PositioningOptions }
