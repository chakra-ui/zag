import {
  ariaAttr,
  dataAttr,
  EventKeyMap,
  findByTypeahead,
  getEventKey,
  isElementEditable,
  visuallyHiddenStyle,
} from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { dom } from "./select.dom"
import { Option, OptionGroupLabelProps, OptionGroupProps, OptionProps, Send, State } from "./select.types"
import * as utils from "./select.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const disabled = state.context.disabled
  const invalid = state.context.invalid
  const isInteractive = state.context.isInteractive

  const isOpen = state.matches("open")

  const highlightedOption = state.context.highlightedOption
  const selectedOption = state.context.selectedOption
  const isTypingAhead = state.context.isTypingAhead

  function getOptionState(props: OptionProps) {
    const id = dom.getOptionId(state.context, props.value)
    return {
      isDisabled: Boolean(props.disabled || disabled),
      isHighlighted: state.context.highlightedId === id,
      isSelected: state.context.selectedOption?.value === props.value,
    }
  }

  const popperStyles = getPlacementStyles({
    measured: !!state.context.currentPlacement,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    highlightedOption,
    selectedOption,
    focus() {
      dom.getTriggerElement(state.context).focus()
    },
    blur() {
      dom.getTriggerElement(state.context).blur()
    },
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    setSelectedOption(value: Option) {
      utils.validateOptionData(value)
      send({ type: "SELECT_OPTION", value })
    },
    setHighlightedOption(value: Option) {
      utils.validateOptionData(value)
      send({ type: "HIGHLIGHT_OPTION", value })
    },
    clearSelectedOption() {
      send({ type: "CLEAR_SELECTED" })
    },

    labelProps: normalize.label({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      "data-part": "label",
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
      "data-readonly": dataAttr(state.context.readOnly),
      htmlFor: dom.getHiddenSelectId(state.context),
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
      type: "button",
      "aria-controls": dom.getMenuId(state.context),
      "aria-expanded": isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-haspopup": "listbox",
      "aria-labelledby": "label",
      "data-part": "trigger",
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
      "aria-invalid": invalid,
      "data-readonly": dataAttr(state.context.readOnly),
      "data-placement": state.context.currentPlacement,
      "data-placeholder-shown": dataAttr(!state.context.hasSelectedOption),
      onPointerDown(event) {
        if (event.button || event.ctrlKey || !isInteractive) return
        event.currentTarget.dataset.pointerType = event.pointerType
        if (disabled || event.pointerType === "touch") return
        send({ type: "TRIGGER_CLICK" })
      },
      onClick(event) {
        if (!isInteractive || event.button) return
        if (event.currentTarget.dataset.pointerType === "touch") {
          send({ type: "TRIGGER_CLICK" })
        }
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onKeyDown(event) {
        if (!isInteractive) return
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
          Enter() {
            send({ type: "TRIGGER_CLICK" })
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
      const { value, label, valueText } = props
      const optionState = getOptionState(props)
      return normalize.element({
        id: dom.getOptionId(state.context, value),
        role: "option",
        "data-part": "option",
        "data-label": label,
        "data-value": value,
        "data-valuetext": valueText ?? label,
        "aria-selected": optionState.isSelected,
        "data-selected": dataAttr(optionState.isSelected),
        "data-focus": dataAttr(optionState.isHighlighted),
        "data-disabled": dataAttr(optionState.isDisabled),
        "aria-disabled": ariaAttr(optionState.isDisabled),
      })
    },

    getOptionGroupLabelProps(props: OptionGroupLabelProps) {
      const { htmlFor } = props
      return normalize.element({
        id: dom.getOptionGroupId(state.context, htmlFor),
        role: "group",
        "data-part": "option-group-label",
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { id } = props
      return normalize.element({
        "data-disabled": dataAttr(disabled),
        id: dom.getOptionGroupId(state.context, id),
        "data-part": "option-group",
        "aria-labelledby": dom.getOptionGroupLabelId(state.context, id),
      })
    },

    selectProps: normalize.select({
      "data-part": "select",
      name: state.context.name,
      form: state.context.form,
      disabled: !isInteractive,
      "aria-hidden": true,
      id: dom.getHiddenSelectId(state.context),
      defaultValue: state.context.selectedOption?.value,
      style: visuallyHiddenStyle,
      tabIndex: -1,
      // Some browser extensions will focus the hidden select.
      // Let's forward the focus to the trigger.
      onFocus() {
        dom.getTriggerElement(state.context)?.focus()
      },
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
        if (!isInteractive) return
        const option = dom.getClosestOption(event.target)
        if (!option || option.hasAttribute("data-disabled")) {
          send({ type: "POINTER_LEAVE" })
        } else {
          send({ type: "POINTER_MOVE", id: option.id, target: option })
        }
      },
      onPointerUp(event) {
        if (!isInteractive) return
        const option = dom.getClosestOption(event.target)
        if (!option || option.hasAttribute("data-disabled")) return
        option?.click()
      },
      onPointerLeave() {
        send({ type: "POINTER_LEAVE" })
      },
      onClick(event) {
        if (!isInteractive) return
        const option = dom.getClosestOption(event.target)
        if (!option || option.hasAttribute("data-disabled")) return
        send({ type: "OPTION_CLICK", id: option.id })
      },
      onKeyDown(event) {
        if (!isInteractive) return
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

        if (isElementEditable(event.target)) {
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
