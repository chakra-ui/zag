import { createMachine } from "@zag-js/core"
import { setElementValue, Timeout } from "@zag-js/dom-query"
import * as dom from "./clipboard.dom"
import type { ClipboardSchema } from "./clipboard.types"

export const machine = createMachine<ClipboardSchema>({
  props({ props }) {
    return {
      timeout: 3000,
      defaultValue: "",
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  watch({ track, context, action }) {
    track([() => context.get("value")], () => {
      action(["syncInputElement"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    COPY: {
      actions: ["copyToClipboard"],
    },
    // `reenter` restarts the timeout when copying again while copied
    "COPY.SUCCESS": {
      target: "copied",
      reenter: true,
      actions: ["invokeOnCopy"],
    },
    "INPUT.COPY": {
      target: "copied",
      reenter: true,
      actions: ["invokeOnCopy"],
    },
    "COPY.ERROR": {
      target: "idle",
      actions: ["invokeOnCopyError"],
    },
  },

  states: {
    idle: {},
    copied: {
      effects: ["waitForTimeout"],
      on: {
        "COPY.DONE": {
          target: "idle",
          actions: ["invokeOnCopyEnd"],
        },
      },
    },
  },

  implementations: {
    effects: {
      waitForTimeout({ prop, send }) {
        const timeout = Timeout.create()
        timeout.start(prop("timeout"), () => send({ type: "COPY.DONE" }))
        return timeout.cancel
      },
    },
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      copyToClipboard({ context, scope, send }) {
        dom.writeToClipboard(scope, context.get("value")).then(
          () => send({ type: "COPY.SUCCESS" }),
          (error) => send({ type: "COPY.ERROR", error }),
        )
      },
      invokeOnCopy({ prop }) {
        prop("onStatusChange")?.({ copied: true })
      },
      invokeOnCopyEnd({ prop }) {
        prop("onStatusChange")?.({ copied: false })
      },
      invokeOnCopyError({ prop, event }) {
        prop("onStatusChange")?.({ copied: false, error: event.error })
      },
      syncInputElement({ context, scope }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl) return
        setElementValue(inputEl, context.get("value"))
      },
    },
  },
})
