import { validateBlur } from "@core-dom/event"
import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { dataAttr, determineEventKey } from "../dom-utils"
import {
  DOMButtonProps,
  DOMHTMLProps,
  DOMInputProps,
  DOMLabelProps,
  EventKeyMap,
  WithDataAttr,
} from "../type-utils"
import { getElementIds, getElements } from "./combobox.dom"
import {
  ComboboxMachineContext,
  ComboboxMachineState,
} from "./combobox.machine"

export function connectComboboxMachine(
  state: S.State<ComboboxMachineContext, ComboboxMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  const expanded = state.matches("open")

  return {
    inputValue: ctx.inputValue,

    labelProps: normalize<DOMLabelProps>({
      htmlFor: ids.input,
      id: ids.label,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
    }),

    comboboxProps: normalize<DOMHTMLProps>({
      id: ids.container,
      role: "combobox",
      "aria-expanded": expanded,
      "aria-owns": ids.listbox,
      "aria-haspopup": "listbox",
    }),

    inputProps: normalize<DOMInputProps>({
      name: ctx.name,
      disabled: ctx.disabled,
      autoFocus: ctx.autoFocus,
      readOnly: ctx.readonly,
      id: ids.input,
      type: "text",
      "aria-autocomplete": "list",
      "aria-controls": ids.listbox,
      autoComplete: "off",
      spellCheck: "false",
      role: "combobox",
      value: ctx.inputValue,
      "aria-expanded": expanded,
      "aria-activedescendant": ctx.activeId ?? "",
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

    toggleButtonProps: normalize<DOMButtonProps>({
      "aria-haspopup": "listbox",
      type: "button",
      role: "button",
      tabIndex: -1,
      "aria-label": "Show suggestions",
      "aria-expanded": expanded,
      disabled: ctx.disabled,
      "data-readonly": dataAttr(ctx.readonly),
      "data-disabled": dataAttr(ctx.disabled),
      onPointerDown(event) {
        event.preventDefault()
        send("TOGGLE_POINTERDOWN")
      },
      onClick(event) {
        event.preventDefault()
        send("TOGGLE_CLICK")
      },
    }),

    listboxProps: normalize<DOMHTMLProps>({
      id: ids.listbox,
      role: "listbox",
      hidden: !expanded,
      "aria-labelledby": ids.label,
    }),

    getOptionProps(opts: { value: string; label: string }) {
      const { value, label } = opts
      const id = ids.getOptionId(value)
      const selected = ctx.activeId === id

      return normalize<WithDataAttr<DOMHTMLProps>>({
        id,
        role: "option",
        "aria-selected": selected,
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
