import { NormalizeProps, PropTypes } from "@zag-js/types"
import { State, Send, ItemProps, InputProps } from "./radio.types"
import { dom } from "./radio.dom"
import { ariaAttr, dataAttr, visuallyHiddenStyle } from "@zag-js/dom-utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isGroupDisabled = state.context.disabled
  const isGroupReadonly = state.context.readonly

  function getRadioState<T extends ItemProps>(props: T) {
    const itemState = {
      isReadOnly: props.readonly || isGroupReadonly,
      isInvalid: props.invalid,
      isDisabled: props.disabled || isGroupDisabled,
      isChecked: state.context.value === props.value,
      isFocused: state.context.focusedId === props.value,
      isHovered: state.context.hoveredId === props.value,
      isActive: state.context.activeId === props.value,
    }
    return {
      ...itemState,
      isInteractive: !(itemState.isReadOnly || itemState.isDisabled),
    }
  }

  function getRadioDataSet<T extends ItemProps>(props: T) {
    const radioState = getRadioState(props)
    return {
      "data-focus": dataAttr(radioState.isFocused),
      "data-disabled": dataAttr(radioState.isDisabled),
      "data-checked": dataAttr(radioState.isChecked),
      "data-hover": dataAttr(radioState.isHovered),
      "data-invalid": dataAttr(radioState.isInvalid),
      "data-readonly": dataAttr(radioState.isReadOnly),
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
    value: state.context.value,
    setValue(value: string) {
      send({ type: "SET_VALUE", value, manual: true })
    },
    focus,
    blur() {
      const focusedElement = dom.getActiveElement(state.context)
      const inputEls = dom.getInputEls(state.context)
      const radioInputIsFocused = inputEls.some((el) => el === focusedElement)
      if (radioInputIsFocused) focusedElement?.blur()
    },

    rootProps: normalize.element({
      "data-part": "root",
      role: "radiogroup",
      id: dom.getRootId(state.context),
      "data-orientation": state.context.orientation,
      "aria-orientation": state.context.orientation,
      dir: state.context.dir,
    }),

    labelProps: normalize.element({
      "data-part": "label",
      id: dom.getLabelId(state.context),
      onClick: focus,
    }),

    getItemProps(props: ItemProps) {
      const rootState = getRadioState(props)

      return normalize.label({
        "data-part": "item",
        id: dom.getItemId(state.context, props.value),
        htmlFor: dom.getItemInputId(state.context, props.value),
        ...getRadioDataSet(props),

        onPointerMove() {
          if (!rootState.isInteractive) return
          send({ type: "SET_HOVERED", value: props.value, hovered: true })
        },
        onPointerLeave() {
          if (!rootState.isInteractive) return
          send({ type: "SET_HOVERED", value: null })
        },
        onPointerDown(event) {
          if (!rootState.isInteractive) return
          // On pointerdown, the input blurs and returns focus to the `body`,
          // we need to prevent this.
          if (rootState.isFocused) event.preventDefault()
          send({ type: "SET_ACTIVE", value: props.value, active: true })
        },
        onPointerUp() {
          if (!rootState.isInteractive) return
          send({ type: "SET_ACTIVE", value: null })
        },
      })
    },

    getItemLabelProps(props: ItemProps) {
      return normalize.element({
        "data-part": "item-label",
        id: dom.getItemLabelId(state.context, props.value),
        ...getRadioDataSet(props),
      })
    },

    getItemControlProps(props: ItemProps) {
      const controlState = getRadioState(props)

      return normalize.element({
        "data-part": "item-control",
        id: dom.getItemControlId(state.context, props.value),
        "data-active": dataAttr(controlState.isActive),
        "aria-hidden": true,
        ...getRadioDataSet(props),
      })
    },

    getItemInputProps(props: InputProps) {
      const inputState = getRadioState(props)

      const isRequired = props.required
      const trulyDisabled = inputState.isDisabled && !props.focusable

      return normalize.input({
        "data-part": "item-input",
        "data-ownedby": dom.getRootId(state.context),
        id: dom.getItemInputId(state.context, props.value),

        type: "radio",
        name: state.context.name || state.context.id,
        form: state.context.form,
        value: props.value,
        onChange(event) {
          if (inputState.isReadOnly || inputState.isDisabled) {
            return
          }
          if (event.target.checked) {
            send({ type: "SET_VALUE", value: props.value })
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
        disabled: trulyDisabled,
        required: isRequired,
        defaultChecked: inputState.isChecked,
        "data-disabled": dataAttr(inputState.isDisabled),
        "aria-required": ariaAttr(isRequired),
        "aria-invalid": ariaAttr(inputState.isInvalid),
        readOnly: inputState.isReadOnly,
        "data-readonly": dataAttr(inputState.isReadOnly),
        "aria-disabled": ariaAttr(trulyDisabled),
        "aria-checked": ariaAttr(inputState.isChecked),
        style: visuallyHiddenStyle,
      })
    },
  }
}
