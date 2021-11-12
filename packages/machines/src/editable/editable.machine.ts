import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { trackPointerDown, uuid } from "../utils"
import { dom } from "./editable.dom"
import { EditableMachineContext, EditableMachineState } from "./editable.types"

const { not } = guards

export const editableMachine = createMachine<EditableMachineContext, EditableMachineState>(
  {
    id: "editable-machine",
    initial: "unknown",
    context: {
      activationMode: "focus",
      submitMode: "both",
      uid: uuid(),
      value: "",
      previousValue: "",
      selectOnFocus: true,
    },
    computed: {
      submitOnEnter: (ctx) => ["both", "enter"].includes(ctx.submitMode),
      submitOnBlur: (ctx) => ["both", "blur"].includes(ctx.submitMode),
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isValueEmpty: (ctx) => ctx.value === "",
      isPreviewFocusable: (ctx) => ctx.activationMode === "focus",
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
            guard: "activateOnDblClick",
            target: "edit",
          },
          FOCUS: {
            target: "edit",
            guard: "activateOnFocus",
          },
        },
      },

      edit: {
        activities: "trackPointerDown",
        entry: choose([
          {
            guard: "selectOnFocus",
            actions: ["selectInput", "invokeOnEdit"],
          },
          { actions: ["focusInput", "invokeOnEdit"] },
        ]),
        on: {
          TYPE: {
            guard: not("isAtMaxLength"),
            actions: ["setValue", "invokeOnChange"],
          },
          BLUR: [
            {
              guard: "submitOnBlur",
              target: "preview",
              actions: ["focusEditButton", "invokeOnSubmit"],
            },
            {
              target: "preview",
              actions: ["revertValue", "focusEditButton"],
            },
          ],
          CANCEL: {
            target: "preview",
            actions: ["focusEditButton", "revertValue", "invokeOnCancel"],
          },
          ENTER: {
            guard: "submitOnEnter",
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
      canFocusPreview: (ctx) => ctx.isPreviewFocusable,
      submitOnBlur: (ctx) => ctx.submitOnBlur,
      submitOnEnter: (ctx) => ctx.submitOnEnter,
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
      revertValue(ctx) {
        ctx.value = ctx.previousValue
      },
      clearPointerdownNode(ctx) {
        ctx.pointerdownNode = null
      },
    },
  },
)
