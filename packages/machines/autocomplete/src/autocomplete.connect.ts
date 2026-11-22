import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import {
  ariaAttr,
  dataAttr,
  getEventKey,
  getModifierKeys,
  isAnchorElement,
  isAndroid,
  isComposingEvent,
  isContextMenuEvent,
  isLeftClick,
  recordCursor,
} from "@zag-js/dom-query"
import { getInteractionModality } from "@zag-js/focus-visible"
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure, mergeWithDefault } from "@zag-js/utils"
import { parts } from "./autocomplete.anatomy"
import * as dom from "./autocomplete.dom"
import { defaultTranslations } from "./autocomplete.translations"
import type {
  AutocompleteApi,
  AutocompleteService,
  CollectionItem,
  ContentState,
  ItemProps,
  ItemState,
  RootState,
} from "./autocomplete.types"

export function connect<T extends PropTypes, V extends CollectionItem>(
  service: AutocompleteService<V>,
  normalize: NormalizeProps<T>,
): AutocompleteApi<T, V> {
  const { context, prop, state, send, scope, computed } = service

  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  const collection = prop("collection")
  const layer = context.get("layer")

  const disabled = !!prop("disabled")
  const readOnly = !!prop("readOnly")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const interactive = computed("isInteractive")
  const loading = !!prop("loading")

  const open = state.hasTag("open")
  const focused = state.hasTag("focused")
  const value = context.get("value")
  const highlightedValue = context.get("highlightedValue")

  const currentPlacement = context.get("currentPlacement")
  const popperStyles = getPlacementStyles({ ...prop("positioning"), placement: currentPlacement })

  function getRootState(): RootState {
    return { open, focused, disabled, invalid, readOnly, required }
  }

  function getContentState(): ContentState {
    return {
      open,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacement ? getPlacementSide(currentPlacement) : undefined,
      empty: collection.size === 0,
      loading,
    }
  }

  function getItemState(props: ItemProps): ItemState {
    const itemValue = collection.getItemValue(props.item)
    ensure(itemValue, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    return {
      value: itemValue,
      disabled: disabled || collection.getItemDisabled(props.item),
      highlighted: highlightedValue === itemValue,
    }
  }

  const rootAttrs = () => {
    const rootState = getRootState()
    return {
      dir: prop("dir"),
      "data-state": rootState.open ? "open" : "closed",
      "data-focus": dataAttr(rootState.focused),
      "data-disabled": dataAttr(rootState.disabled),
      "data-invalid": dataAttr(rootState.invalid),
      "data-readonly": dataAttr(rootState.readOnly),
    }
  }

  return {
    focused,
    open,
    loading,
    value,
    highlightedValue,
    highlightedItem: context.get("highlightedItem"),
    collection,
    setValue(value) {
      send({ type: "VALUE.SET", value, src: "script" })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR", src: "script" })
    },
    setHighlightedValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value, src: "script" })
    },
    setOpen(nextOpen, reason = "script") {
      if (nextOpen === open) return
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason })
    },
    focus() {
      dom.focusInputEl(scope)
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getRootState,
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        ...rootAttrs(),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs(scope.id),
        id: dom.getLabelId(scope),
        htmlFor: dom.getInputId(scope),
        ...rootAttrs(),
        "data-required": dataAttr(required),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        id: dom.getControlId(scope),
        ...rootAttrs(),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getInputId(scope),
        type: "text",
        role: "combobox",
        name: prop("name"),
        form: prop("form"),
        defaultValue: context.get("preview") ?? value,
        placeholder: prop("placeholder"),
        disabled,
        readOnly,
        required,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: "false",
        "aria-autocomplete": readOnly ? "none" : prop("mode"),
        "aria-expanded": open,
        "aria-controls": dom.getListId(scope),
        "aria-activedescendant": highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined,
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "data-state": open ? "open" : "closed",
        "data-autofocus": dataAttr(prop("autoFocus")),
        onFocus() {
          if (disabled) return
          send({ type: "INPUT.FOCUS" })
        },
        onBlur() {
          if (disabled) return
          send({ type: "INPUT.BLUR" })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive || !prop("openOnClick")) return
          send({ type: "INPUT.CLICK", src: "input-click" })
        },
        onChange(event) {
          send({
            type: "INPUT.CHANGE",
            value: event.currentTarget.value,
            src: "input-change",
            selection: recordCursor(event.currentTarget),
            // Some Android keyboards report every edit as composing
            composing: isComposingEvent(event) && !isAndroid(),
          })
        },
        onCompositionEnd(event) {
          if (isAndroid()) return
          send({
            type: "INPUT.CHANGE",
            value: event.currentTarget.value,
            src: "input-change",
            selection: recordCursor(event.currentTarget),
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented || !interactive) return
          if (isComposingEvent(event)) return
          if (event.ctrlKey || event.metaKey || event.shiftKey) return

          const keypress = true
          const canOpen = open || prop("openOnKeyPress")

          // Home/End move the caret: the text is the value
          const keymap: EventKeyMap = {
            End() {
              if (open) send({ type: "PREVIEW.COMMIT", src: "input-change" })
            },
            ArrowRight() {
              if (open) send({ type: "PREVIEW.COMMIT", src: "input-change" })
            },
            ArrowDown(event) {
              if (!canOpen) return
              send({ type: event.altKey ? "OPEN" : "INPUT.ARROW_DOWN", keypress, src: "arrow-key" })
              event.preventDefault()
            },
            ArrowUp(event) {
              if (!canOpen) return
              send({ type: event.altKey ? "CLOSE" : "INPUT.ARROW_UP", keypress, src: "arrow-key" })
              event.preventDefault()
            },
            PageDown(event) {
              if (!open) return
              send({ type: "INPUT.PAGE_DOWN", keypress })
              event.preventDefault()
            },
            PageUp(event) {
              if (!open) return
              send({ type: "INPUT.PAGE_UP", keypress })
              event.preventDefault()
            },
            Enter(event) {
              if (!open) return
              const itemEl = dom.getItemEl(scope, highlightedValue)
              send({ type: "INPUT.ENTER", keypress, src: "item-select", modifiers: getModifierKeys(event) })
              if (highlightedValue == null) return
              // choosing a suggestion must not also submit the form
              event.preventDefault()
              if (isAnchorElement(itemEl)) {
                prop("navigate")?.({
                  value: highlightedValue,
                  node: itemEl,
                  href: itemEl.href,
                  modifiers: getModifierKeys(event),
                })
              }
            },
          }

          const exec = keymap[getEventKey(event, { dir: prop("dir") })]
          exec?.(event)
        },
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: dom.getTriggerId(scope),
        type: "button",
        tabIndex: -1,
        disabled,
        "aria-label": translations.triggerLabel,
        "aria-expanded": open,
        "aria-controls": open ? dom.getListId(scope) : undefined,
        ...rootAttrs(),
        onPointerDown(event) {
          if (!interactive || !isLeftClick(event)) return
          if (event.pointerType === "touch") return
          // keep focus in the input
          event.preventDefault()
          queueMicrotask(() => dom.focusInputEl(scope))
        },
        onClick(event) {
          if (event.defaultPrevented || !interactive) return
          if (!isLeftClick(event)) return
          send({ type: "TRIGGER.CLICK", src: "trigger-click" })
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs(scope.id),
        id: dom.getClearTriggerId(scope),
        type: "button",
        tabIndex: -1,
        disabled,
        hidden: !value,
        "aria-label": translations.clearTriggerLabel,
        "aria-controls": dom.getInputId(scope),
        ...rootAttrs(),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented || !interactive) return
          send({ type: "VALUE.CLEAR", src: "clear-trigger" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        id: dom.getPositionerId(scope),
        dir: prop("dir"),
        ...getDismissableLayerAttrs(layer),
        style: { ...popperStyles.floating, ...getDismissableLayerStyle(layer) },
      })
    },

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        dir: prop("dir"),
        role: "presentation",
        hidden: !contentState.open,
        "data-state": contentState.open ? "open" : "closed",
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "data-empty": dataAttr(contentState.empty),
        "data-loading": dataAttr(contentState.loading),
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { pointerEvents: true }),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          // keep focus in the input
          event.preventDefault()
        },
      })
    },

    getListProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.list.attrs(scope.id),
        id: dom.getListId(scope),
        dir: prop("dir"),
        role: "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-busy": ariaAttr(contentState.loading),
        "data-empty": dataAttr(contentState.empty),
        "data-loading": dataAttr(contentState.loading),
      })
    },

    getEmptyProps() {
      return normalize.element({
        ...parts.empty.attrs(scope.id),
        dir: prop("dir"),
        role: "status",
        "aria-live": "polite",
        "aria-atomic": true,
        hidden: collection.size > 0 || loading,
      })
    },

    getItemState,
    getItemProps(props) {
      const itemState = getItemState(props)
      const itemValue = itemState.value
      return normalize.element({
        ...parts.item.attrs(scope.id),
        id: dom.getItemId(scope, itemValue),
        dir: prop("dir"),
        role: "option",
        tabIndex: -1,
        // there is no selection to keep: the highlighted suggestion is the one Enter picks
        "aria-selected": itemState.highlighted,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "data-value": itemValue,
        onPointerMove() {
          if (itemState.disabled || itemState.highlighted) return
          // keyboard-driven scroll fires pointermove on the item that slid under the cursor
          if (getInteractionModality() !== "pointer") return
          send({ type: "ITEM.POINTER_MOVE", value: itemValue })
        },
        onPointerLeave() {
          if (props.persistFocus || itemState.disabled) return
          if (getInteractionModality() !== "pointer") return
          send({ type: "ITEM.POINTER_LEAVE", value: itemValue })
        },
        onClick(event) {
          if (isContextMenuEvent(event) || itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "item-select", value: itemValue, modifiers: getModifierKeys(event) })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs(scope.id),
        dir: prop("dir"),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
      })
    },

    getItemGroupProps({ id }) {
      return normalize.element({
        ...parts.itemGroup.attrs(scope.id),
        id: dom.getItemGroupId(scope, id),
        dir: prop("dir"),
        role: "group",
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
      })
    },

    getItemGroupLabelProps({ htmlFor }) {
      return normalize.element({
        ...parts.itemGroupLabel.attrs(scope.id),
        id: dom.getItemGroupLabelId(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation",
      })
    },

    getSeparatorProps() {
      return normalize.element({
        ...parts.separator.attrs(scope.id),
        dir: prop("dir"),
        role: "separator",
        "aria-orientation": "horizontal",
      })
    },
  }
}
