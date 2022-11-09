import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send, ItemProps, OptionProps, Option } from "./select.types"
import { dom } from "./select.dom"
import { ariaAttr, dataAttr, EventKeyMap, findByTypeahead, getEventKey, visuallyHiddenStyle } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import { isString } from "@zag-js/utils"

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

    focus() {
      dom.getTriggerElement(state.context).focus()
    },
    blur() {
      dom.getTriggerElement(state.context).blur()
    },

    openMenu() {
      send("OPEN")
    },
    closeMenu() {
      send("CLOSE")
    },
    selectItem(item: string | null) {
      send({ type: "SET_SELECTED", value: item })
    },
    highlight(item: string | Option | null) {
      const id = isString(item) ? item : item?.value
      if (!id) return
      send({ type: "SET_HIGHLIGHT", id })
    },
    reset() {
      send("RESET")
    },

    labelProps: normalize.label({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      "data-part": "label",
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
      onClick() {
        if (disabled) return
        dom.getTriggerElement(state.context)?.focus()
      },
    }),

    positionerProps: normalize.element({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    triggerProps: normalize.button({
      id: dom.getTriggerId(state.context),
      disabled,
      dir: state.context.dir,
      role: "combobox",
      "aria-controls": dom.getMenuId(state.context),
      "aria-expanded": isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-haspopup": "listbox",
      "aria-labelledby": "label",
      "data-part": "trigger",
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
          ArrowLeft() {
            send({ type: "ARROW_LEFT" })
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT" })
          },
          Home() {
            send({ type: "HOME" })
          },
          End() {
            send({ type: "END" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              send({ type: "TRIGGER_KEY" })
            }
          },
        }

        const exec = keyMap[getEventKey(event, state.context)]

        if (exec) {
          exec(event)
          event.preventDefault()
          return
        }

        if (findByTypeahead.isValidEvent(event)) {
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    getOptionState,
    getOptionProps(props: OptionProps) {
      const { value, label } = props
      const optionState = getOptionState(props)
      return normalize.element({
        id: dom.getOptionId(state.context, value),
        role: "option",
        "data-part": "option",
        "data-label": label,
        "data-value": value,
        "data-valuetext": label,
        "aria-selected": optionState.isSelected,
        "data-selected": dataAttr(optionState.isSelected),
        "data-focus": dataAttr(optionState.isHighlighted),
        "data-disabled": dataAttr(optionState.isDisabled),
        "aria-disabled": ariaAttr(optionState.isDisabled),
      })
    },

    selectProps: normalize.select({
      "data-part": "select",
      name: state.context.name,
      disabled,
      id: dom.getSelectId(state.context),
      defaultValue: state.context.selectedOption?.value,
      style: visuallyHiddenStyle,
      tabIndex: -1,
      "aria-labelledby": dom.getLabelId(state.context),
    }),

    menuProps: normalize.element({
      hidden: !isOpen,
      dir: state.context.dir,
      id: dom.getMenuId(state.context),
      role: "listbox",
      "data-part": "menu",
      "aria-activedescendant": state.context.highlightedId || "",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: -1,
      onPointerMove(event) {
        if (disabled) return
        const option = dom.getClosestOption(event.target)
        if (option) {
          send({ type: "POINTER_MOVE", id: option.id })
        }
      },
      onPointerLeave() {
        send({ type: "POINTER_LEAVE" })
      },
      onClick(event) {
        if (disabled) return
        const option = dom.getClosestOption(event.target)
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
          Home() {
            send({ type: "HOME" })
          },
          End() {
            send({ type: "END" })
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
          return
        }

        if (findByTypeahead.isValidEvent(event)) {
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),
  }
}
