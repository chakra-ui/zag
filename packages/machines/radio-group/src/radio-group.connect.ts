import { dataAttr, isSafari, visuallyHiddenStyle } from "@zag-js/dom-query"
import { isFocusVisible } from "@zag-js/focus-visible"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./radio-group.anatomy"
import * as dom from "./radio-group.dom"
import type { ItemProps, ItemState, RadioGroupApi, RadioGroupService } from "./radio-group.types"

export function connect<T extends PropTypes>(
  service: RadioGroupService,
  normalize: NormalizeProps<T>,
): RadioGroupApi<T> {
  const { context, send, computed, prop, scope } = service
  const groupDisabled = computed("isDisabled")
  const readOnly = prop("readOnly")

  function getItemState(props: ItemProps): ItemState {
    return {
      value: props.value,
      invalid: !!props.invalid,
      disabled: !!props.disabled || groupDisabled,
      checked: context.get("value") === props.value,
      focused: context.get("focusedValue") === props.value,
      hovered: context.get("hoveredValue") === props.value,
      active: context.get("activeValue") === props.value,
    }
  }

  function getItemDataAttrs<T extends ItemProps>(props: T) {
    const itemState = getItemState(props)
    return {
      "data-focus": dataAttr(itemState.focused),
      "data-focus-visible": dataAttr(itemState.focused && context.get("focusVisible")),
      "data-disabled": dataAttr(itemState.disabled),
      "data-readonly": dataAttr(readOnly),
      "data-state": itemState.checked ? "checked" : "unchecked",
      "data-hover": dataAttr(itemState.hovered),
      "data-invalid": dataAttr(itemState.invalid),
      "data-orientation": prop("orientation"),
      "data-ssr": dataAttr(context.get("ssr")),
    }
  }

  const focus = () => {
    const nodeToFocus = dom.getFirstEnabledAndCheckedInputEl(scope) ?? dom.getFirstEnabledInputEl(scope)
    nodeToFocus?.focus()
  }

  return {
    focus,
    value: context.get("value"),
    setValue(value) {
      send({ type: "SET_VALUE", value, isTrusted: false })
    },
    clearValue() {
      send({ type: "SET_VALUE", value: null, isTrusted: false })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        role: "radiogroup",
        id: dom.getRootId(scope),
        "aria-labelledby": dom.getLabelId(scope),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(groupDisabled),
        "aria-orientation": prop("orientation"),
        dir: prop("dir"),
        style: {
          position: "relative",
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(groupDisabled),
        id: dom.getLabelId(scope),
        onClick: focus,
      })
    },

    getItemState,

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.label({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, props.value),
        htmlFor: dom.getItemHiddenInputId(scope, props.value),
        ...getItemDataAttrs(props),
        onPointerMove() {
          if (itemState.disabled) return
          if (itemState.hovered) return
          send({ type: "SET_HOVERED", value: props.value, hovered: true })
        },
        onPointerLeave() {
          if (itemState.disabled) return
          send({ type: "SET_HOVERED", value: null })
        },
        onPointerDown(event) {
          if (itemState.disabled) return
          // On pointerdown, the input blurs and returns focus to the `body`,
          // we need to prevent this.
          if (itemState.focused && event.pointerType === "mouse") {
            event.preventDefault()
          }
          send({ type: "SET_ACTIVE", value: props.value, active: true })
        },
        onPointerUp() {
          if (itemState.disabled) return
          send({ type: "SET_ACTIVE", value: null })
        },
        onClick() {
          if (!itemState.disabled && isSafari()) {
            dom.getItemHiddenInputEl(scope, props.value)?.focus()
          }
        },
      })
    },

    getItemTextProps(props) {
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        id: dom.getItemLabelId(scope, props.value),
        ...getItemDataAttrs(props),
      })
    },

    getItemControlProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.itemControl.attrs,
        dir: prop("dir"),
        id: dom.getItemControlId(scope, props.value),
        "data-active": dataAttr(itemState.active),
        "aria-hidden": true,
        ...getItemDataAttrs(props),
      })
    },

    getItemHiddenInputProps(props) {
      const itemState = getItemState(props)

      return normalize.input({
        "data-ownedby": dom.getRootId(scope),
        id: dom.getItemHiddenInputId(scope, props.value),
        type: "radio",
        name: prop("name") || prop("id"),
        form: prop("form"),
        value: props.value,
        onClick(event) {
          if (readOnly) {
            event.preventDefault()
            return
          }

          if (event.currentTarget.checked) {
            send({ type: "SET_VALUE", value: props.value, isTrusted: true })
          }
        },
        onBlur() {
          send({ type: "SET_FOCUSED", value: null, focused: false, focusVisible: false })
        },
        onFocus() {
          const focusVisible = isFocusVisible()
          send({ type: "SET_FOCUSED", value: props.value, focused: true, focusVisible })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: props.value, active: true })
          }
        },
        onKeyUp(event) {
          if (event.defaultPrevented) return
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: null })
          }
        },
        disabled: itemState.disabled,
        defaultChecked: itemState.checked,
        style: visuallyHiddenStyle,
      })
    },

    getIndicatorProps() {
      const rect = context.get("indicatorRect")
      return normalize.element({
        id: dom.getIndicatorId(scope),
        ...parts.indicator.attrs,
        dir: prop("dir"),
        hidden: context.get("value") == null,
        "data-disabled": dataAttr(groupDisabled),
        "data-orientation": prop("orientation"),
        style: {
          "--transition-property": "left, top, width, height",
          "--left": rect?.left,
          "--top": rect?.top,
          "--width": rect?.width,
          "--height": rect?.height,
          position: "absolute",
          willChange: "var(--transition-property)",
          transitionProperty: "var(--transition-property)",
          transitionDuration: context.get("canIndicatorTransition") ? "var(--transition-duration, 150ms)" : "0ms",
          transitionTimingFunction: "var(--transition-timing-function)",
          [prop("orientation") === "horizontal" ? "left" : "top"]:
            prop("orientation") === "horizontal" ? "var(--left)" : "var(--top)",
        },
      })
    },
  }
}
