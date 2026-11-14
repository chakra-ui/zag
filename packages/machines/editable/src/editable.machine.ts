import { createMachine } from "@zag-js/core"
import { AnimationFrame, contains } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import * as dom from "./editable.dom"
import type { EditableSchema } from "./editable.types"

export const machine = createMachine<EditableSchema>({
  props({ props }) {
    return {
      activationMode: "focus",
      submitMode: "both",
      defaultValue: "",
      selectOnFocus: true,
      ...props,
    }
  },

  initialState({ prop }) {
    const edit = prop("edit") || prop("defaultEdit")
    return edit ? "edit" : "preview"
  },

  entry: ["focusInputIfNeeded"],

  exit: ["cancelFrames"],

  refs() {
    return {
      focusFrame: AnimationFrame.create(),
      syncFrame: AnimationFrame.create(),
    }
  },

  context: ({ bindable, prop }) => {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          return prop("onValueChange")?.({ value })
        },
      })),
      previousValue: bindable(() => ({
        defaultValue: prop("value") ?? prop("defaultValue"),
      })),
    }
  },

  watch({ track, action, context, prop }) {
    track([() => context.get("value")], () => {
      action(["syncInputValue"])
    })

    track([() => prop("edit")], () => {
      action(["toggleEditing"])
    })
  },

  computed: {
    submitOnEnter({ prop }) {
      const submitMode = prop("submitMode")
      return submitMode === "both" || submitMode === "enter"
    },
    submitOnBlur({ prop }) {
      const submitMode = prop("submitMode")
      return submitMode === "both" || submitMode === "blur"
    },
    isInteractive({ prop }) {
      return !(prop("disabled") || prop("readOnly"))
    },
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue", "reconcileInputValue"],
    },
  },

  states: {
    preview: {
      entry: ["blurInput"],
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
      effects: ["trackInteractOutside"],
      entry: ["syncInputValue"],
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

  implementations: {
    guards: {
      isEditControlled: ({ prop }) => prop("edit") != undefined,
      isSubmitEvent: ({ event }) => event.previousEvent?.type === "SUBMIT",
    },

    effects: {
      trackInteractOutside({ send, scope, prop, computed }) {
        return trackInteractOutside(dom.getInputEl(scope), {
          exclude(target) {
            const ignore = [dom.getCancelTriggerEl(scope), dom.getSubmitTriggerEl(scope)]
            return ignore.some((el) => contains(el, target))
          },
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            const { focusable } = event.detail
            send({
              type: computed("submitOnBlur") ? "SUBMIT" : "CANCEL",
              src: "interact-outside",
              focusable,
            })
          },
        })
      },
    },

    actions: {
      restoreFocus({ event, scope, prop, refs }) {
        if (event.focusable) return
        refs.get("focusFrame").request(() => {
          const finalEl = prop("finalFocusEl")?.() ?? dom.getEditTriggerEl(scope)
          finalEl?.focus({ preventScroll: true })
        })
      },
      cancelFrames({ refs }) {
        refs.get("focusFrame").cancel()
        refs.get("syncFrame").cancel()
      },
      clearValue({ context }) {
        context.set("value", "")
      },
      focusInputIfNeeded({ action, prop }) {
        const edit = prop("edit") || prop("defaultEdit")
        if (!edit) return
        action(["focusInput"])
      },
      focusInput({ scope, prop, refs }) {
        refs.get("focusFrame").request(() => {
          const inputEl = dom.getInputEl(scope)
          if (!inputEl) return
          if (prop("selectOnFocus")) {
            inputEl.select()
          } else {
            inputEl.focus({ preventScroll: true })
          }
        })
      },
      invokeOnCancel({ prop, context }) {
        const prev = context.get("previousValue")
        prop("onValueRevert")?.({ value: prev })
      },
      invokeOnSubmit({ prop, context }) {
        const value = context.get("value")
        prop("onValueCommit")?.({ value })
      },
      invokeOnEdit({ prop }) {
        prop("onEditChange")?.({ edit: true })
      },
      invokeOnPreview({ prop }) {
        prop("onEditChange")?.({ edit: false })
      },
      toggleEditing({ prop, send, event }) {
        send({
          type: prop("edit") ? "CONTROLLED.EDIT" : "CONTROLLED.PREVIEW",
          previousEvent: event,
        })
      },
      syncInputValue({ context, scope }) {
        dom.syncInputValue(scope, context.get("value"))
      },
      reconcileInputValue({ context, scope, refs, event }) {
        if (event.composing) return
        refs.get("syncFrame").request(() => dom.syncInputValue(scope, context.get("value"), event.selection))
      },
      setValue({ context, prop, event }) {
        if (event.composing) return
        const max = prop("maxLength")
        const value = max != null ? event.value.slice(0, max) : event.value
        context.set("value", value)
      },
      setPreviousValue({ context }) {
        context.set("previousValue", context.get("value"))
      },
      revertValue({ context }) {
        context.set("value", context.get("previousValue"))
      },
      blurInput({ scope }) {
        dom.getInputEl(scope)?.blur()
      },
    },
  },
})
