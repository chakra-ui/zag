import { createMachine, guards, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import type { DOM } from "../utils"
import { trackPointerDown } from "../utils"
import { dom } from "./editable.dom"

const { not } = guards

export type EditableMachineContext = DOM.Context<{
  activationMode: "focus" | "dblclick"
  value: string
  previousValue: string
  maxLength?: number
  disabled?: boolean
  readonly?: boolean
  isPreviewFocusable?: boolean
  selectOnFocus?: boolean
  submitOnBlur?: boolean
  submitOnEnter?: boolean
  onChange?: (value: string) => void
  onCancel?: (value: string) => void
  onSubmit?: (value: string) => void
  onEdit?: () => void
  placeholder?: string
}>

export type EditableMachineState = {
  value: "unknown" | "preview" | "edit"
}

export const editableMachine = createMachine<EditableMachineContext, EditableMachineState>(
  {
    id: "editable-machine",
    initial: "unknown",
    context: {
      activationMode: "focus",
      uid: "32",
      value: "",
      previousValue: "",
      isPreviewFocusable: true,
      submitOnBlur: true,
      selectOnFocus: true,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "preview",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      preview: {
        entry: ["clearPointerdownNode"],
        on: {
          EDIT: "edit",
          DBLCLICK: {
            cond: "activateOnDblClick",
            target: "edit",
          },
          FOCUS: {
            target: "edit",
            cond: "activateOnFocus",
          },
        },
      },
      edit: {
        entry: ["focusInput", "invokeOnEdit"],
        activities: "trackPointerDown",
        on: {
          TYPE: {
            cond: not("isAtMaxLength"),
            actions: ["setValue", "invokeOnChange"],
          },
          CLICK_OUTSIDE: [
            {
              cond: "submitOnBlur",
              target: "preview",
              actions: ["focusEditButton", "invokeOnSubmit"],
            },
            {
              target: "preview",
              actions: "focusEditButton",
            },
          ],
          CANCEL: {
            target: "preview",
            actions: ["focusEditButton", "resetValue", "invokeOnCancel"],
          },
          SUBMIT: {
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
          },
        },
      },
    },
  },
  {
    guards: {
      canFocusPreview: (ctx) => !!ctx.isPreviewFocusable,
      submitOnBlur: (ctx) => !!ctx.submitOnBlur,
      isAtMaxLength: (ctx) => ctx.maxLength != null && ctx.value.length === ctx.maxLength,
      activateOnDblClick: (ctx) => ctx.activationMode === "dblclick",
      activateOnFocus: (ctx) => ctx.activationMode === "focus",
    },
    activities: {
      trackPointerDown,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      focusEditButton(ctx) {
        nextTick(() => {
          dom.getEditBtnEl(ctx)?.focus()
        })
      },
      focusInput(ctx) {
        nextTick(() => {
          const input = dom.getInputEl(ctx)
          if (ctx.selectOnFocus) input?.select()
          else input?.focus()
        })
      },
      invokeOnCancel(ctx) {
        ctx.onCancel?.(ctx.previousValue)
      },

      invokeOnSubmit(ctx) {
        ctx.onSubmit?.(ctx.value)
      },
      invokeOnEdit(ctx) {
        ctx.onEdit?.()
      },
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
      setPreviousValue(ctx) {
        ctx.previousValue = ctx.value
      },
      resetValue(ctx) {
        ctx.value = ctx.previousValue
      },
      clearPointerdownNode(ctx) {
        ctx.pointerdownNode = null
      },
    },
  },
)
