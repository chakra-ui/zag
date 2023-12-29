import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./radio-group.anatomy"
import { dom } from "./radio-group.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./radio-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isGroupDisabled = state.context.isDisabled

  function getItemState(props: ItemProps): ItemState {
    return {
      isInvalid: !!props.invalid,
      isDisabled: !!props.disabled || isGroupDisabled,
      isChecked: state.context.value === props.value,
      isFocused: state.context.focusedId === props.value,
      isHovered: state.context.hoveredId === props.value,
      isActive: state.context.activeId === props.value,
    }
  }

  function getItemDataAttrs<T extends ItemProps>(props: T) {
    const radioState = getItemState(props)
    return {
      "data-focus": dataAttr(radioState.isFocused),
      "data-disabled": dataAttr(radioState.isDisabled),
      "data-state": radioState.isChecked ? "checked" : "unchecked",
      "data-hover": dataAttr(radioState.isHovered),
      "data-invalid": dataAttr(radioState.isInvalid),
      "data-orientation": state.context.orientation,
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
    getItemState,

    rootProps: normalize.element({
      ...parts.root.attrs,
      role: "radiogroup",
      id: dom.getRootId(state.context),
      "aria-labelledby": dom.getLabelId(state.context),
      "data-orientation": state.context.orientation,
      "data-disabled": dataAttr(isGroupDisabled),
      "aria-orientation": state.context.orientation,
      dir: state.context.dir,
      style: {
        position: "relative",
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      dir: state.context.dir,
      "data-orientation": state.context.orientation,
      "data-disabled": dataAttr(isGroupDisabled),
      id: dom.getLabelId(state.context),
      onClick: focus,
    }),

    getItemProps(props: ItemProps) {
      const rootState = getItemState(props)

      return normalize.label({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, props.value),
        htmlFor: dom.getItemHiddenInputId(state.context, props.value),
        ...getItemDataAttrs(props),
        onPointerMove() {
          if (rootState.isDisabled) return
          send({ type: "SET_HOVERED", value: props.value, hovered: true })
        },
        onPointerLeave() {
          if (rootState.isDisabled) return
          send({ type: "SET_HOVERED", value: null })
        },
        onPointerDown(event) {
          if (rootState.isDisabled) return
          // On pointerdown, the input blurs and returns focus to the `body`,
          // we need to prevent this.
          if (rootState.isFocused && event.pointerType === "mouse") {
            event.preventDefault()
          }
          send({ type: "SET_ACTIVE", value: props.value, active: true })
        },
        onPointerUp() {
          if (rootState.isDisabled) return
          send({ type: "SET_ACTIVE", value: null })
        },
      })
    },

    getItemTextProps(props: ItemProps) {
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        id: dom.getItemLabelId(state.context, props.value),
        ...getItemDataAttrs(props),
      })
    },

    getItemControlProps(props: ItemProps) {
      const controlState = getItemState(props)

      return normalize.element({
        ...parts.itemControl.attrs,
        dir: state.context.dir,
        id: dom.getItemControlId(state.context, props.value),
        "data-active": dataAttr(controlState.isActive),
        "aria-hidden": true,
        ...getItemDataAttrs(props),
      })
    },

    getItemHiddenInputProps(props: ItemProps) {
      const inputState = getItemState(props)

      return normalize.input({
        "data-ownedby": dom.getRootId(state.context),
        id: dom.getItemHiddenInputId(state.context, props.value),
        type: "radio",
        name: state.context.name || state.context.id,
        form: state.context.form,
        value: props.value,
        onChange(event) {
          if (inputState.isDisabled) return

          if (event.target.checked) {
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
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: props.value, active: true })
          }
        },
        onKeyUp(event) {
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: null })
          }
        },
        disabled: inputState.isDisabled,
        defaultChecked: inputState.isChecked,
        style: visuallyHiddenStyle,
      })
    },

    indicatorProps: normalize.element({
      id: dom.getIndicatorId(state.context),
      ...parts.indicator.attrs,
      dir: state.context.dir,
      hidden: state.context.value == null,
      "data-disabled": dataAttr(isGroupDisabled),
      "data-orientation": state.context.orientation,
      style: {
        "--transition-duration": "150ms",
        "--transition-property": "left, top, width, height",
        "--left": state.context.indicatorRect?.left,
        "--top": state.context.indicatorRect?.top,
        "--width": state.context.indicatorRect?.width,
        "--height": state.context.indicatorRect?.height,
        position: "absolute",
        willChange: "var(--transition-property)",
        transitionProperty: "var(--transition-property)",
        transitionDuration: state.context.canIndicatorTransition ? "var(--transition-duration)" : "0ms",
        transitionTimingFunction: "var(--transition-timing-function)",
        [state.context.orientation === "horizontal" ? "left" : "top"]:
          state.context.orientation === "horizontal" ? "var(--left)" : "var(--top)",
      },
    }),
  }
}
