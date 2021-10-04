import { choose, createMachine, guards, ref, StateMachine as S } from "@ui-machines/core"
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
}> &
  S.Computed<{
    isInteractive: boolean
    isValueEmpty: boolean
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
      submitOnEnter: true,
    },
    computed: {
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isValueEmpty: (ctx) => ctx.value === "",
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
        entry: "clearPointerdownNode",
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
        activities: "trackPointerDown",
        entry: choose([
          {
            cond: "selectOnFocus",
            actions: ["selectInput", "invokeOnEdit"],
          },
          { actions: ["focusInput", "invokeOnEdit"] },
        ]),
        on: {
          TYPE: {
            cond: not("isAtMaxLength"),
            actions: ["setValue", "invokeOnChange"],
          },
          BLUR: [
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
          ENTER: {
            cond: "submitOnEnter",
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
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
      submitOnEnter: (ctx) => !!ctx.submitOnEnter,
      selectOnFocus: (ctx) => !!ctx.selectOnFocus,
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
          dom.getInputEl(ctx)?.focus()
        })
      },
      selectInput(ctx) {
        nextTick(() => {
          dom.getInputEl(ctx)?.select()
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
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
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
