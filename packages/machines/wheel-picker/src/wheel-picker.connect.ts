import type { CollectionItem } from "@zag-js/collection"
import {
  dataAttr,
  getEventKey,
  getEventPoint,
  getNativeEvent,
  isInternalChangeEvent,
  isLeftClick,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./wheel-picker.anatomy"
import * as dom from "./wheel-picker.dom"
import type { ItemProps, ItemState, WheelPickerApi, WheelPickerService } from "./wheel-picker.types"
import {
  getExpandedItems,
  getHighlightItems,
  getRenderItems,
  getWheelGeometry,
  normalizeScroll,
} from "./wheel-picker.utils"

export function connect<P extends PropTypes, T extends CollectionItem = CollectionItem>(
  service: WheelPickerService<T>,
  normalize: NormalizeProps<P>,
): WheelPickerApi<P, T> {
  const { context, prop, scope, send, state, computed } = service
  const itemCollection = prop("collection")
  const value = context.get("value")
  const selectedItem = itemCollection.find(value)
  const valueAsString = itemCollection.stringifyItem(selectedItem) ?? ""
  const geometry = getWheelGeometry(prop("visibleCount"), prop("optionItemHeight"))
  const expandedItems = getExpandedItems(itemCollection.items, prop("infinite"), prop("visibleCount"))
  const selectedIndex = context.get("index")
  const disabled = prop("disabled") || context.get("fieldsetDisabled")
  const readOnly = prop("readOnly")
  const invalid = prop("invalid")
  const interactive = computed("interactive")

  function getItemState(props: ItemProps<T>): ItemState {
    return {
      disabled: !!disabled || itemCollection.getItemDisabled(props.item),
      index: props.index,
      selected: props.index === selectedIndex,
      value: itemCollection.getItemValue(props.item),
    }
  }

  return {
    value,
    valueAsString,
    selectedItem,
    index: itemCollection.indexOf(value),
    focused: context.get("focused"),
    dragging: state.matches("dragging"),
    scrolling: state.matches("scrolling"),
    items: getRenderItems(itemCollection.items, prop("infinite"), prop("visibleCount")),
    highlightItems: getHighlightItems(itemCollection.items, prop("infinite"), prop("visibleCount")),

    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    scrollToIndex(index) {
      send({ type: "INDEX.SCROLL_TO", index })
    },
    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        style: {
          position: "relative",
          overflow: "hidden",
          perspective: "2000px",
          userSelect: "none",
          WebkitUserSelect: "none",
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenSelectId(scope),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          dom.getControlEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      const originalIndex = itemCollection.indexOf(value)

      return normalize.element({
        ...parts.control.attrs,
        id: dom.getControlId(scope),
        role: "spinbutton",
        tabIndex: disabled ? undefined : 0,
        dir: prop("dir"),
        "aria-label": prop("aria-label"),
        "aria-labelledby": prop("aria-labelledby") ?? dom.getLabelId(scope),
        "aria-valuemin": 0,
        "aria-valuemax": Math.max(0, itemCollection.size - 1),
        "aria-valuenow": Math.max(0, originalIndex),
        "aria-valuetext": valueAsString,
        "aria-disabled": disabled || undefined,
        "aria-readonly": readOnly || undefined,
        "aria-invalid": invalid || undefined,
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(state.matches("dragging")),
        "data-focus": dataAttr(context.get("focused")),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-scrolling": dataAttr(state.matches("scrolling")),
        style: {
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
        },
        onFocus() {
          send({ type: "CONTROL.FOCUS" })
        },
        onBlur() {
          send({ type: "CONTROL.BLUR" })
        },
        onPointerDown(event) {
          if (!interactive || !isLeftClick(event)) return
          const point = getEventPoint(event)
          send({ type: "CONTROL.POINTER_DOWN", point, timestamp: event.timeStamp })
          event.preventDefault()
        },
        onWheel(event) {
          if (!interactive || !event.deltaY) return
          send({ type: "CONTROL.WHEEL", deltaY: event.deltaY, timestamp: event.timeStamp })
          event.preventDefault()
        },
        onKeyDown(event) {
          if (!interactive) return

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "CONTROL.STEP", step: -1 })
            },
            ArrowDown() {
              send({ type: "CONTROL.STEP", step: 1 })
            },
            ArrowLeft() {
              dom.focusSiblingControl(scope, prop("dir") === "rtl" ? 1 : -1)
            },
            ArrowRight() {
              dom.focusSiblingControl(scope, prop("dir") === "rtl" ? -1 : 1)
            },
            Home() {
              if (!prop("infinite")) send({ type: "CONTROL.HOME" })
            },
            End() {
              if (!prop("infinite")) send({ type: "CONTROL.END" })
            },
          }

          const exec = keyMap[getEventKey(event)]
          if (exec) {
            exec(event)
            event.preventDefault()
            return
          }

          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            send({ type: "CONTROL.TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },

    getItemGroupProps() {
      const scroll =
        expandedItems.length > 0 && prop("infinite")
          ? normalizeScroll(selectedIndex, expandedItems.length)
          : selectedIndex

      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(scope),
        role: "presentation",
        "aria-hidden": true,
        style: {
          position: "absolute",
          top: "50%",
          left: 0,
          display: "block",
          width: "100%",
          height: 0,
          margin: "0 auto",
          padding: 0,
          listStyle: "none",
          WebkitFontSmoothing: "subpixel-antialiased",
          willChange: "transform",
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          transform: `translateZ(${-geometry.radius}px) rotateX(${geometry.itemAngle * scroll}deg)`,
        },
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      const distance = Math.abs(props.index - selectedIndex)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, props.index),
        role: "presentation",
        "aria-hidden": true,
        "data-disabled": dataAttr(itemState.disabled),
        "data-index": props.index,
        "data-selected": dataAttr(itemState.selected),
        "data-value": itemState.value ?? undefined,
        style: {
          position: "absolute",
          top: `${-geometry.halfItemHeight}px`,
          left: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: `${prop("optionItemHeight")}px`,
          margin: 0,
          padding: 0,
          lineHeight: `${prop("optionItemHeight")}px`,
          transform: `rotateX(${-geometry.itemAngle * props.index}deg) translateZ(${geometry.radius}px)`,
          visibility: distance > geometry.quarterCount ? "hidden" : "visible",
          WebkitFontSmoothing: "subpixel-antialiased",
          willChange: "visibility",
          pointerEvents: itemState.disabled ? "none" : undefined,
        },
      })
    },

    getHighlightProps() {
      return normalize.element({
        ...parts.highlight.attrs,
        id: dom.getHighlightId(scope),
        role: "presentation",
        "aria-hidden": true,
        "data-focus": dataAttr(context.get("focused")),
        style: {
          position: "absolute",
          overflow: "hidden",
          top: "50%",
          width: "100%",
          height: `${prop("optionItemHeight")}px`,
          lineHeight: `${prop("optionItemHeight")}px`,
          transform: "translateY(-50%)",
          pointerEvents: "none",
        },
      })
    },

    getHighlightItemGroupProps() {
      const scroll =
        expandedItems.length > 0 && prop("infinite")
          ? normalizeScroll(selectedIndex, expandedItems.length)
          : selectedIndex

      return normalize.element({
        ...parts.highlightItemGroup.attrs,
        id: dom.getHighlightItemGroupId(scope),
        role: "presentation",
        style: {
          position: "absolute",
          top: prop("infinite") ? `${-prop("optionItemHeight")}px` : undefined,
          width: "100%",
          margin: 0,
          padding: 0,
          listStyle: "none",
          transform: `translateY(${-scroll * prop("optionItemHeight")}px)`,
          willChange: "transform",
        },
      })
    },

    getHighlightItemProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.highlightItem.attrs,
        id: dom.getHighlightItemId(scope, props.index),
        role: "presentation",
        "data-disabled": dataAttr(itemState.disabled),
        "data-index": props.index,
        "data-selected": dataAttr(itemState.selected),
        "data-value": itemState.value ?? undefined,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: `${prop("optionItemHeight")}px`,
          margin: 0,
          padding: 0,
          pointerEvents: "none",
        },
      })
    },

    getHiddenSelectProps() {
      const handleChange = (event: { currentTarget: HTMLSelectElement; nativeEvent?: Event }) => {
        if (isInternalChangeEvent(getNativeEvent(event))) return
        send({ type: "VALUE.SET", value: event.currentTarget.value || null })
      }

      return normalize.select({
        id: dom.getHiddenSelectId(scope),
        name: prop("name"),
        form: prop("form"),
        disabled,
        required: prop("required"),
        "aria-hidden": true,
        "aria-labelledby": dom.getLabelId(scope),
        defaultValue: value ?? undefined,
        style: visuallyHiddenStyle,
        tabIndex: -1,
        onChange: handleChange,
        onInput: handleChange,
        onFocus() {
          dom.getControlEl(scope)?.focus({ preventScroll: true })
        },
      })
    },
  }
}
