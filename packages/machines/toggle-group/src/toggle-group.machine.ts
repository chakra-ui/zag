import { createGuards, createMachine } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { addOrRemove, ensureProps, isArray, isEqual } from "@zag-js/utils"
import * as dom from "./toggle-group.dom"
import type { ToggleGroupSchema } from "./toggle-group.types"

const { not, and } = createGuards<ToggleGroupSchema>()

export const machine = createMachine<ToggleGroupSchema>({
  props({ props }) {
    return {
      defaultValue: [],
      orientation: "horizontal",
      rovingFocus: true,
      loopFocus: true,
      deselectable: true,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      value: bindable<string[]>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      focusedId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      isTabbingBackward: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      isClickFocus: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      isWithinToolbar: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  computed: {
    currentLoopFocus: ({ context, prop }) => prop("loopFocus") && !context.get("isWithinToolbar"),
  },

  entry: ["checkIfWithinToolbar"],

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "TOGGLE.CLICK": {
      actions: ["setValue"],
    },
    "ROOT.MOUSE_DOWN": {
      actions: ["setClickFocus"],
    },
  },

  states: {
    idle: {
      on: {
        "ROOT.FOCUS": {
          target: "focused",
          guard: not(and("isClickFocus", "isTabbingBackward")),
          actions: ["focusFirstToggle", "clearClickFocus"],
        },
        "TOGGLE.FOCUS": {
          target: "focused",
          actions: ["setFocusedId"],
        },
      },
    },

    focused: {
      on: {
        "ROOT.BLUR": {
          target: "idle",
          actions: ["clearIsTabbingBackward", "clearFocusedId", "clearClickFocus"],
        },
        "TOGGLE.FOCUS": {
          actions: ["setFocusedId"],
        },
        "TOGGLE.FOCUS_NEXT": {
          actions: ["focusNextToggle"],
        },
        "TOGGLE.FOCUS_PREV": {
          actions: ["focusPrevToggle"],
        },
        "TOGGLE.FOCUS_FIRST": {
          actions: ["focusFirstToggle"],
        },
        "TOGGLE.FOCUS_LAST": {
          actions: ["focusLastToggle"],
        },
        "TOGGLE.SHIFT_TAB": [
          {
            guard: not("isFirstToggleFocused"),
            target: "idle",
            actions: ["setIsTabbingBackward"],
          },
          {
            actions: ["setIsTabbingBackward"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isClickFocus: ({ context }) => context.get("isClickFocus"),
      isTabbingBackward: ({ context }) => context.get("isTabbingBackward"),
      isFirstToggleFocused: ({ context, scope }) => context.get("focusedId") === dom.getFirstEl(scope)?.id,
    },

    actions: {
      setIsTabbingBackward({ context }) {
        context.set("isTabbingBackward", true)
      },
      clearIsTabbingBackward({ context }) {
        context.set("isTabbingBackward", false)
      },
      setClickFocus({ context }) {
        context.set("isClickFocus", true)
      },
      clearClickFocus({ context }) {
        context.set("isClickFocus", false)
      },
      checkIfWithinToolbar({ context, scope }) {
        const closestToolbar = dom.getRootEl(scope)?.closest("[role=toolbar]")
        context.set("isWithinToolbar", !!closestToolbar)
      },
      setFocusedId({ context, event }) {
        context.set("focusedId", event.id)
      },
      clearFocusedId({ context }) {
        context.set("focusedId", null)
      },
      setValue({ context, event, prop }) {
        ensureProps(event, ["value"])
        let next = context.get("value")
        if (isArray(event.value)) {
          next = event.value
        } else if (prop("multiple")) {
          next = addOrRemove(next, event.value)
        } else {
          const isSelected = isEqual(next, [event.value])
          next = isSelected && prop("deselectable") ? [] : [event.value]
        }
        context.set("value", next)
      },
      focusNextToggle({ context, scope, prop }) {
        raf(() => {
          const focusedId = context.get("focusedId")
          if (!focusedId) return
          dom.getNextEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true })
        })
      },
      focusPrevToggle({ context, scope, prop }) {
        raf(() => {
          const focusedId = context.get("focusedId")
          if (!focusedId) return
          dom.getPrevEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true })
        })
      },
      focusFirstToggle({ scope }) {
        raf(() => {
          dom.getFirstEl(scope)?.focus({ preventScroll: true })
        })
      },
      focusLastToggle({ scope }) {
        raf(() => {
          dom.getLastEl(scope)?.focus({ preventScroll: true })
        })
      },
    },
  },
})
