import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./radio-group.anatomy"
import { dom } from "./radio-group.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./radio-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const groupDisabled = state.context.isDisabled
  const readOnly = state.context.readOnly

  function getItemState(props: ItemProps): ItemState {
    return {
      invalid: !!props.invalid,
      disabled: !!props.disabled || groupDisabled,
      checked: state.context.value === props.value,
      focused: state.context.focusedValue === props.value,
      hovered: state.context.hoveredValue === props.value,
      active: state.context.activeValue === props.value,
    }
  }

  function getItemDataAttrs<T extends ItemProps>(props: T) {
    const radioState = getItemState(props)
    return {
      "data-focus": dataAttr(radioState.focused),
      "data-disabled": dataAttr(radioState.disabled),
      "data-readonly": dataAttr(readOnly),
      "data-state": radioState.checked ? "checked" : "unchecked",
      "data-hover": dataAttr(radioState.hovered),
      "data-invalid": dataAttr(radioState.invalid),
      "data-orientation": state.context.orientation,
      "data-ssr": dataAttr(state.context.ssr),
    }
  }

  const focus = () => {
    const firstEnabledAndCheckedInput = dom.getFirstEnabledAndCheckedInputEl(state.context)

    if (firstEnabledAndCheckedInput) {
      firstEnabledAndCheckedInput.focus()
      return
    }

    const firstEnabledInput = dom.getFirstEnabledInputEl(state.context)
    firstEnabledInput?.focus()
  }

  return {
    focus,
    value: state.context.value,
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
        id: dom.getRootId(state.context),
        "aria-labelledby": dom.getLabelId(state.context),
        "data-orientation": state.context.orientation,
        "data-disabled": dataAttr(groupDisabled),
        "aria-orientation": state.context.orientation,
        dir: state.context.dir,
        style: {
          position: "relative",
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-disabled": dataAttr(groupDisabled),
        id: dom.getLabelId(state.context),
        onClick: focus,
      })
    },

    getItemState,

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.label({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, props.value),
        htmlFor: dom.getItemHiddenInputId(state.context, props.value),
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
      })
    },

    getItemTextProps(props) {
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        id: dom.getItemLabelId(state.context, props.value),
        ...getItemDataAttrs(props),
      })
    },

    getItemControlProps(props) {
      const controlState = getItemState(props)

      return normalize.element({
        ...parts.itemControl.attrs,
        dir: state.context.dir,
        id: dom.getItemControlId(state.context, props.value),
        "data-active": dataAttr(controlState.active),
        "aria-hidden": true,
        ...getItemDataAttrs(props),
      })
    },

    getItemHiddenInputProps(props) {
      const inputState = getItemState(props)

      return normalize.input({
        "data-ownedby": dom.getRootId(state.context),
        id: dom.getItemHiddenInputId(state.context, props.value),
        type: "radio",
        name: state.context.name || state.context.id,
        form: state.context.form,
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
          send({ type: "SET_FOCUSED", value: null })
        },
        onFocus() {
          send({ type: "SET_FOCUSED", value: props.value, focused: true })
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
        disabled: inputState.disabled,
        defaultChecked: inputState.checked,
        style: visuallyHiddenStyle,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        id: dom.getIndicatorId(state.context),
        ...parts.indicator.attrs,
        dir: state.context.dir,
        hidden: state.context.value == null,
        "data-disabled": dataAttr(groupDisabled),
        "data-orientation": state.context.orientation,
        style: {
          "--transition-property": "left, top, width, height",
          "--left": state.context.indicatorRect?.left,
          "--top": state.context.indicatorRect?.top,
          "--width": state.context.indicatorRect?.width,
          "--height": state.context.indicatorRect?.height,
          position: "absolute",
          willChange: "var(--transition-property)",
          transitionProperty: "var(--transition-property)",
          transitionDuration: state.context.canIndicatorTransition ? "var(--transition-duration, 150ms)" : "0ms",
          transitionTimingFunction: "var(--transition-timing-function)",
          [state.context.orientation === "horizontal" ? "left" : "top"]:
            state.context.orientation === "horizontal" ? "var(--left)" : "var(--top)",
        },
      })
    },
  }
}
