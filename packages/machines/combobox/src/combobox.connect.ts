import { getEventKey, getNativeEvent, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type {
  OptionData,
  OptionGroupLabelProps,
  OptionGroupProps,
  OptionProps,
  PublicApi,
  Send,
  State,
} from "./combobox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): PublicApi<T> {
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
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  const api = {
    isFocused,
    isOpen,
    isInputValueEmpty: state.context.isInputValueEmpty,
    inputValue: state.context.inputValue,
    focusedOption: state.context.focusedOptionData,
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
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-state": isOpen ? "open" : "closed",
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
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      hidden: !isOpen,
      style: popperStyles.floating,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
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
      "data-state": isOpen ? "open" : "closed",
      "aria-activedescendant": state.context.focusedId ?? undefined,
      onClick() {
        if (!isInteractive) return
        send("CLICK_INPUT")
      },
      onFocus() {
        if (isDisabled) return
        send("FOCUS")
      },
      onChange(event) {
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
      "data-state": isOpen ? "open" : "closed",
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt) || evt.pointerType === "touch") return
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
      "data-state": isOpen ? "open" : "closed",
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
        if (!isInteractive || !isLeftClick(evt)) return
        send("CLEAR_VALUE")
        event.preventDefault()
      },
    }),

    getOptionState(props: OptionProps) {
      const id = dom.getOptionId(state.context, props.value, props.index)
      return {
        isDisabled: !!props.disabled,
        isHighlighted: state.context.focusedId === id,
        isChecked: state.context.selectionData?.value === props.value,
      }
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
        "data-highlighted": dataAttr(optionState.isHighlighted),
        "data-state": optionState.isChecked ? "checked" : "unchecked",
        "aria-selected": optionState.isHighlighted,
        "aria-disabled": optionState.isDisabled,
        "data-disabled": dataAttr(optionState.isDisabled),
        "aria-posinset": count && index != null ? index + 1 : undefined,
        "aria-setsize": count,
        "data-value": value,
        "data-label": label,
        // Prefer `pointermove` to `pointerenter` to avoid interrupting the keyboard navigation
        // NOTE: for perf, we may want to move these handlers to the listbox
        onPointerMove() {
          if (optionState.isDisabled) return
          send({ type: "POINTEROVER_OPTION", id, value, label })
        },
        onPointerUp() {
          if (optionState.isDisabled) return
          send({ type: "CLICK_OPTION", src: "pointerup", id, value, label })
        },
        onClick() {
          if (optionState.isDisabled) return
          send({ type: "CLICK_OPTION", src: "click", id, value, label })
        },
        onAuxClick(event) {
          if (optionState.isDisabled) return
          event.preventDefault()
          send({ type: "CLICK_OPTION", src: "auxclick", id, value, label })
        },
      })
    },

    getOptionGroupProps(props: OptionGroupProps) {
      const { id } = props
      return normalize.element({
        ...parts.optionGroup.attrs,
        id: dom.getOptionGroupId(state.context, id),
        "aria-labelledby": dom.getOptionGroupLabelId(state.context, id),
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
  }

  return api
}
