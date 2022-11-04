import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send, ItemProps, OptionProps } from "./select.types"
import { dom } from "./select.dom"
import { dataAttr, EventKeyMap } from "@zag-js/dom-utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const disabled = state.context.disabled
  const invalid = state.context.invalid
  const isOpen = state.matches("open")

  const focusedId = state.context.focusedId
  const selectedOption = state.context.selectedOption

  function getOptionState(props: ItemProps) {
    return {
      isDisabled: Boolean(props.disabled ?? disabled),
      isFocused: state.context.focusedId === props.value,
      isSelected: state.context.selectedOption?.value === props.value,
    }
  }

  return {
    focusedId,
    selectedOption,
    renderedValue: state.context.renderedValue,

    getLabelProps: normalize.label({
      id: dom.getLabelId(state.context),
      "data-part": "label",
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
    }),

    getTriggerProps: normalize.button({
      id: dom.getTriggerId(state.context),
      disabled,
      "aria-controls": "listbox",
      "aria-expanded": isOpen,
      "aria-haspopup": "listbox",
      "aria-labelledby": "label",
      "data-part": "trigger",
      "data-invalid": dataAttr(invalid),
      onClick() {
        send({ type: "TRIGGER_CLICK" })
      },
      onFocus() {
        send("FOCUS")
      },
      onKeyDown(event) {
        const { key } = event
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP" })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN" })
          },
        }

        const exec = keyMap[key]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),

    getOptionState,
    getOptionProps(props: OptionProps) {
      const { value, label } = props
      const _state = getOptionState(props)
      return normalize.element({
        id: dom.getOptionId(state.context, value),
        role: "option",
        "data-part": "option",
        "data-label": label,
        "data-value": value,
        tabIndex: _state.isFocused ? 0 : -1,
        "aria-selected": _state.isSelected,
        "data-focus": dataAttr(_state.isFocused),
        "data-disabled": dataAttr(_state.isDisabled),
      })
    },
  }
}
