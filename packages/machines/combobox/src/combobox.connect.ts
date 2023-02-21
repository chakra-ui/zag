import { EventKeyMap, getEventKey, getNativeEvent } from "@zag-js/dom-event"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type { OptionData, OptionGroupProps, OptionProps, Send, State } from "./combobox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const translations = state.context.translations

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly

  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")
  const isIdle = state.hasTag("idle")

  const autofill = isOpen && state.context.navigationData && state.context.autoComplete
  const showClearButton = (!isIdle || state.context.isHovering) && !state.context.isInputValueEmpty

  const value = autofill ? state.context.navigationData?.label : state.context.inputValue

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
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-invalid": isInvalid || undefined,
      "data-readonly": isReadOnly || undefined,
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": isReadOnly || undefined,
      "data-disabled": isDisabled || undefined,
      "data-invalid": isInvalid || undefined,
      "data-focus": isFocused || undefined,
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-expanded": isOpen || undefined,
      "data-focus": isFocused || undefined,
      "data-disabled": isDisabled || undefined,
      "data-invalid": isInvalid || undefined,
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
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      "data-expanded": isOpen || undefined,
      hidden: !isOpen,
      style: popperStyles.floating,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      "aria-invalid": isInvalid,
      "data-invalid": isInvalid || undefined,
      name: state.context.name,
      form: state.context.form,
      disabled: isDisabled,
      autoFocus: state.context.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      spellCheck: "false",
      readOnly: isReadOnly,
      placeholder: state.context.placeholder,
      id: dom.getInputId(state.context),
      type: "text",
      role: "combobox",
      defaultValue: value,
      "data-value": value,
      "aria-autocomplete": state.context.autoComplete ? "both" : "list",
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      "aria-expanded": isOpen,
      "aria-activedescendant": state.context.activeId ?? undefined,
      onClick() {
        if (!isInteractive) return
        send("CLICK_INPUT")
      },
      onFocus() {
        if (isDisabled) return
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

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "listbox",
      type: "button",
      tabIndex: -1,
      "aria-label": translations.triggerLabel,
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": isReadOnly || undefined,
      "data-disabled": isDisabled || undefined,
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || evt.button !== 0 || evt.pointerType === "touch") return
        send("CLICK_BUTTON")
        event.preventDefault()
      },
      onPointerUp(event) {
        if (event.pointerType !== "touch") return
        send("CLICK_BUTTON")
      },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      role: "listbox",
      hidden: !isOpen,
      "aria-labelledby": dom.getLabelId(state.context),
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      hidden: !showClearButton,
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || evt.button !== 0) return
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
      const optionState = api.getOptionState(props)

      return normalize.element({
        ...parts.option.attrs,
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": optionState.focused || undefined,
        "data-disabled": optionState.disabled || undefined,
        "data-checked": optionState.checked || undefined,
        "aria-selected": optionState.focused,
        "aria-disabled": optionState.disabled,
        "aria-posinset": count && index != null ? index + 1 : undefined,
        "aria-setsize": count,
        "data-value": value,
        "data-label": label,
        // Prefer `pointermove` to `pointerenter` to avoid interrupting the keyboard navigation
        // NOTE: for perf, we may want to move these handlers to the listbox
        onPointerMove() {
          if (optionState.disabled) return
          send({ type: "POINTEROVER_OPTION", id, value, label })
        },
        onPointerUp(event) {
          if (optionState.disabled) return
          event.currentTarget.click()
        },
        onClick() {
          if (optionState.disabled) return
          send({ type: "CLICK_OPTION", id, value, label })
        },
        onAuxClick(event) {
          if (optionState.disabled) return
          event.preventDefault()
          event.currentTarget.click()
        },
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { label } = props
      return normalize.element({
        ...parts.optionGroup.attrs,
        role: "group",
        "aria-label": label,
      })
    },
  }

  return api
}
