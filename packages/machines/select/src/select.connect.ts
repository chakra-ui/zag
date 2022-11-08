import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send, ItemProps, OptionProps } from "./select.types"
import { dom } from "./select.dom"
import { dataAttr, EventKeyMap, getEventKey, visuallyHiddenStyle } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const disabled = state.context.disabled
  const invalid = state.context.invalid
  const isOpen = state.matches("open")

  const highlightedId = state.context.highlightedId
  const selectedOption = state.context.selectedOption
  const isTypingAhead = state.context.isTypingAhead

  function getOptionState(props: ItemProps) {
    const { value, disabled } = props
    const id = dom.getOptionId(state.context, value)
    return {
      isDisabled: Boolean(props.disabled ?? disabled),
      isHighlighted: state.context.highlightedId === id,
      isSelected: state.context.selectedOption?.value === value,
    }
  }

  const popperStyles = getPlacementStyles({
    measured: !!state.context.currentPlacement,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    highlightedId,
    selectedOption,
    rendered: state.context.rendered,

    openMenu() {},
    closeMenu() {},
    selectItem(item: string | null) {},
    highlightItem(item: string | null) {},
    reset() {},

    labelProps: normalize.label({
      id: dom.getLabelId(state.context),
      "data-part": "label",
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
    }),

    positionerProps: normalize.element({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    triggerProps: normalize.button({
      id: dom.getTriggerId(state.context),
      disabled,
      role: "combobox",
      tabIndex: 0,
      "aria-controls": dom.getListboxId(state.context),
      "aria-expanded": isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-haspopup": "listbox",
      "aria-labelledby": "label",
      "data-part": "trigger",
      "aria-activedescendant": state.context.highlightedId || "",
      "data-invalid": dataAttr(invalid),
      "data-placement": state.context.currentPlacement,
      "data-placeholder-shown": dataAttr(!state.context.hasValue),
      onClick() {
        if (disabled) return
        send({ type: "TRIGGER_CLICK" })
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onKeyDown(event) {
        if (disabled) return
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP" })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              send({ type: "TRIGGER_KEY" })
            }
          },
        }

        const exec = keyMap[getEventKey(event)]

        if (exec) {
          exec(event)
          event.preventDefault()
        } else {
          const isSingleKey = event.key.length === 1
          if (!isSingleKey) return
          send({ type: "TYPEAHEAD", key: event.key })
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
        "data-valuetext": label,
        "aria-selected": _state.isSelected,
        "data-selected": dataAttr(_state.isSelected),
        "data-focus": dataAttr(_state.isHighlighted),
        "data-disabled": dataAttr(_state.isDisabled),
      })
    },

    selectProps: normalize.select({
      name: state.context.name,
      id: dom.getSelectId(state.context),
      defaultValue: state.context.selectedOption?.value,
      style: visuallyHiddenStyle,
    }),

    listboxProps: normalize.element({
      hidden: !isOpen,
      id: dom.getListboxId(state.context),
      role: "listbox",
      "data-part": "listbox",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: -1,
      onMouseMove(event) {
        if (disabled) return
        const { target } = event
        const option = target instanceof HTMLElement ? target.closest("[data-part=option]") : null

        if (option) {
          send({ type: "HOVER", id: option.id })
        }
      },
      onClick(event) {
        if (disabled) return
        const { target } = event
        const option = target instanceof HTMLElement ? target.closest("[data-part=option]") : null

        if (option) {
          send({ type: "OPTION_CLICK", id: option.id })
        }
      },
      onKeyDown(event) {
        if (disabled) return
        const keyMap: EventKeyMap = {
          Escape() {
            send({ type: "ESC_KEY" })
          },
          ArrowUp() {
            send({ type: "ARROW_UP" })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN" })
          },
          Tab() {
            send({ type: "TAB" })
          },
          Enter() {
            send({ type: "TRIGGER_KEY" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              keyMap.Enter?.(event)
            }
          },
        }

        const exec = keyMap[getEventKey(event)]

        if (exec) {
          exec(event)
          event.preventDefault()
        } else {
          const isSingleKey = event.key.length === 1
          if (!isSingleKey) return
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),
  }
}
