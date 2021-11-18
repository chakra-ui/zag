import type { StateMachine as S } from "@ui-machines/core"
import type { LiveRegion } from "@ui-machines/dom-utils/live-region"
import type { Context } from "@ui-machines/types"

export type ComboboxMachineState = {
  value: "unknown" | "idle" | "focused" | "suggesting" | "navigating" | "interacting"
}

export type ComboboxMachineContext = Context<{
  inputValue: string
  readonly trimmedInputValue: string
  readonly isInputValueEmpty: boolean

  selectedValue: string
  navigationValue: string
  readonly hintValue: string

  activeId: string | null

  name?: string
  disabled?: boolean
  readonly?: boolean
  readonly isInteractive: boolean
  required?: boolean
  placeholder?: string
  autoComplete: boolean

  autoFocus?: boolean
  selectOnFocus?: boolean
  focusOnClear?: boolean

  closeOnBlur?: boolean
  closeOnSelect?: boolean | ((value: OptionData) => boolean)

  clearOnEsc?: boolean
  openOnClick?: boolean
  onInputValueChange?: (value: string) => string
  onSelect?: (value: string) => void
  liveRegion?: LiveRegion | null
  shouldInputRenderValue?: boolean
  firstOptionLabel?: string
}>

export type OptionData = {
  label: string
  value: string
}

export type ComboboxOptionProps = OptionData & {
  index?: number
  optionCount?: number
  disabled?: boolean
}

export type ComboboxState = S.State<ComboboxMachineContext, ComboboxMachineState>

export type ComboboxSend = S.Send<S.AnyEventObject>
