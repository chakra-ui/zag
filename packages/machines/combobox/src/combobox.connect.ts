import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, isLeftClick } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./combobox.dom"
import type { OptionData, OptionGroupProps, OptionProps, Send, State } from "./combobox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const translations = state.context.translations

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadonly = state.context.readonly

  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")
  const isIdle = state.hasTag("idle")

  const autofill = isOpen && state.context.navigationData && state.context.autoComplete
  const showClearButton = (!isIdle || state.context.isHovering) && !state.context.isInputValueEmpty

  const popperStyles = getPlacementStyles({
    measured: !!state.context.currentPlacement,
    placement: state.context.currentPlacement,
  })

  const api = {
    isFocused,
    isOpen,
    isInputValueEmpty: state.context.isInputValueEmpty,
    inputValue: state.context.inputValue,
    activeOption: state.context.activeOptionData,
    selectedValue: state.context.selectionData?.value,
    setValue(value: string | OptionData) {
      let data: OptionData
      if (typeof value === "string") {
        data = { value, label: dom.getValueLabel(state.context, value) }
      } else {
        data = value
      }
      send({ type: "SET_VALUE", ...data })
    },
    setInputValue(value: string) {
      send({ type: "SET_INPUT_VALUE", value })
    },
    clearValue() {
      send("CLEAR_VALUE")
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    rootProps: normalize.element({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadonly),
    }),

    labelProps: normalize.label({
      "data-part": "label",
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": dataAttr(isReadonly),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
    }),

    controlProps: normalize.element({
      "data-part": "control",
      id: dom.getControlId(state.context),
      "data-expanded": dataAttr(isOpen),
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

    positionerProps: normalize.element({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      "data-expanded": dataAttr(isOpen),
      hidden: !isOpen,
      style: popperStyles.floating,
    }),

    inputProps: normalize.input({
      "data-part": "input",
      "aria-invalid": isInvalid,
      "data-invalid": dataAttr(isInvalid),
      name: state.context.name,
      disabled: isDisabled,
      autoFocus: state.context.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      spellCheck: "false",
      readOnly: isReadonly,
      placeholder: state.context.placeholder,
      id: dom.getInputId(state.context),
      type: "text",
      role: "combobox",
      value: autofill ? state.context.navigationData?.label : state.context.inputValue,
      "aria-autocomplete": state.context.autoComplete ? "both" : "list",
      "aria-controls": isOpen ? dom.getListboxId(state.context) : undefined,
      "aria-expanded": isOpen,
      "aria-activedescendant": state.context.activeId ?? undefined,
      onPointerDown() {
        if (!isInteractive) return
        send("POINTER_DOWN")
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

        let prevent = false

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            send(event.altKey ? "ALT_ARROW_DOWN" : "ARROW_DOWN")
            prevent = true
          },
          ArrowUp() {
            send(event.altKey ? "ALT_ARROW_UP" : "ARROW_UP")
            prevent = true
          },
          Home(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (isCtrlKey) return
            send({ type: "HOME", preventDefault: () => event.preventDefault() })
          },
          End(event) {
            const isCtrlKey = event.ctrlKey || event.metaKey
            if (isCtrlKey) return
            send({ type: "END", preventDefault: () => event.preventDefault() })
          },
          Enter() {
            send("ENTER")
            prevent = true
          },
          Escape() {
            send("ESCAPE")
            prevent = true
          },
          Tab() {
            send("TAB")
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keymap[key]
        exec?.(event)

        if (prevent) {
          event.preventDefault()
        }
      },
    }),

    toggleButtonProps: normalize.button({
      "data-part": "toggle-button",
      id: dom.getToggleBtnId(state.context),
      "aria-haspopup": "listbox",
      type: "button",
      tabIndex: -1,
      "aria-label": translations.toggleButtonLabel,
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? dom.getListboxId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": dataAttr(isReadonly),
      "data-disabled": dataAttr(isDisabled),
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt)) return
        send("CLICK_BUTTON")
        event.preventDefault()
      },
    }),

    listboxProps: normalize.element({
      "data-part": "listbox",
      id: dom.getListboxId(state.context),
      role: "listbox",
      hidden: !isOpen,
      "aria-labelledby": dom.getLabelId(state.context),
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    clearButtonProps: normalize.button({
      "data-part": "clear-button",
      id: dom.getClearBtnId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": translations.clearButtonLabel,
      hidden: !showClearButton,
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt)) return
        send("CLEAR_VALUE")
        event.preventDefault()
      },
    }),

    getOptionState(props: OptionProps) {
      const { value, index, disabled } = props
      const id = dom.getOptionId(state.context, value, index)
      const focused = state.context.activeId === id
      const checked = state.context.selectionData?.value === value
      return { disabled, focused, checked }
    },

    getOptionProps(props: OptionProps) {
      const { value, label, index, count } = props
      const id = dom.getOptionId(state.context, value, index)
      const _state = api.getOptionState(props)

      return normalize.element({
        "data-part": "option",
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(_state.focused),
        "data-disabled": dataAttr(_state.disabled),
        "data-checked": dataAttr(_state.checked),
        "aria-selected": _state.focused,
        "aria-disabled": _state.disabled,
        "aria-posinset": count && index != null ? index + 1 : undefined,
        "aria-setsize": count,
        "data-value": value,
        "data-label": label,
        // Prefer `pointermove` to `pointerenter` to avoid interrupting the keyboard navigation
        // NOTE: for perf, we may want to move these handlers to the listbox
        onPointerMove() {
          if (_state.disabled) return
          send({ type: "POINTEROVER_OPTION", id, value, label })
        },
        onPointerUp(event) {
          if (_state.disabled) return
          event.currentTarget.click()
        },
        onClick() {
          if (_state.disabled) return
          send({ type: "CLICK_OPTION", id, value, label })
        },
        onAuxClick(event) {
          if (_state.disabled) return
          event.preventDefault()
          event.currentTarget.click()
        },
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { label } = props
      return normalize.element({
        "data-part": "option-group",
        role: "group",
        "aria-label": label,
      })
    },
  }

  return api
}
