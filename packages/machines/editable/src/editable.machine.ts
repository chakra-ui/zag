import { createMachine } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./editable.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./editable.types"

const submitOnEnter = (ctx: MachineContext) => ["both", "enter"].includes(ctx.submitMode)
const submitOnBlur = (ctx: MachineContext) => ["both", "blur"].includes(ctx.submitMode)

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "editable",

      initial: ctx.edit ? "edit" : "preview",
      entry: ctx.edit ? ["focusInput"] : undefined,

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
        edit: ["toggleEditing"],
      },

      computed: {
        submitOnEnter,
        submitOnBlur,
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
      },

      on: {
        "VALUE.SET": {
          actions: "setValue",
        },
      },

      states: {
        preview: {
          // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
          entry: ["blurInputIfNeeded"],
          on: {
            "CONTROLLED.EDIT": {
              target: "edit",
              actions: ["setPreviousValue", "focusInput"],
            },
            EDIT: [
              {
                guard: "isEditControlled",
                actions: ["invokeOnEdit"],
              },
              {
                target: "edit",
                actions: ["setPreviousValue", "focusInput", "invokeOnEdit"],
              },
            ],
          },
        },

        edit: {
          activities: ["trackInteractOutside"],
          on: {
            "CONTROLLED.PREVIEW": [
              {
                guard: "isSubmitEvent",
                target: "preview",
                actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit"],
              },
              {
                target: "preview",
                actions: ["revertValue", "restoreFocus", "invokeOnCancel"],
              },
            ],
            CANCEL: [
              {
                guard: "isEditControlled",
                actions: ["invokeOnPreview"],
              },
              {
                target: "preview",
                actions: ["revertValue", "restoreFocus", "invokeOnCancel", "invokeOnPreview"],
              },
            ],
            SUBMIT: [
              {
                guard: "isEditControlled",
                actions: ["invokeOnPreview"],
              },
              {
                target: "preview",
                actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit", "invokeOnPreview"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        isEditControlled: (ctx) => !!ctx["edit.controlled"],
        isSubmitEvent: (_ctx, evt) => evt.previousEvent?.type === "SUBMIT",
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
              send({ type: submitOnBlur(ctx) ? "SUBMIT" : "CANCEL", src: "interact-outside", focusable })
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
          ctx.onEditChange?.({ edit: true })
        },
        invokeOnPreview(ctx) {
          ctx.onEditChange?.({ edit: false })
        },
        toggleEditing(ctx, evt, { send }) {
          send({ type: ctx.edit ? "CONTROLLED.EDIT" : "CONTROLLED.PREVIEW", previousEvent: evt })
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
