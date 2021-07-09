import { createMachine, guards, ref, trackPointerDown } from "@ui-machines/core"
import { nextTick } from "@ui-machines/utils/function-utils"
import { WithDOM } from "../type-utils"
import { getElements } from "./editable.dom"

const { not } = guards

export type EditableMachineContext = WithDOM<{
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
  value: "preview" | "edit"
}

export const editableMachine = createMachine<
  EditableMachineContext,
  EditableMachineState
>(
  {
    id: "editable-machine",
    initial: "preview",
    context: {
      uid: "32",
      value: "",
      previousValue: "",
      isPreviewFocusable: true,
      submitOnBlur: true,
      selectOnFocus: true,
    },
    on: {
      MOUNT: {
        actions: ["setId", "setOwnerDocument"],
      },
    },
    states: {
      preview: {
        entry: ["clearPointerdownNode"],
        on: {
          EDIT: "edit",
          FOCUS: "edit",
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
              cond: "shouldSubmitOnBlur",
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
      shouldSubmitOnBlur: (ctx) => !!ctx.submitOnBlur,
      isAtMaxLength: (ctx) =>
        ctx.maxLength != null && ctx.value.length === ctx.maxLength,
    },
    activities: { trackPointerDown },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = ref(evt.doc)
      },
      focusEditButton(ctx) {
        nextTick(() => {
          const { editBtn } = getElements(ctx)
          editBtn?.focus()
        })
      },
      focusInput(ctx) {
        const { input } = getElements(ctx)
        nextTick(() => {
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
