import {
  ariaAttr,
  dataAttr,
  getEventKey,
  isAnchorElement,
  isComposingEvent,
  isContextMenuEvent,
  isDownloadingEvent,
  isLeftClick,
  isOpeningInNewTab,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./combobox.anatomy"
import * as dom from "./combobox.dom"
import type { CollectionItem, ComboboxApi, ComboboxService, ItemProps, ItemState } from "./combobox.types"

export function connect<T extends PropTypes, V extends CollectionItem>(
  service: ComboboxService<V>,
  normalize: NormalizeProps<T>,
): ComboboxApi<T, V> {
  const { context, prop, state, send, scope, computed, event } = service

  const translations = prop("translations")
  const collection = prop("collection")

  const disabled = prop("disabled")
  const interactive = computed("isInteractive")
  const invalid = prop("invalid")
  const readOnly = prop("readOnly")

  const open = state.hasTag("open")
  const focused = state.hasTag("focused")
  const composite = prop("composite")
  const highlightedValue = context.get("highlightedValue")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: context.get("currentPlacement"),
  })

  function getItemState(props: ItemProps): ItemState {
    const disabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    return {
      value,
      disabled: Boolean(disabled || disabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value),
    }
  }

  return {
    focused,
    open,
    inputValue: context.get("inputValue"),
    highlightedValue,
    highlightedItem: context.get("highlightedItem"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    hasSelectedItems: computed("hasSelectedItems"),
    selectedItems: context.get("selectedItems"),
    collection: prop("collection"),
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    syncSelectedItems() {
      send({ type: "SELECTED_ITEMS.SYNC" })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    setHighlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    clearHighlightValue() {
      send({ type: "HIGHLIGHTED_VALUE.CLEAR" })
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    setInputValue(value, reason = "script") {
      send({ type: "INPUT_VALUE.SET", value, src: reason })
    },
    clearValue(value) {
      if (value != null) {
        send({ type: "ITEM.CLEAR", value })
      } else {
        send({ type: "VALUE.CLEAR" })
      }
    },
    focus() {
      dom.getInputEl(scope)?.focus()
    },
    setOpen(nextOpen, reason = "script") {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
        id: dom.getLabelId(scope),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        onClick(event) {
          if (composite) return
          event.preventDefault()
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
        style: popperStyles.floating,
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "data-autofocus": dataAttr(prop("autoFocus")),
        name: prop("name"),
        form: prop("form"),
        disabled: disabled,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: "false",
        readOnly: readOnly,
        placeholder: prop("placeholder"),
        id: dom.getInputId(scope),
        type: "text",
        role: "combobox",
        defaultValue: context.get("inputValue"),
        "aria-autocomplete": computed("autoComplete") ? "both" : "list",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-activedescendant": highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!prop("openOnClick")) return
          if (!interactive) return
          send({ type: "INPUT.CLICK", src: "input-click" })
        },
        onFocus() {
          if (disabled) return
          send({ type: "INPUT.FOCUS" })
        },
        onBlur() {
          if (disabled) return
          send({ type: "INPUT.BLUR" })
        },
        onChange(event) {
          send({ type: "INPUT.CHANGE", value: event.currentTarget.value, src: "input-change" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          if (event.ctrlKey || event.shiftKey || isComposingEvent(event)) return

          const openOnKeyPress = prop("openOnKeyPress")
          const isModifierKey = event.ctrlKey || event.metaKey || event.shiftKey
          const keypress = true

          const keymap: EventKeyMap = {
            ArrowDown(event) {
              if (!openOnKeyPress && !open) return
              send({ type: event.altKey ? "OPEN" : "INPUT.ARROW_DOWN", keypress, src: "arrow-key" })
              event.preventDefault()
            },
            ArrowUp() {
              if (!openOnKeyPress && !open) return
              send({ type: event.altKey ? "CLOSE" : "INPUT.ARROW_UP", keypress, src: "arrow-key" })
              event.preventDefault()
            },
            Home(event) {
              if (isModifierKey) return
              send({ type: "INPUT.HOME", keypress })
              if (open) {
                event.preventDefault()
              }
            },
            End(event) {
              if (isModifierKey) return
              send({ type: "INPUT.END", keypress })
              if (open) {
                event.preventDefault()
              }
            },
            Enter(event) {
              send({ type: "INPUT.ENTER", keypress, src: "item-select" })

              // when there's a form owner, allow submitting custom value if `allowCustomValue` is true
              const submittable = computed("isCustomValue") && prop("allowCustomValue")
              if (open && !submittable) {
                event.preventDefault()
              }

              if (highlightedValue == null) return

              const itemEl = dom.getItemEl(scope, highlightedValue)
              if (isAnchorElement(itemEl)) {
                prop("navigate")?.({ value: highlightedValue, node: itemEl, href: itemEl.href })
              }
            },
            Escape() {
              send({ type: "INPUT.ESCAPE", keypress, src: "escape-key" })
              event.preventDefault()
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keymap[key]
          exec?.(event)
        },
      })
    },

    getTriggerProps(props = {}) {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        "aria-haspopup": composite ? "listbox" : "dialog",
        type: "button",
        tabIndex: props.focusable ? undefined : -1,
        "aria-label": translations.triggerLabel,
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": open ? dom.getContentId(scope) : undefined,
        disabled,
        "data-invalid": dataAttr(invalid),
        "data-focusable": dataAttr(props.focusable),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        onFocus() {
          if (!props.focusable) return
          send({ type: "INPUT.FOCUS", src: "trigger" })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (!isLeftClick(event)) return
          send({ type: "TRIGGER.CLICK", src: "trigger-click" })
        },
        onPointerDown(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          if (!isLeftClick(event)) return
          event.preventDefault()
          queueMicrotask(() => {
            dom.getInputEl(scope)?.focus({ preventScroll: true })
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (composite) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", src: "arrow-key" })
            },
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", src: "arrow-key" })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        role: !composite ? "dialog" : "listbox",
        tabIndex: -1,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-placement": context.get("currentPlacement"),
        "aria-labelledby": dom.getLabelId(scope),
        "aria-multiselectable": prop("multiple") && composite ? true : undefined,
        "data-empty": dataAttr(collection.size === 0),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          // prevent options or elements within listbox from taking focus
          event.preventDefault()
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        role: !composite ? "listbox" : undefined,
        "data-empty": dataAttr(collection.size === 0),
        "aria-labelledby": dom.getLabelId(scope),
        "aria-multiselectable": prop("multiple") && !composite ? true : undefined,
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        id: dom.getClearTriggerId(scope),
        type: "button",
        tabIndex: -1,
        disabled: disabled,
        "data-invalid": dataAttr(invalid),
        "aria-label": translations.clearTriggerLabel,
        "aria-controls": dom.getInputId(scope),
        hidden: !context.get("value").length,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "VALUE.CLEAR", src: "clear-trigger" })
        },
      })
    },

    getItemState,

    getItemProps(props) {
      const itemState = getItemState(props)
      const value = itemState.value

      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "aria-selected": ariaAttr(itemState.highlighted),
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.disabled) return
          if (itemState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value })
        },
        onPointerLeave() {
          if (props.persistFocus) return
          if (itemState.disabled) return
          const prev = event.previous()
          const mouseMoved = prev?.type.includes("POINTER")
          if (!mouseMoved) return
          send({ type: "ITEM.POINTER_LEAVE", value })
        },
        onClick(event) {
          if (isDownloadingEvent(event)) return
          if (isOpeningInNewTab(event)) return
          if (isContextMenuEvent(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "item-select", value })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },
    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        "data-empty": dataAttr(collection.size === 0),
        role: "group",
      })
    },

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        dir: prop("dir"),
        id: dom.getItemGroupLabelId(scope, htmlFor),
        role: "presentation",
      })
    },
  }
}
