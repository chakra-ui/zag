import { getSelectAllCoverage, selectAllValues } from "@zag-js/collection"
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
import type { EventKeyMap, JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils/object"
import { ensure } from "@zag-js/utils/guard"
import { parts } from "./combobox.anatomy"
import * as dom from "./combobox.dom"
import type {
  ChipProps,
  ChipState,
  CollectionItem,
  ComboboxApi,
  ComboboxService,
  ContentState,
  CreateItemState,
  ItemProps,
  ItemState,
  RootState,
  SelectAllState,
  TriggerProps,
  TriggerState,
} from "./combobox.types"
import { defaultTranslations } from "./combobox.translations"
import { CREATE_VALUE } from "./utils/pinned"
import { SELECT_ALL_VALUE } from "./utils/select-all"

export function connect<T extends PropTypes, V extends CollectionItem>(
  service: ComboboxService<V>,
  normalize: NormalizeProps<T>,
): ComboboxApi<T, V> {
  const { context, prop, state, send, scope, computed } = service
  const rendered = context.get("rendered")
  const layer = context.get("layer")

  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  const collection = prop("collection")

  const disabled = !!prop("disabled")
  const interactive = computed("isInteractive")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const readOnly = !!prop("readOnly")

  const open = state.hasTag("open")
  const loading = !!prop("loading")
  const focused = state.hasTag("focused")
  const highlightedValue = context.get("highlightedValue")
  const popupType = prop("popupType")
  const isDialogPopup = popupType === "dialog"

  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getChipState(props: ChipProps): ChipState {
    return {
      value: collection.getItemValue(props.item) ?? "",
      disabled: !interactive,
    }
  }

  // Focus a chip by value, or the input when there's none
  function focusChip(value: string | null | undefined) {
    const el = value != null ? scope.getById(dom.getChipId(scope, value)) : dom.getInputEl(scope)
    el?.focus({ preventScroll: true })
  }

  function getChipValues() {
    return dom.getChipEls(scope).map((el) => el.dataset.value!)
  }

  function removeChip(value: string, focusValue: string | null) {
    send({ type: "CHIP.REMOVE", value, focusValue, src: "chip-remove" })
  }

  // Each part of an item asks for its state, so compute it once per item per render
  const itemStates = new Map<unknown, ItemState>()
  let selectedValues: Set<string> | undefined

  function getItemState(props: ItemProps): ItemState {
    const cached = itemStates.get(props.item)
    if (cached) return cached
    const itemDisabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    const state: ItemState = {
      value,
      disabled: Boolean(disabled || itemDisabled),
      highlighted: highlightedValue === value,
      selected: (selectedValues ??= new Set(context.get("value"))).has(value),
    }
    itemStates.set(props.item, state)
    return state
  }

  function getRootState(): RootState {
    return { open, disabled, invalid, readOnly, required, focused }
  }

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    return { ...getRootState(), focusable: props.focusable ?? isDialogPopup }
  }

  function getContentState(): ContentState {
    return {
      open,
      inline: !!prop("inline"),
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
      empty: collection.size === 0,
      loading,
    }
  }

  let selectAllState: SelectAllState | undefined
  function getSelectAllState(): SelectAllState {
    if (selectAllState) return selectAllState
    const { enabled, checked, indeterminate } = getSelectAllCoverage(collection, context.get("value"))
    selectAllState = {
      checked,
      indeterminate,
      highlighted: highlightedValue === SELECT_ALL_VALUE,
      disabled: disabled || enabled.length === 0,
    }
    return selectAllState
  }

  function getCreateItemState(): CreateItemState {
    return {
      visible: computed("createVisible"),
      highlighted: highlightedValue === CREATE_VALUE,
      inputValue: context.get("inputValue").trim(),
      pending: context.get("createPending"),
      error: context.get("createError"),
    }
  }

  // Pinned options take the pointer and clicks the way items do
  function getPinnedHandlers(value: string, optionDisabled: boolean, highlighted: boolean) {
    return {
      onPointerMove() {
        if (optionDisabled || highlighted) return
        if (getInteractionModality() !== "pointer") return
        send({ type: "ITEM.POINTER_MOVE", value })
      },
      onPointerLeave() {
        if (optionDisabled) return
        if (getInteractionModality() !== "pointer") return
        send({ type: "ITEM.POINTER_LEAVE", value })
      },
      onClick(event: JSX.MouseEvent<HTMLElement>) {
        if (isContextMenuEvent(event) || optionDisabled) return
        send({ type: "ITEM.CLICK", src: "item-select", value, modifiers: getModifierKeys(event) })
      },
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    focused,
    open,
    inline: !!prop("inline"),
    loading,
    inputValue: context.get("inputValue"),
    highlightedValue,
    highlightedItem: context.get("highlightedItem"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    hasSelectedItems: computed("hasSelectedItems"),
    selectedItems: computed("selectedItems"),
    collection: prop("collection"),
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    syncSelectedItems() {
      send({ type: "SELECTED_ITEMS.SYNC" })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    setHighlightedValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value, src: "script" })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value, src: "script" })
    },
    setInputValue(value, reason = "script") {
      send({ type: "INPUT_VALUE.SET", value, src: reason })
    },
    selectAll() {
      if (!prop("multiple")) return
      send({ type: "VALUE.SET", value: selectAllValues(collection, context.get("value")), src: "script" })
    },
    clearValue(value) {
      if (value != null) {
        send({ type: "ITEM.CLEAR", value, src: "script" })
      } else {
        send({ type: "VALUE.CLEAR", src: "script" })
      }
    },
    focus() {
      dom.getInputEl(scope)?.focus()
    },
    setOpen(nextOpen, reason = "script") {
      if (prop("inline")) return
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason, replaces: "open" })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-state": rootState.open ? "open" : "closed",
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
      })
    },

    getLabelProps() {
      const rootState = getRootState()
      return normalize.label({
        ...parts.label.attrs(scope.id),
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
        id: dom.getLabelId(scope),
        "data-readonly": dataAttr(rootState.readOnly),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-required": dataAttr(rootState.required),
        "data-focus": dataAttr(rootState.focused),
        onClick(event) {
          if (!isDialogPopup) return
          event.preventDefault()
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
        "data-state": rootState.open ? "open" : "closed",
        "data-focus": dataAttr(rootState.focused),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...(prop("inline") ? undefined : popperStyles.floating),
          ...getDismissableLayerStyle(layer),
        },
      })
    },

    getHiddenInputProps(props = {}) {
      const single = props.value === undefined
      return normalize.input({
        type: "hidden",
        name: prop("name"),
        form: prop("form"),
        disabled,
        id: single ? dom.getHiddenInputId(scope) : undefined,
        defaultValue: single ? computed("hiddenInputValue") : props.value,
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "data-autofocus": dataAttr(prop("autoFocus")),
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
        "aria-autocomplete": "list",
        "aria-controls": `${dom.getListId(scope)} ${dom.getContentId(scope)}`,
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
          if (event.defaultPrevented) return
          if (!interactive) return

          if (isComposingEvent(event)) return
          if ((event.ctrlKey || event.shiftKey) && event.key !== "Enter") return

          const openOnKeyPress = prop("openOnKeyPress")
          const isModifierKey = event.ctrlKey || event.metaKey || event.shiftKey
          const keypress = true

          const keymap: EventKeyMap = {
            // With the caret at the start, move into the chips
            ArrowLeft(event) {
              const inputEl = event.currentTarget as HTMLInputElement
              if (inputEl.selectionStart !== 0 || inputEl.selectionEnd !== 0) return
              const chipValues = getChipValues()
              if (!chipValues.length) return
              event.preventDefault()
              focusChip(chipValues[chipValues.length - 1])
            },
            // In an empty input, focus the last chip; Backspace again removes it
            Backspace(event) {
              const inputEl = event.currentTarget as HTMLInputElement
              if (inputEl.value) return
              const lastValue = getChipValues().at(-1)
              if (lastValue == null) return
              event.preventDefault()
              focusChip(lastValue)
            },
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
            PageDown(event) {
              if (isModifierKey || !open) return
              send({ type: "INPUT.PAGE_DOWN", keypress })
              event.preventDefault()
            },
            PageUp(event) {
              if (isModifierKey || !open) return
              send({ type: "INPUT.PAGE_UP", keypress })
              event.preventDefault()
            },
            Enter(event) {
              // read before sending: some adapters apply the revert synchronously
              const hasHighlight = highlightedValue != null
              const willBeRejected = computed("isCustomValue") && !prop("allowCustomValue")

              send({ type: "INPUT.ENTER", keypress, src: "item-select", modifiers: getModifierKeys(event) })

              if (open && (hasHighlight || willBeRejected)) {
                event.preventDefault()
              }

              if (highlightedValue == null) return

              const itemEl = dom.getItemEl(scope, highlightedValue)
              if (isAnchorElement(itemEl)) {
                prop("navigate")?.({
                  value: highlightedValue,
                  node: itemEl,
                  href: itemEl.href,
                  modifiers: getModifierKeys(event),
                })
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

    getTriggerState,
    getTriggerProps(props = {}) {
      const triggerState = getTriggerState(props)
      const { focusable } = triggerState
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        "aria-haspopup": popupType,
        type: "button",
        tabIndex: focusable ? undefined : -1,
        "aria-label": translations.triggerLabel,
        "aria-expanded": triggerState.open,
        "data-state": triggerState.open ? "open" : "closed",
        "aria-controls": triggerState.open ? `${dom.getListId(scope)} ${dom.getContentId(scope)}` : undefined,
        disabled: triggerState.disabled,
        "data-invalid": dataAttr(triggerState.invalid),
        "data-focusable": dataAttr(focusable),
        "data-readonly": dataAttr(triggerState.readOnly),
        "data-disabled": dataAttr(triggerState.disabled),
        onFocus() {
          if (!focusable) return
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
            dom.focusInputEl(scope)
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!focusable) return

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

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: isDialogPopup ? "dialog" : "presentation",
        hidden: !contentState.open,
        "data-state": contentState.open ? "open" : "closed",
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "aria-labelledby": isDialogPopup && rendered.label ? dom.getLabelId(scope) : undefined,
        "data-empty": dataAttr(contentState.empty),
        "data-inline": dataAttr(contentState.inline),
        "data-loading": dataAttr(contentState.loading),
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { pointerEvents: true }),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          // prevent options or elements within listbox from taking focus
          event.preventDefault()
        },
      })
    },

    getEmptyProps() {
      return normalize.element({
        ...parts.empty.attrs(scope.id),
        dir: prop("dir"),
        role: "status",
        "aria-live": "polite",
        "aria-atomic": true,
      })
    },

    getListProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.list.attrs(scope.id),
        id: dom.getListId(scope),
        role: "listbox",
        tabIndex: -1,
        "data-empty": dataAttr(contentState.empty),
        "aria-labelledby": rendered.label ? dom.getLabelId(scope) : undefined,
        "aria-multiselectable": prop("multiple") ? true : undefined,
        "aria-busy": ariaAttr(contentState.loading),
        "data-loading": dataAttr(contentState.loading),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs(scope.id),
        dir: prop("dir"),
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
        ...parts.item.attrs(scope.id),
        "data-type": "item",
        dir: prop("dir"),
        id: dom.getItemId(scope, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "aria-selected": itemState.selected,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.disabled) return
          // keyboard-driven scroll fires pointermove on the item that slid under the cursor
          if (getInteractionModality() !== "pointer") return
          if (itemState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value })
        },
        onPointerLeave() {
          if (props.persistFocus) return
          if (itemState.disabled) return
          // keyboard-driven scroll fires pointerleave without any pointer input
          if (getInteractionModality() !== "pointer") return
          send({ type: "ITEM.POINTER_LEAVE", value })
        },
        onClick(event) {
          if (isContextMenuEvent(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "item-select", value, modifiers: getModifierKeys(event) })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs(scope.id),
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
        ...parts.itemIndicator.attrs(scope.id),
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs(scope.id),
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
        ...parts.itemGroupLabel.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getItemGroupLabelId(scope, htmlFor),
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

    getSelectAllState,
    getSelectAllProps() {
      const selectAllState = getSelectAllState()
      const checkedState = selectAllState.checked
        ? "checked"
        : selectAllState.indeterminate
          ? "indeterminate"
          : "unchecked"
      return normalize.element({
        ...parts.item.attrs(scope.id),
        "data-type": "select-all",
        dir: prop("dir"),
        id: dom.getItemId(scope, SELECT_ALL_VALUE),
        role: "option",
        tabIndex: -1,
        hidden: !prop("multiple"),
        "aria-selected": selectAllState.checked,
        "aria-checked": selectAllState.indeterminate ? "mixed" : selectAllState.checked,
        "aria-disabled": ariaAttr(selectAllState.disabled),
        "data-disabled": dataAttr(selectAllState.disabled),
        "data-highlighted": dataAttr(selectAllState.highlighted),
        "data-state": checkedState,
        "data-value": SELECT_ALL_VALUE,
        ...getPinnedHandlers(SELECT_ALL_VALUE, selectAllState.disabled, selectAllState.highlighted),
      })
    },

    getCreateItemState,
    getCreateItemProps() {
      const createState = getCreateItemState()
      return normalize.element({
        ...parts.item.attrs(scope.id),
        "data-type": "create",
        dir: prop("dir"),
        id: dom.getItemId(scope, CREATE_VALUE),
        role: "option",
        tabIndex: -1,
        hidden: !createState.visible,
        "aria-selected": false,
        "aria-busy": ariaAttr(createState.pending),
        "data-highlighted": dataAttr(createState.highlighted),
        "data-loading": dataAttr(createState.pending),
        "data-invalid": dataAttr(!!createState.error),
        "data-value": CREATE_VALUE,
        ...getPinnedHandlers(CREATE_VALUE, disabled, createState.highlighted),
      })
    },

    getChipGroupProps() {
      return normalize.element({
        ...parts.chipGroup.attrs(scope.id),
        dir: prop("dir"),
        // A toolbar keeps screen readers in focus mode while arrowing between chips
        role: context.get("value").length ? "toolbar" : undefined,
        "aria-labelledby": rendered.label ? dom.getLabelId(scope) : undefined,
        "data-disabled": dataAttr(disabled),
        onMouseDown(event) {
          // Pressing the space around the chips focuses the input
          if (disabled || event.target !== event.currentTarget || !isLeftClick(event)) return
          event.preventDefault()
          dom.getInputEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getChipState,
    getChipProps(props) {
      const chipState = getChipState(props)
      const { value } = chipState
      return normalize.element({
        ...parts.chip.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getChipId(scope, value),
        tabIndex: -1,
        "data-value": value,
        "aria-disabled": ariaAttr(chipState.disabled),
        "data-disabled": dataAttr(chipState.disabled),
        onKeyDown(event) {
          if (event.defaultPrevented || event.currentTarget !== event.target) return
          const chipValues = getChipValues()
          const index = chipValues.indexOf(value)
          const prev = chipValues[index - 1] ?? null
          const next = chipValues[index + 1] ?? null

          const keymap: EventKeyMap = {
            ArrowLeft() {
              if (prev != null) focusChip(prev)
            },
            ArrowRight() {
              focusChip(next)
            },
            Home() {
              focusChip(chipValues[0])
            },
            End() {
              focusChip(chipValues[chipValues.length - 1])
            },
            Backspace() {
              if (!chipState.disabled) removeChip(value, prev ?? next)
            },
            Delete() {
              if (!chipState.disabled) removeChip(value, next ?? prev)
            },
            Enter() {
              focusChip(null)
            },
            Escape() {
              focusChip(null)
            },
            Space() {
              focusChip(null)
            },
            ArrowDown() {
              focusChip(null)
              send({ type: "INPUT.ARROW_DOWN", keypress: true, src: "arrow-key" })
            },
            ArrowUp() {
              focusChip(null)
              send({ type: "INPUT.ARROW_UP", keypress: true, src: "arrow-key" })
            },
          }

          const exec = keymap[getEventKey(event, { dir: prop("dir") })]
          if (exec) {
            exec(event)
            event.preventDefault()
            return
          }

          // Typing goes to the input
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            focusChip(null)
          }
        },
      })
    },

    getChipRemoveTriggerProps(props) {
      const chipState = getChipState(props)
      const { value } = chipState
      const label = collection.stringifyItem(props.item) ?? value
      return normalize.button({
        ...parts.chipRemoveTrigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        tabIndex: -1,
        disabled: chipState.disabled,
        "aria-label": translations.removeChipTriggerLabel(label),
        "data-value": value,
        "data-disabled": dataAttr(chipState.disabled),
        onPointerDown(event) {
          // Keep focus where it is
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented || chipState.disabled) return
          removeChip(value, null)
        },
      })
    },
  }
}
