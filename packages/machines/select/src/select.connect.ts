import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, getByTypeahead, isEditableElement, isSelfEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./select.anatomy"
import { dom } from "./select.dom"
import type {
  MachineApi,
  Option,
  OptionGroupLabelProps,
  OptionGroupProps,
  OptionProps,
  Send,
  State,
} from "./select.types"
import * as utils from "./select.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isDisabled = state.context.isDisabled
  const isInvalid = state.context.invalid
  const isInteractive = state.context.isInteractive

  const isOpen = state.matches("open")

  const highlightedOption = state.context.highlightedOption
  const selectedOption = state.context.selectedOption
  const isTypingAhead = state.context.isTypingAhead

  function getOptionState(props: OptionProps) {
    const id = dom.getOptionId(state.context, props.value)
    return {
      isDisabled: Boolean(props.disabled || isDisabled),
      isHighlighted: state.context.highlightedId === id,
      isChecked: state.context.selectedOption?.value === props.value,
    }
  }

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    highlightedOption,
    selectedOption,

    focus() {
      dom.getTriggerElement(state.context)?.focus()
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

    getOptionState,

    labelProps: normalize.label({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(state.context.readOnly),
      htmlFor: dom.getHiddenSelectId(state.context),
      onClick() {
        if (isDisabled) return
        dom.getTriggerElement(state.context)?.focus()
      },
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    triggerProps: normalize.button({
      id: dom.getTriggerId(state.context),
      disabled: isDisabled,
      dir: state.context.dir,
      type: "button",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-haspopup": "listbox",
      "aria-labelledby": dom.getLabelId(state.context),
      ...parts.trigger.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": isInvalid,
      "data-readonly": dataAttr(state.context.readOnly),
      "data-placement": state.context.currentPlacement,
      "data-placeholder-shown": dataAttr(!state.context.hasSelectedOption),
      onPointerDown(event) {
        if (event.button || event.ctrlKey || !isInteractive) return
        event.currentTarget.dataset.pointerType = event.pointerType
        if (isDisabled || event.pointerType === "touch") return
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

        if (getByTypeahead.isValidEvent(event)) {
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    getOptionProps(props: OptionProps) {
      const { value, label, valueText } = props
      const optionState = getOptionState(props)
      return normalize.element({
        id: dom.getOptionId(state.context, value),
        role: "option",
        ...parts.option.attrs,
        "data-label": label,
        "data-value": value,
        "data-valuetext": valueText ?? label,
        "aria-selected": optionState.isChecked,
        "data-state": optionState.isChecked ? "checked" : "unchecked",
        "data-highlighted": dataAttr(optionState.isHighlighted),
        "data-disabled": dataAttr(optionState.isDisabled),
        "aria-disabled": ariaAttr(optionState.isDisabled),
      })
    },

    getOptionGroupLabelProps(props: OptionGroupLabelProps) {
      const { htmlFor } = props
      return normalize.element({
        id: dom.getOptionGroupId(state.context, htmlFor),
        role: "group",
        ...parts.optionGroupLabel.attrs,
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { id } = props
      return normalize.element({
        ...parts.optionGroup.attrs,
        "data-disabled": dataAttr(isDisabled),
        id: dom.getOptionGroupId(state.context, id),
        "aria-labelledby": dom.getOptionGroupLabelId(state.context, id),
      })
    },

    hiddenSelectProps: normalize.select({
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

    contentProps: normalize.element({
      hidden: !isOpen,
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      role: "listbox",
      ...parts.content.attrs,
      "data-state": isOpen ? "open" : "closed",
      "aria-activedescendant": state.context.highlightedId || "",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: 0,
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
        send({ type: "OPTION_CLICK", src: "pointerup", id: option.id })
      },
      onPointerLeave() {
        send({ type: "POINTER_LEAVE" })
      },
      onClick(event) {
        if (!isInteractive) return
        const option = dom.getClosestOption(event.target)
        if (!option || option.hasAttribute("data-disabled")) return
        send({ type: "OPTION_CLICK", src: "click", id: option.id })
      },
      onKeyDown(event) {
        if (!isInteractive || !isSelfEvent(event)) return

        const keyMap: EventKeyMap = {
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
          Tab(event) {
            if (event.shiftKey) return
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

        if (isEditableElement(event.target)) {
          return
        }

        if (getByTypeahead.isValidEvent(event)) {
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),
  }
}
