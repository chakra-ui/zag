import { createMachine } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./editable.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./editable.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "editable",

      initial: ctx.startWithEditView ? "edit" : "preview",
      entry: ctx.startWithEditView ? ["focusInput"] : undefined,

      context: {
        activationMode: "focus",
        submitMode: "both",
        value: "",
        previousValue: "",
        selectOnFocus: true,
        disabled: false,
        readOnly: false,
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
        value: ["syncInputValue"],
      },

      computed: {
        submitOnEnter: (ctx) => ["both", "enter"].includes(ctx.submitMode),
        submitOnBlur: (ctx) => ["both", "blur"].includes(ctx.submitMode),
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        isValueEmpty: (ctx) => ctx.value === "",
        isPreviewFocusable: (ctx) => ctx.activationMode === "focus",
      },

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
      },

      states: {
        preview: {
          // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
          entry: ["blurInputIfNeeded"],
          on: {
            EDIT: {
              target: "edit",
              actions: ["setPreviousValue", "focusInput", "invokeOnEdit"],
            },
          },
        },

        edit: {
          activities: ["trackInteractOutside"],
          on: {
            TYPE: {
              actions: "setValue",
            },
            BLUR: [
              {
                guard: "submitOnBlur",
                target: "preview",
                actions: ["restoreFocus", "invokeOnSubmit"],
              },
              {
                target: "preview",
                actions: ["revertValue", "restoreFocus", "invokeOnCancel"],
              },
            ],
            CANCEL: {
              target: "preview",
              actions: ["revertValue", "restoreFocus", "invokeOnCancel"],
            },
            SUBMIT: {
              target: "preview",
              actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit"],
            },
          },
        },
      },
    },
    {
      guards: {
        submitOnBlur: (ctx) => ctx.submitOnBlur,
      },

      activities: {
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              const ignore = [dom.getCancelTriggerEl(ctx), dom.getSubmitTriggerEl(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              const { focusable } = event.detail
              send({ type: "BLUR", src: "interact-outside", focusable })
            },
          })
        },
      },

      actions: {
        restoreFocus(ctx, evt) {
          if (evt.focusable) return
          raf(() => {
            const finalEl = ctx.finalFocusEl?.() ?? dom.getEditTriggerEl(ctx)
            finalEl?.focus({ preventScroll: true })
          })
        },
        focusInput(ctx) {
          raf(() => {
            const inputEl = dom.getInputEl(ctx)
            if (!inputEl) return
            if (ctx.selectOnFocus) {
              inputEl.select()
            } else {
              inputEl.focus({ preventScroll: true })
            }
          })
        },
        invokeOnCancel(ctx) {
          ctx.onValueRevert?.({ value: ctx.previousValue })
        },
        invokeOnSubmit(ctx) {
          ctx.onValueCommit?.({ value: ctx.value })
        },
        invokeOnEdit(ctx) {
          ctx.onEdit?.()
        },
        syncInputValue(ctx) {
          sync.value(ctx)
        },
        setValue(ctx, evt) {
          const value = ctx.maxLength != null ? evt.value.slice(0, ctx.maxLength) : evt.value
          set.value(ctx, value)
        },
        setPreviousValue(ctx) {
          ctx.previousValue = ctx.value
        },
        revertValue(ctx) {
          set.value(ctx, ctx.previousValue)
        },
        blurInputIfNeeded(ctx) {
          dom.getInputEl(ctx)?.blur()
        },
      },
    },
  )
}

const sync = {
  value: (ctx: MachineContext) => {
    const inputEl = dom.getInputEl(ctx)
    dom.setValue(inputEl, ctx.value)
  },
}

const invoke = {
  change(ctx: MachineContext) {
    ctx.onValueChange?.({ value: ctx.value })
    sync.value(ctx)
  },
}

const set = {
  value(ctx: MachineContext, value: string) {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
}
