import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr, dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import { srOnlyStyle } from "../utils/live-region"
import type { ButtonProps, EventKeyMap, HTMLProps, InputProps, LabelProps } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { getElementIds, getElements } from "./combobox.dom"
import { ComboboxMachineContext, ComboboxMachineState } from "./combobox.machine"

export function connectComboboxMachine(
  state: S.State<ComboboxMachineContext, ComboboxMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

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

    labelProps: normalize<LabelProps>({
      htmlFor: ids.input,
      id: ids.label,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
    }),

    containerProps: normalize<HTMLProps>({
      id: ids.container,
      "data-expanded": expanded,
    }),

    inputProps: normalize<InputProps>({
      name: ctx.name,
      disabled: ctx.disabled,
      autoFocus: ctx.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "off",
      spellCheck: "false",
      readOnly: ctx.readonly,
      placeholder: ctx.placeholder,
      id: ids.input,
      type: "text",
      role: "combobox",
      value: autocomplete ? ctx.navigationValue : ctx.inputValue,
      "aria-describedby": ids.srHint,
      "aria-autocomplete": ctx.selectionMode === "autocomplete" ? "both" : "list",
      "aria-controls": expanded ? ids.listbox : undefined,
      "aria-expanded": expanded,
      "aria-activedescendant": ctx.activeId ?? undefined,
      onClick() {
        send("INPUT_CLICK")
      },
      onBlur(event) {
        const { listbox, toggleBtn } = getElements(ctx)
        const isValidBlur = validateBlur(event, {
          exclude: [listbox, toggleBtn],
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
        send({ type: "TYPE", value: event.target.value })
      },
      onKeyDown(event) {
        if (event.ctrlKey || event.shiftKey) return

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
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),

    buttonProps: normalize<ButtonProps>({
      id: ids.toggleBtn,
      "aria-haspopup": "true",
      type: "button",
      role: "button",
      tabIndex: -1,
      "aria-label": expanded ? "Hide suggestions" : "Show suggestions",
      "aria-expanded": expanded,
      "aria-controls": expanded ? ids.listbox : undefined,
      disabled: ctx.disabled,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
      onClick() {
        send("BUTTON_CLICK")
      },
    }),

    clearProps: normalize<ButtonProps>({
      "aria-label": "Clear",
      type: "reset",
      onClick() {
        send("CLEAR_BUTTON_CLICK")
      },
    }),

    listboxProps: normalize<HTMLProps>({
      id: ids.listbox,
      role: "listbox",
      hidden: !expanded,
      "aria-labelledby": ids.label,
    }),

    clearButtonProps: normalize<ButtonProps>({
      id: ids.clearBtn,
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

    assistiveHintProps: normalize<HTMLProps>({
      id: ids.srHint,
      children: [
        "When autocomplete results are available use up and down arrows to review and enter to select.",
        "Touch device users, explore by touch or with swipe gestures.",
      ].join(""),
      style: srOnlyStyle,
    }),

    getOptionProps(props: OptionProps) {
      const { value, label, virtualized, index, noOfOptions } = props
      const id = ids.getOptionId(value)
      const selected = ctx.activeId === id && ctx.eventSource === "keyboard"

      return normalize<HTMLProps>({
        id,
        role: "option",
        className: "option",
        "data-highlighted": dataAttr(ctx.activeId === id),
        "aria-selected": ariaAttr(selected),
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

type OptionProps = {
  virtualized?: true
  index?: number
  noOfOptions?: number
  value: string
  label: string
  disabled?: boolean
}
