import { dataAttr, EventKeyMap, getEventKey, srOnlyStyle, validateBlur } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./combobox.dom"
import { ComboboxOptionProps, ComboboxSend, ComboboxState } from "./combobox.types"

export function comboboxConnect<T extends PropTypes = ReactPropTypes>(
  state: ComboboxState,
  send: ComboboxSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const expanded = state.matches("interacting", "navigating", "suggesting")
  const autoFill = state.matches("navigating", "interacting") && ctx.navigationValue && ctx.autoComplete

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
      "aria-describedby": dom.getSrHintId(ctx),
      // "aria-autocomplete": ctx.selectionMode === "autocomplete" ? "both" : "list",
      "aria-controls": expanded ? dom.getListboxId(ctx) : undefined,
      "aria-expanded": expanded,
      "aria-activedescendant": ctx.activeId ?? undefined,
      onClick() {
        send("INPUT_CLICK")
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
        const evt = (event.nativeEvent ?? event) as InputEvent
        if (evt.isComposing) return
        send({ type: "CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const evt = (event.nativeEvent ?? event) as KeyboardEvent
        if (event.ctrlKey || event.shiftKey || evt.isComposing) return

        const keymap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Enter() {
            send("ENTER")
          },
          Escape() {
            send("ESCAPE")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keymap[key]

        if (exec) {
          exec(event)
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
      "aria-label": expanded ? "Hide suggestions" : "Show suggestions",
      "aria-expanded": expanded,
      "aria-controls": expanded ? dom.getListboxId(ctx) : undefined,
      disabled: ctx.disabled,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
      onClick() {
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
    }),

    clearButtonProps: normalize.button<T>({
      id: dom.getClearBtnId(ctx),
      type: "button",
      role: "button",
      tabIndex: -1,
      disabled: ctx.disabled,
      "aria-label": "Clear value",
      hidden: ctx.isInputValueEmpty,
      onClick() {
        send("CLEAR_VALUE")
      },
    }),

    srHintProps: normalize.element<T>({
      id: dom.getSrHintId(ctx),
      children: [
        "When autocomplete results are available use up and down arrows to review and enter to select.",
        "Touch device users, explore by touch or with swipe gestures.",
      ].join(""),
      style: srOnlyStyle,
    }),

    getOptionProps(props: ComboboxOptionProps) {
      const { value, label, index, optionCount } = props
      const id = dom.getOptionId(ctx, value)
      const selected = ctx.activeId === id && state.matches("navigating")

      return normalize.element<T>({
        id,
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(ctx.activeId === id),
        "aria-selected": selected,
        "aria-disabled": ctx.disabled,
        "aria-posinset": index ? index + 1 : undefined,
        "aria-setsize": optionCount,
        "data-value": value,
        "data-label": label,
        onPointerOver() {
          send({ type: "POINTEROVER_OPTION", id, value: label })
        },
        onPointerDown(event) {
          event.preventDefault()
        },
        onClick(event) {
          event.preventDefault()
          send({ type: "CLICK_OPTION", id, value: label })
        },
      })
    },
  }
}
