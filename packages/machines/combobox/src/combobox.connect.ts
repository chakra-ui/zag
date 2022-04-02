import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, nextTick, validateBlur } from "@ui-machines/dom-utils"
import { getPlacementStyles } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./combobox.dom"
import { OptionGroupProps, OptionProps, Send, State } from "./combobox.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const pointerdownNode = state.context.pointerdownNode
  const messages = state.context.messages

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadonly = state.context.readonly

  const isExpanded = state.hasTag("expanded")
  const isFocused = state.hasTag("focused")
  const isIdle = state.hasTag("idle")

  const autoFill = isExpanded && state.context.navigationValue && state.context.autoComplete
  const showClearButton = (!isIdle || state.context.isHoveringInput) && !state.context.isInputValueEmpty

  const popperStyles = getPlacementStyles({
    measured: !!state.context.currentPlacement,
  })

  return {
    isFocused,
    isExpanded,
    inputValue: state.context.inputValue,
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send("CLEAR_VALUE")
    },
    focus() {
      nextTick(() => {
        dom.getInputEl(state.context)?.focus()
      })
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadonly),
    }),

    labelProps: normalize.label<T>({
      "data-part": "label",
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": dataAttr(isReadonly),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
    }),

    controlProps: normalize.element<T>({
      "data-part": "control",
      id: dom.getControlId(state.context),
      "data-expanded": dataAttr(isExpanded),
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      onPointerOver() {
        if (!isInteractive) return
        send("POINTER_OVER")
      },
      onPointerLeave() {
        if (!isInteractive) return
        send("POINTER_LEAVE")
      },
    }),

    positionerProps: normalize.element<T>({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      "data-expanded": dataAttr(isExpanded),
      hidden: !isExpanded,
      style: popperStyles.floating,
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      "aria-invalid": isInvalid,
      "data-invalid": dataAttr(isInvalid),
      name: state.context.name,
      disabled: isDisabled,
      autoFocus: state.context.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "off",
      spellCheck: "false",
      readOnly: isReadonly,
      placeholder: state.context.placeholder,
      id: dom.getInputId(state.context),
      type: "text",
      role: "combobox",
      value: autoFill ? state.context.navigationValue : state.context.inputValue,
      "aria-autocomplete": state.context.autoComplete ? "both" : "list",
      "aria-controls": isExpanded ? dom.getListboxId(state.context) : undefined,
      "aria-expanded": isExpanded,
      "aria-activedescendant": state.context.activeId ?? undefined,
      onPointerDown() {
        if (!isInteractive) return
        send("POINTER_DOWN")
      },
      onBlur(event) {
        if (!isInteractive) return
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getListboxEl(state.context), dom.getToggleBtnEl(state.context)],
          fallback: pointerdownNode,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onFocus() {
        if (!isInteractive) return
        send("FOCUS")
      },
      onChange(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        send({ type: "CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (evt.ctrlKey || evt.shiftKey || evt.isComposing) return

        let preventDefault = false

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            send(event.altKey ? "ALT_DOWN" : "ARROW_DOWN")
            preventDefault = true
          },
          ArrowUp(event) {
            send(event.altKey ? "ALT_UP" : "ARROW_UP")
            preventDefault = true
          },
          ArrowLeft() {
            send("CLEAR_FOCUS")
          },
          ArrowRight() {
            send("CLEAR_FOCUS")
          },
          Home(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (!isCtrlKey) {
              send("HOME")
              preventDefault = true
            }
          },
          End(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (!isCtrlKey) {
              send("END")
              preventDefault = true
            }
          },
          Enter() {
            send("ENTER")
            preventDefault = true
          },
          Escape() {
            send("ESCAPE")
            preventDefault = true
          },
          Backspace() {
            send("BACKSPACE")
          },
          Delete() {
            send("DELETE")
          },
          Tab() {
            send("TAB")
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keymap[key]

        if (exec) {
          exec(event)
        }

        if (preventDefault) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
    }),

    toggleButtonProps: normalize.button<T>({
      "data-part": "toggle-button",
      id: dom.getToggleBtnId(state.context),
      "aria-haspopup": "listbox",
      type: "button",
      tabIndex: -1,
      "aria-label": messages.toggleButtonLabel,
      "aria-expanded": isExpanded,
      "aria-controls": isExpanded ? dom.getListboxId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": dataAttr(isReadonly),
      "data-disabled": dataAttr(isDisabled),
      onPointerDown(event) {
        if (!isInteractive) return
        send("CLICK_BUTTON")
        event.preventDefault()
      },
    }),

    listboxProps: normalize.element<T>({
      "data-part": "listbox",
      id: dom.getListboxId(state.context),
      role: "listbox",
      hidden: !isExpanded,
      "aria-labelledby": dom.getLabelId(state.context),
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    clearButtonProps: normalize.button<T>({
      "data-part": "clear-button",
      id: dom.getClearBtnId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": messages.clearButtonLabel,
      hidden: !showClearButton,
      onPointerDown(event) {
        if (!isInteractive) return
        send("CLEAR_VALUE")
        event.preventDefault()
      },
    }),

    getOptionProps(props: OptionProps) {
      const { value, label, index, count, disabled } = props
      const id = dom.getOptionId(state.context, value, index)
      const focused = state.context.activeId === id
      const checked = state.context.selectedValue === value

      return normalize.element<T>({
        "data-part": "option",
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-checked": dataAttr(checked),
        "aria-selected": focused,
        "aria-disabled": disabled,
        "aria-posinset": count && index != null ? index + 1 : undefined,
        "aria-setsize": count,
        "data-value": value,
        "data-label": label,
        // Prefer pointermove to pointerenter to avoid interrupting the keyboard navigation
        onPointerMove() {
          if (disabled) return
          send({ type: "POINTEROVER_OPTION", id, value: label })
        },
        onPointerUp(event) {
          if (disabled) return
          event.currentTarget.click()
        },
        onClick() {
          if (disabled) return
          send({ type: "CLICK_OPTION", id, value: label })
        },
        onAuxClick(event) {
          if (disabled) return
          event.preventDefault()
          event.currentTarget.click()
        },
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { label } = props
      return normalize.element<T>({
        "data-part": "option-group",
        role: "group",
        "aria-label": label,
      })
    },
  }
}
