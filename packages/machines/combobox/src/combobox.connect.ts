import { getEventKey, getNativeEvent, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, raf } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, MachineApi, Send, State } from "./combobox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const translations = state.context.translations

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly

  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")
  const isIdle = state.hasTag("idle")

  const autofill = isOpen && state.context.highlightedValue && state.context.autoComplete
  const showClearButton = (!isIdle || state.context.isHovering) && !state.context.isInputValueEmpty

  const value = autofill ? state.context.highlightedItem?.label : state.context.inputValue

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  const api = {
    isFocused,
    isOpen,
    isInputValueEmpty: state.context.isInputValueEmpty,
    inputValue: state.context.inputValue,
    highlightedItem: state.context.highlightedItem,
    selectedItems: state.context.selectedItems,

    setValue(value: string[]) {
      send({ type: "SET_VALUE", value })
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
      "aria-activedescendant": state.context.highlightedValue
        ? dom.getItemId(state.context, state.context.highlightedValue)
        : undefined,
      onCompositionStart() {
        send("COMPOSITION_START")
      },
      onCompositionEnd() {
        raf(() => {
          send("COMPOSITION_END")
        })
      },
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
            send({ type: event.altKey ? "ALT_ARROW_DOWN" : "ARROW_DOWN" })
            prevent = true
          },
          ArrowUp() {
            send(event.altKey ? "ALT_ARROW_UP" : "ARROW_UP")
            prevent = true
          },
          Home(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            prevent = isOpen
            send("HOME")
          },
          End(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            prevent = isOpen
            send("END")
          },
          Enter() {
            if (state.context.composing) return
            send("ENTER")
            prevent = true
          },
          Escape() {
            send("ESCAPE")
            prevent = true
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keymap[key]
        exec?.(event)

        if (prevent) {
          event.preventDefault()
          event.stopPropagation()
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
      "aria-multiselectable": state.context.multiple ? true : undefined,
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

    getItemState(props: ItemProps) {
      const { item } = props
      const key = state.context.collection.getItemKey(item)
      return {
        key,
        isDisabled: state.context.collection.isItemDisabled(item),
        isHighlighted: state.context.highlightedValue === key,
        isSelected: state.context.collection.hasItemKey(state.context.selectedItems, key),
      }
    },

    getItemProps(props: ItemProps) {
      const optionState = api.getItemState(props)
      const value = optionState.key

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(optionState.isHighlighted),
        "data-state": optionState.isSelected ? "checked" : "unchecked",
        "aria-selected": optionState.isHighlighted,
        "aria-disabled": optionState.isDisabled,
        "data-disabled": dataAttr(optionState.isDisabled),
        // "aria-posinset": count && index != null ? index + 1 : undefined,
        // "aria-setsize": count,
        "data-value": optionState.key,
        // "data-label": label,
        onPointerMove() {
          if (optionState.isDisabled) return
          send({ type: "POINTEROVER_OPTION", value })
        },
        onPointerLeave() {
          if (optionState.isDisabled) return
          send({ type: "POINTERLEAVE_OPTION", value })
        },
        onPointerUp() {
          if (optionState.isDisabled) return
          send({ type: "CLICK_OPTION", src: "pointerup", value })
        },
        onAuxClick(event) {
          if (optionState.isDisabled) return
          event.preventDefault()
          send({ type: "CLICK_OPTION", src: "auxclick", value })
        },
      })
    },

    getItemGroupProps(props: ItemGroupProps) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(state.context, id),
        "aria-labelledby": dom.getItemGroupLabelId(state.context, id),
      })
    },

    getItemGroupLabelProps(props: ItemGroupLabelProps) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        id: dom.getItemGroupId(state.context, htmlFor),
        role: "group",
      })
    },
  }

  return api
}
