import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey, srOnlyStyle, validateBlur } from "../utils"
import { dom } from "./combobox.dom"
import { ComboboxOptionProps, ComboboxSend, ComboboxState } from "./combobox.types"

export function comboboxConnect(state: ComboboxState, send: ComboboxSend, normalize = defaultPropNormalizer) {
  const { context: ctx } = state

  const expanded = state.matches("open")
  const autocomplete =
    expanded && ctx.activeId !== null && ctx.eventSource === "keyboard" && ctx.selectionMode === "autocomplete"

  return {
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },

    clearValue() {
      send("CLEAR_VALUE")
    },

    inputValue: ctx.inputValue,
    firstOptionLabel: ctx.firstOptionLabel,

    labelProps: normalize<Props.Label>({
      htmlFor: dom.getInputId(ctx),
      id: dom.getLabelId(ctx),
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
    }),

    containerProps: normalize<Props.Element>({
      id: dom.getContainerId(ctx),
      "data-expanded": dataAttr(expanded),
    }),

    inputProps: normalize<Props.Input>({
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
      value: autocomplete ? ctx.navigationValue : ctx.inputValue,
      "aria-describedby": dom.getSrHintId(ctx),
      "aria-autocomplete": ctx.selectionMode === "autocomplete" ? "both" : "list",
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
          send("INPUT_BLUR")
        }
      },
      onFocus() {
        send("INPUT_FOCUS")
      },
      onChange(event) {
        const evt = (event.nativeEvent ?? event) as InputEvent
        if (evt.isComposing) return
        send({ type: "TYPE", value: event.currentTarget.value, inputType: evt.inputType })
      },
      onKeyDown(event) {
        const evt = (event.nativeEvent ?? event) as KeyboardEvent
        if (event.ctrlKey || event.shiftKey || evt.isComposing) return

        const keymap: DOM.EventKeyMap = {
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
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),

    buttonProps: normalize<Props.Button>({
      id: dom.getToggleBtnId(ctx),
      hidden: ctx.inputValue.trim() !== "",
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
        send("BUTTON_CLICK")
      },
    }),

    clearProps: normalize<Props.Button>({
      "aria-label": "Clear",
      hidden: ctx.inputValue.trim() === "" || ctx.readonly,
      type: "reset",
      onPointerDown() {
        send("CLEAR_BUTTON_CLICK")
      },
    }),

    listboxProps: normalize<Props.Element>({
      id: dom.getListboxId(ctx),
      role: "listbox",
      hidden: !expanded,
      "aria-labelledby": dom.getLabelId(ctx),
    }),

    clearButtonProps: normalize<Props.Button>({
      id: dom.getClearBtnId(ctx),
      type: "button",
      role: "button",
      tabIndex: -1,
      disabled: ctx.disabled,
      "aria-label": "Clear value",
      hidden: !ctx.inputValue.trim().length,
      onClick() {
        send("CLEAR_VALUE")
      },
    }),

    srHintProps: normalize<Props.Element>({
      id: dom.getSrHintId(ctx),
      children: [
        "When autocomplete results are available use up and down arrows to review and enter to select.",
        "Touch device users, explore by touch or with swipe gestures.",
      ].join(""),
      style: srOnlyStyle,
    }),

    getOptionProps(props: ComboboxOptionProps) {
      const { value, label, virtualized, index, noOfOptions } = props
      const id = dom.getOptionId(ctx, value)
      const selected = ctx.activeId === id && ctx.eventSource === "keyboard"

      return normalize<Props.Element>({
        id,
        role: "option",
        tabIndex: -1,
        className: "option",
        "data-highlighted": dataAttr(ctx.activeId === id),
        "aria-selected": selected,
        "aria-disabled": ctx.disabled,
        ...(virtualized && {
          "aria-posinset": index,
          "aria-setsize": noOfOptions,
        }),
        "data-value": value,
        "data-label": label,
        onPointerOver() {
          send({ type: "OPTION_POINTEROVER", id, value: label })
        },
        onPointerOut() {
          send("OPTION_POINTEROUT")
        },
        onPointerDown(event) {
          event.preventDefault()
        },
        onClick(event) {
          event.preventDefault()
          send({ type: "OPTION_CLICK", id, value: label })
        },
      })
    },
  }
}
