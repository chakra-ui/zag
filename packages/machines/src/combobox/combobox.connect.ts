import { validateBlur } from "@core-dom/event"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer, determineEventKey } from "../__utils/dom"
import { ButtonProps, HTMLProps, InputProps, LabelProps, EventKeyMap } from "../__utils/types"
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

  return {
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
      value: ctx.inputValue,
      "aria-autocomplete": ctx.autoSelect === "inline" ? "both" : "list",
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

        const key = determineEventKey(event, ctx)
        const exec = keymap[key]

        if (exec) {
          event.preventDefault()
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

    getOptionProps(opts: { value: string; label: string }) {
      const { value, label } = opts
      const id = ids.getOptionId(value)
      const selected = ctx.activeId === id

      return normalize<HTMLProps>({
        id,
        role: "option",
        className: "option",
        "aria-selected": selected ? "true" : undefined,
        "aria-disabled": ctx.disabled,
        "data-value": value,
        "data-label": label,
        onPointerOver() {
          send({ type: "OPTION_POINTEROVER", id, value: label })
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
