import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { dom } from "./editable.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./editable.types"

const { not } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "editable",
      initial: "unknown",
      context: {
        startWithEditView: false,
        activationMode: "focus",
        submitMode: "both",
        value: "",
        previousValue: "",
        selectOnFocus: true,
        ...ctx,
        translations: {
          input: "editable input",
          edit: "edit",
          submit: "submit",
          cancel: "cancel",
          ...ctx.translations,
        },
      },

      watch: {
        value: ["invokeOnChange", "syncInputValue"],
      },

      computed: {
        submitOnEnter: (ctx) => ["both", "enter"].includes(ctx.submitMode),
        submitOnBlur: (ctx) => ["both", "blur"].includes(ctx.submitMode),
        isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
        isValueEmpty: (ctx) => ctx.value === "",
        isPreviewFocusable: (ctx) => ctx.activationMode === "focus",
      },

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: [
              {
                guard: "startWithEditView",
                target: "edit",
              },
              {
                target: "preview",
              },
            ],
          },
        },

        preview: {
          // // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
          entry: ["blurInputIfNeeded"],
          on: {
            EDIT: "edit",
            DBLCLICK: {
              guard: "activateOnDblClick",
              target: "edit",
            },
            FOCUS: {
              guard: "activateOnFocus",
              target: "edit",
              actions: "setPreviousValue",
            },
          },
        },

        edit: {
          activities: ["trackInteractOutside"],
          entry: ["focusInput", "invokeOnEdit"],
          on: {
            TYPE: {
              guard: not("isAtMaxLength"),
              actions: "setValue",
            },
            BLUR: [
              {
                guard: "submitOnBlur",
                target: "preview",
                actions: ["focusEditButton", "invokeOnSubmit"],
              },
              {
                target: "preview",
                actions: ["revertValue", "focusEditButton", "invokeOnCancel"],
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
        submitOnBlur: (ctx) => ctx.submitOnBlur,
        submitOnEnter: (ctx) => ctx.submitOnEnter,
        isAtMaxLength: (ctx) => ctx.maxLength != null && ctx.value.length === ctx.maxLength,
        activateOnDblClick: (ctx) => ctx.activationMode === "dblclick",
        activateOnFocus: (ctx) => ctx.activationMode === "focus",
        startWithEditView: (ctx) => ctx.startWithEditView,
      },

      activities: {
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              const ignore = [dom.getCancelBtnEl(ctx), dom.getSubmitBtnEl(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onInteractOutside() {
              send({ type: "BLUR", src: "interact-outside" })
            },
          })
        },
      },

      actions: {
        focusEditButton(ctx) {
          raf(() => {
            dom.getEditBtnEl(ctx)?.focus()
          })
        },
        focusInput(ctx) {
          raf(() => {
            const input = dom.getInputEl(ctx)
            if (!input) return
            if (ctx.selectOnFocus) input.select()
            else input.focus()
          })
        },
        invokeOnCancel(ctx) {
          const details = { id: ctx.id, value: ctx.previousValue }
          const emit = dom.emitter(ctx)
          emit("cancel", details)
          ctx.onCancel?.(details)
        },
        invokeOnSubmit(ctx) {
          const details = { id: ctx.id, value: ctx.value }
          const emit = dom.emitter(ctx)
          emit("submit", details)
          ctx.onSubmit?.(details)
        },
        invokeOnEdit(ctx) {
          const details = { id: ctx.id }
          const emit = dom.emitter(ctx)
          emit("edit", details)
          ctx.onEdit?.(details)
        },
        invokeOnChange(ctx) {
          const details = { id: ctx.id, value: ctx.value }
          ctx.onChange?.(details)
          const emit = dom.emitter(ctx)
          emit("change", details)
        },
        syncInputValue(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input) return
          input.value = ctx.value
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
        blurInputIfNeeded(ctx) {
          dom.getInputEl(ctx)?.blur()
        },
      },

      hookSync: true,
    },
  )
}
