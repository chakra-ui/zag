import { getEventKey, getNativeEvent, isLeftClick, type EventKeyMap, isContextMenuEvent } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, raf } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type { ItemGroupLabelProps, ItemGroupProps, ItemProps, MachineApi, Send, State } from "./combobox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const translations = state.context.translations
  const collection = state.context.collection

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly

  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")

  const autofill = isOpen && state.context.highlightedValue && state.context.autoComplete

  const value = autofill ? collection.getItemLabel(state.context.highlightedItem) : state.context.inputValue

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
      send({ type: "VALUE.SET", value })
    },

    setInputValue(value: string) {
      send({ type: "INPUT_VALUE.SET", value })
    },

    clearValue() {
      send("VALUE.CLEAR")
    },

    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      dir: state.context.dir,
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      dir: state.context.dir,
      id: dom.getControlId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      hidden: !isOpen,
      style: popperStyles.floating,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
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
        send("INPUT.COMPOSITION_START")
      },
      onCompositionEnd() {
        raf(() => {
          send("INPUT.COMPOSITION_END")
        })
      },
      onClick() {
        if (!isInteractive) return
        send("INPUT.CLICK")
      },
      onFocus() {
        if (isDisabled) return
        send("INPUT.FOCUS")
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (evt.ctrlKey || evt.shiftKey || evt.isComposing) return

        let prevent = false

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            send({ type: event.altKey ? "INPUT.ARROW_DOWN+ALT" : "INPUT.ARROW_DOWN" })
            prevent = true
          },
          ArrowUp() {
            send(event.altKey ? "INPUT.ARROW_UP+ALT" : "INPUT.ARROW_UP")
            prevent = true
          },
          Home(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            prevent = isOpen
            send("INPUT.HOME")
          },
          End(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            prevent = isOpen
            send("INPUT.END")
          },
          Enter() {
            if (state.context.composing) return
            send("INPUT.ENTER")
            prevent = true
          },
          Escape() {
            send("INPUT.ESCAPE")
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
      dir: state.context.dir,
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
        send("TRIGGER.CLICK")
        event.preventDefault()
      },
      onPointerUp(event) {
        if (event.pointerType !== "touch") return
        send("TRIGGER.CLICK")
      },
      style: { outline: 0 },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      dir: state.context.dir,
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
      dir: state.context.dir,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      hidden: !state.context.isInputValueEmpty,
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt)) return
        send({ type: "VALUE.CLEAR", src: "clear-trigger" })
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
        dir: state.context.dir,
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
          send({ type: "OPTION.POINTER_OVER", value })
        },
        onPointerLeave() {
          if (optionState.isDisabled) return
          send({ type: "OPTION.POINTER_LEAVE", value })
        },
        onPointerUp(event) {
          if (optionState.isDisabled || isContextMenuEvent(event)) return
          send({ type: "OPTION.CLICK", src: "pointerup", value })
        },
        onAuxClick(event) {
          if (optionState.isDisabled || isContextMenuEvent(event)) return
          event.preventDefault()
          send({ type: "OPTION.CLICK", src: "auxclick", value })
        },
      })
    },

    getItemGroupProps(props: ItemGroupProps) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: state.context.dir,
        id: dom.getItemGroupId(state.context, id),
        "aria-labelledby": dom.getItemGroupLabelId(state.context, id),
      })
    },

    getItemGroupLabelProps(props: ItemGroupLabelProps) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        dir: state.context.dir,
        id: dom.getItemGroupId(state.context, htmlFor),
        role: "group",
      })
    },
  }

  return api
}
