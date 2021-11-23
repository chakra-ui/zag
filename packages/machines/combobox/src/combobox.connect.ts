import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, validateBlur } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./combobox.dom"
import { ComboboxOptionGroupProps, ComboboxOptionProps, ComboboxSend, ComboboxState } from "./combobox.types"

export function comboboxConnect<T extends PropTypes = ReactPropTypes>(
  state: ComboboxState,
  send: ComboboxSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const expanded = state.matches("interacting", "suggesting")
  const autoFill = state.matches("interacting") && ctx.navigationValue && ctx.autoComplete
  const showClearButton = (!state.matches("idle", "unknown") || ctx.isHoveringInput) && !ctx.isInputValueEmpty

  return {
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },

    clearValue() {
      send("CLEAR_VALUE")
    },

    inputValue: ctx.inputValue,
    firstOptionLabel: ctx.firstOptionLabel,

    labelProps: normalize.label<T>({
      htmlFor: dom.getInputId(ctx),
      id: dom.getLabelId(ctx),
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
    }),

    containerProps: normalize.element<T>({
      id: dom.getContainerId(ctx),
      "data-expanded": dataAttr(expanded),
    }),

    inputProps: normalize.input<T>({
      name: ctx.name,
      disabled: ctx.disabled,
      autoFocus: ctx.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "off",
      spellCheck: "false",
      readOnly: ctx.readonly,
      placeholder: ctx.placeholder,
      id: dom.getInputId(ctx),
      type: "text",
      role: "combobox",
      value: autoFill ? ctx.navigationValue : ctx.inputValue,
      "aria-autocomplete": ctx.autoComplete ? "both" : "list",
      "aria-controls": expanded ? dom.getListboxId(ctx) : undefined,
      "aria-expanded": expanded,
      "aria-activedescendant": ctx.activeId ?? undefined,
      onPointerDown() {
        send("POINTER_DOWN")
      },
      onPointerOver() {
        send("POINTER_OVER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getListboxEl(ctx), dom.getToggleBtnEl(ctx)],
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onFocus() {
        send("FOCUS")
      },
      onChange(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        send({ type: "CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const evt = getNativeEvent(event)
        if (event.ctrlKey || event.shiftKey || evt.isComposing) return

        let preventDefault = false

        const keymap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
            preventDefault = true
          },
          ArrowUp() {
            send("ARROW_UP")
            preventDefault = true
          },
          ArrowLeft() {
            send("CLEAR_FOCUS")
          },
          ArrowRight() {
            send("CLEAR_FOCUS")
          },
          Home() {
            send("HOME")
            console.log("sent")
            preventDefault = true
          },
          End() {
            send("END")
            preventDefault = true
          },
          Enter() {
            send("ENTER")
            preventDefault = true
          },
          Escape() {
            send("ESCAPE")
            preventDefault = true
          },
          Backspace() {
            send("BACKSPACE")
          },
          Delete() {
            send("DELETE_KEY")
          },
          Tab() {
            send("TAB")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keymap[key]

        if (exec) exec(event)
        if (preventDefault) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
    }),

    buttonProps: normalize.button<T>({
      id: dom.getToggleBtnId(ctx),
      "aria-haspopup": "true",
      type: "button",
      role: "button",
      tabIndex: -1,
      "aria-label": expanded ? ctx.openText : ctx.closeText,
      "aria-expanded": expanded,
      "aria-controls": expanded ? dom.getListboxId(ctx) : undefined,
      disabled: ctx.disabled,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
      onPointerDown(event) {
        event.preventDefault()
        send("CLICK_BUTTON")
      },
    }),

    listboxProps: normalize.element<T>({
      id: dom.getListboxId(ctx),
      role: "listbox",
      hidden: !expanded,
      "aria-labelledby": dom.getLabelId(ctx),
      onPointerLeave() {
        send("POINTERLEAVE_LISTBOX")
      },
      onPointerDown(event) {
        // prevent options from taking focus
        event.preventDefault()
      },
    }),

    clearButtonProps: normalize.button<T>({
      id: dom.getClearBtnId(ctx),
      type: "button",
      role: "button",
      tabIndex: -1,
      disabled: ctx.disabled,
      "aria-label": ctx.clearText,
      hidden: !showClearButton,
      onPointerDown(event) {
        event.preventDefault()
        send("CLEAR_VALUE")
      },
    }),

    getOptionProps(props: ComboboxOptionProps) {
      const { value, label, index, optionCount, disabled } = props
      const id = dom.getOptionId(ctx, value, index)
      const selected = ctx.activeId === id

      return normalize.element<T>({
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(ctx.activeId === id),
        "aria-selected": selected,
        "aria-disabled": disabled,
        "aria-posinset": index != null ? index + 1 : undefined,
        "aria-setsize": optionCount,
        "data-value": value,
        "data-label": label,
        // Prefer pointermove to pointerenter to avoid interrupting the keyboard navigation
        onPointerMove() {
          send({ type: "POINTEROVER_OPTION", id, value: label })
        },
        onPointerUp(event) {
          event.currentTarget.click()
        },
        onClick(event) {
          event.preventDefault()
          send({ type: "CLICK_OPTION", id, value: label })
        },
        onAuxClick(event) {
          event.currentTarget.click()
        },
      })
    },

    getOptionGroupProps(props: ComboboxOptionGroupProps) {
      const { label } = props
      return normalize.element<T>({
        role: "group",
        "aria-label": label,
      })
    },
  }
}
