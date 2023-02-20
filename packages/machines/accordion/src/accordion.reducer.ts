import { isArray } from "@zag-js/utils"
import { ItemProps, Send, State } from "./accordion.types"

export function createReducer(state: State, send: Send) {
  const focusedValue = state.context.focusedValue
  const value = state.context.value
  const multiple = state.context.multiple

  function setValue(value: string | string[]) {
    let nextValue = value
    if (multiple && !Array.isArray(nextValue)) {
      nextValue = [nextValue]
    }
    send({ type: "VALUE.SET", value: nextValue })
  }

  function getItemState(props: ItemProps) {
    return {
      isOpen: isArray(value) ? value.includes(props.value) : props.value === value,
      isFocused: focusedValue === props.value,
      isDisabled: Boolean(props.disabled ?? state.context.disabled),
    }
  }

  return {
    focusedValue,
    value,
    setValue,
    getItemState,
  }
}
