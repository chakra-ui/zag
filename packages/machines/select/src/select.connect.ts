import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  contains,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  getNativeEvent,
  isEditableElement,
  isInternalChangeEvent,
  isValidTabEvent,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./select.anatomy"
import * as dom from "./select.dom"
import type { CollectionItem, ItemProps, ItemState, ScrollArrowProps, SelectApi, SelectSchema } from "./select.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  service: Service<SelectSchema<V>>,
  normalize: NormalizeProps<T>,
): SelectApi<T, V> {
  const { context, prop, scope, state, computed, send, refs } = service
  const translations = prop("translations")

  const disabled = prop("disabled") || context.get("fieldsetDisabled")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const readOnly = !!prop("readOnly")
  const collection = prop("collection")
  const popupType = prop("popupType")
  const isDialogPopup = popupType === "dialog"

  const open = state.hasTag("open")
  const focused = state.matches("focused")

  const scrollArrowVisibility = context.get("scrollArrowVisibility")
  const scrollTopArrowVisible = scrollArrowVisibility === "top" || scrollArrowVisibility === "both"
  const scrollBottomArrowVisible = scrollArrowVisibility === "bottom" || scrollArrowVisibility === "both"
  const openMethod = refs.get("openMethod")
  const scrollArrowsEnabled = openMethod !== "touch"

  const highlightedValue = context.get("highlightedValue")
  const highlightedItem = context.get("highlightedItem")
  const selectedItems = computed("selectedItems")
  const currentPlacement = context.get("currentPlacement")
  const aligned = context.get("aligned")

  const isTypingAhead = computed("isTypingAhead")
  const interactive = computed("isInteractive")

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

  function getItemState(props: ItemProps): ItemState {
    const _disabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    return {
      value,
      disabled: Boolean(disabled || _disabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value),
    }
  }

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
    positioned: context.get("positioned"),
  })

  return {
    open: open,
    focused: focused,
    scrollArrowVisibility: scrollArrowsEnabled ? scrollArrowVisibility : "none",
    empty: context.get("value").length === 0,
    highlightedItem,
    highlightedValue,
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    collection,
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    focus() {
      dom.getTriggerEl(scope)?.focus({ preventScroll: true })
    },
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    selectAll() {
      send({ type: "VALUE.SET", value: collection.getValues() })
    },
    setHighlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    clearHighlightValue() {
      send({ type: "HIGHLIGHTED_VALUE.CLEAR" })
    },
    clearValue(value) {
      if (value) {
        send({ type: "ITEM.CLEAR", value })
      } else {
        send({ type: "VALUE.CLEAR" })
      }
    },

    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        ...parts.label.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required),
        htmlFor: dom.getHiddenSelectId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getTriggerProps() {
      return normalize.button({
        id: dom.getTriggerId(scope),
        disabled: disabled,
        dir: prop("dir"),
        type: "button",
        role: "combobox",
        "aria-controls": `${dom.getListId(scope)} ${dom.getContentId(scope)}`,
        "aria-expanded": open,
        "aria-haspopup": popupType,
        "data-state": open ? "open" : "closed",
        "aria-invalid": invalid,
        "aria-required": required,
        "aria-labelledby": dom.getLabelId(scope),
        ...parts.trigger.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-placement": currentPlacement,
        "data-align-with-trigger": dataAttr(aligned),
        "data-placeholder-shown": dataAttr(!computed("hasSelectedItems")),
        onClick(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          const pointerType = (getNativeEvent(event) as PointerEvent)?.pointerType
          refs.set("openMethod", pointerType === "mouse" ? "mouse" : pointerType ? "touch" : "keyboard")
          send({ type: "TRIGGER.CLICK" })
        },
        onFocus() {
          send({ type: "TRIGGER.FOCUS" })
        },
        onBlur() {
          send({ type: "TRIGGER.BLUR" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          refs.set("openMethod", "keyboard")

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "TRIGGER.ARROW_UP" })
            },
            ArrowDown(event) {
              send({ type: event.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN" })
            },
            ArrowLeft() {
              send({ type: "TRIGGER.ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "TRIGGER.ARROW_RIGHT" })
            },
            Home() {
              send({ type: "TRIGGER.HOME" })
            },
            End() {
              send({ type: "TRIGGER.END" })
            },
            Enter() {
              send({ type: "TRIGGER.ENTER" })
            },
            Space(event) {
              if (isTypingAhead) {
                send({ type: "TRIGGER.TYPEAHEAD", key: event.key })
              } else {
                send({ type: "TRIGGER.ENTER" })
              }
            },
          }

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
                orientation: "vertical",
              })
            ]

          if (exec) {
            exec(event)
            event.preventDefault()
            return
          }

          if (getByTypeahead.isValidEvent(event)) {
            send({ type: "TRIGGER.TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        id: dom.getItemId(scope, itemState.value),
        role: "option",
        ...parts.item.attrs(scope.id),
        dir: prop("dir"),
        "data-value": itemState.value,
        "aria-selected": itemState.selected,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (itemState.value === highlightedValue) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", value: itemState.value })
        },
        onPointerLeave(event) {
          if (itemState.disabled) return
          if (props.persistFocus) return
          if (event.pointerType !== "mouse") return

          const pointerMoved = service.event.previous()?.type.includes("POINTER")
          if (!pointerMoved) return

          send({ type: "ITEM.POINTER_LEAVE" })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs(scope.id),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs(scope.id),
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs(scope.id),
        id: dom.getItemGroupLabelId(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation",
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        role: "group",
        dir: prop("dir"),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs(scope.id),
        type: "button",
        "aria-label": translations.clearTriggerLabel,
        "data-invalid": dataAttr(invalid),
        disabled: disabled,
        hidden: !computed("hasSelectedItems"),
        dir: prop("dir"),
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "CLEAR.CLICK" })
        },
      })
    },

    getScrollArrowProps(props: ScrollArrowProps) {
      const { placement } = props
      const isTop = placement === "top"
      const visible = isTop ? scrollTopArrowVisible : scrollBottomArrowVisible
      const enabled = visible && scrollArrowsEnabled

      return normalize.element({
        ...parts.scrollArrow.attrs(scope.id),
        dir: prop("dir"),
        "data-placement": placement,
        "data-state": enabled ? "visible" : "hidden",
        "aria-hidden": true,
        hidden: !enabled,
        onMouseMove(event) {
          if (!enabled) return
          if (event.movementX === 0 && event.movementY === 0) return
          send({ type: "SCROLL_ARROW.POINTER_MOVE", placement })
        },
        onMouseLeave() {
          send({ type: "SCROLL_ARROW.POINTER_LEAVE", placement })
        },
      })
    },

    getHiddenSelectProps() {
      const value = context.get("value")
      const defaultValue = prop("multiple") ? value : value?.[0]

      const handleChange = (e: { currentTarget: HTMLSelectElement; nativeEvent?: Event }) => {
        const evt = getNativeEvent(e)
        if (isInternalChangeEvent(evt)) return
        send({ type: "VALUE.SET", value: getSelectedValues(e.currentTarget) })
      }

      return normalize.select({
        name: prop("name"),
        form: prop("form"),
        disabled: disabled,
        multiple: prop("multiple"),
        required: prop("required"),
        "aria-hidden": true,
        id: dom.getHiddenSelectId(scope),
        defaultValue,
        style: visuallyHiddenStyle,
        tabIndex: -1,
        autoComplete: prop("autoComplete"),
        onChange: handleChange,
        onInput: handleChange,
        // Some browser extensions will focus the hidden select.
        // Let's forward the focus to the trigger.
        onFocus() {
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
        "aria-labelledby": dom.getLabelId(scope),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        hidden: !open,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        role: isDialogPopup ? "dialog" : "presentation",
        ...parts.content.attrs(scope.id),
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "data-align-with-trigger": dataAttr(aligned),
        "aria-labelledby": isDialogPopup ? dom.getLabelId(scope) : undefined,
        onKeyDown(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

          // select should not be navigated using tab key so we prevent it
          // but, we want to allow tabbing within the content when composing
          // with widgets like tabs or trees
          if (event.key === "Tab") {
            const valid = isValidTabEvent(event)
            if (!valid) {
              event.preventDefault()
              return
            }
          }

          const target = getEventTarget<Element>(event)

          const keyMap: EventKeyMap = {
            ArrowUp(event) {
              event.preventDefault()
              send({ type: "CONTENT.ARROW_UP" })
            },
            ArrowDown(event) {
              event.preventDefault()
              send({ type: "CONTENT.ARROW_DOWN" })
            },
            Home(event) {
              if (isEditableElement(target)) return
              event.preventDefault()
              send({ type: "CONTENT.HOME" })
            },
            End(event) {
              if (isEditableElement(target)) return
              event.preventDefault()
              send({ type: "CONTENT.END" })
            },
            Enter(event) {
              event.preventDefault()
              send({ type: "ITEM.CLICK", src: "keydown.enter" })
            },
            Space(event) {
              if (isEditableElement(target)) return
              event.preventDefault()
              if (isTypingAhead) {
                send({ type: "CONTENT.TYPEAHEAD", key: event.key })
              } else {
                send({ type: "ITEM.CLICK", src: "keydown.space" })
              }
            },
          }

          const exec = keyMap[getEventKey(event)]

          if (exec) {
            exec(event)
            return
          }

          if (isEditableElement(target)) return

          if (getByTypeahead.isValidEvent(event)) {
            send({ type: "CONTENT.TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs(scope.id),
        id: dom.getListId(scope),
        role: "listbox",
        tabIndex: 0,
        dir: prop("dir"),
        "aria-labelledby": dom.getLabelId(scope),
        "aria-activedescendant": ariaActiveDescendant,
        "aria-multiselectable": prop("multiple") ? true : undefined,
        "data-activedescendant": ariaActiveDescendant,
      })
    },
  }
}

const getSelectedValues = (el: HTMLSelectElement) => {
  return el.multiple ? Array.from(el.selectedOptions, (o) => o.value) : el.value ? [el.value] : []
}
