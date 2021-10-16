import { StateMachine as S } from "@ui-machines/core"
import { Context, LiveRegion } from "../utils"

export type ComboboxMachineState = {
  value: "unknown" | "idle" | "focused" | "suggesting" | "navigating" | "interacting"
}

export type ComboboxMachineContext = Context<{
  name?: string
  disabled?: boolean
  closeOnBlur?: boolean
  autoFocus?: boolean
  closeOnSelect?: boolean | ((value: OptionData) => boolean)
  clearOnEsc?: boolean
  openOnClick?: boolean
  selectOnFocus?: boolean
  readonly?: boolean
  required?: boolean
  inputValue: string
  readonly trimmedInputValue: string
  selectedValue: string
  navigationValue: string
  placeholder?: string
  autoComplete?: true
  onInputValueChange?: (value: string) => string
  onSelect?: (value: string) => void
  activeId: string | null
  liveRegion?: LiveRegion | null
  shouldInputRenderValue?: boolean
  focusOnClear?: boolean
  firstOptionLabel?: string
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
