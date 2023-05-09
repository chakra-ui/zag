import type { ItemProps, ItemState, Send, State } from "./accordion.types"

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

  function getItemState(props: ItemProps): ItemState {
    return {
      isOpen: Array.isArray(value) ? value.includes(props.value) : props.value === value,
      isFocused: focusedValue === props.value,
      isDisabled: Boolean(props.disabled ?? state.context.disabled),
    }
  }

  return {
    /**
     * The value of the focused accordion item.
     */
    focusedValue,
    /**
     * The value of the accordion.
     */
    value,
    /**
     * Sets the value of the accordion.
     */
    setValue,
    /**
     * Gets the state of an accordion item.
     */
    getItemState,
  }
}
