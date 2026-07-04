import { createGuards, createMachine } from "@zag-js/core"
import { observeChildren, raf } from "@zag-js/dom-query"
import { addOrRemove, ensureProps, isArray, isEqual } from "@zag-js/utils"
import * as dom from "./toggle-group.dom"
import type { ToggleGroupSchema } from "./toggle-group.types"

const { not } = createGuards<ToggleGroupSchema>()

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

  effects: ["trackItemMutations"],

  context({ prop, bindable }) {
    return {
      value: bindable<string[]>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      focusedValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      hasInteracted: bindable<boolean>(() => ({
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
    "ROOT.BLUR": {
      actions: ["clearClickFocus"],
    },
    "ITEMS.CHANGE": {
      actions: ["syncHasInteracted"],
    },
  },

  states: {
    // Active only before the first successful focus — the root then permanently cedes its tabindex.
    idle: {
      on: {
        "ROOT.FOCUS": {
          target: "focused",
          guard: not("isClickFocus"),
          actions: ["focusFirstToggle", "setHasInteracted", "clearClickFocus"],
        },
        "TOGGLE.FOCUS": {
          target: "focused",
          actions: ["setFocusedValue", "setHasInteracted"],
        },
      },
    },

    focused: {
      on: {
        "ROOT.FOCUS": {
          guard: not("isClickFocus"),
          actions: ["focusFirstToggle", "clearClickFocus"],
        },
        "TOGGLE.FOCUS": {
          actions: ["setFocusedValue"],
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
      },
    },
  },

  implementations: {
    guards: {
      isClickFocus: ({ context }) => context.get("isClickFocus"),
    },

    actions: {
      setClickFocus({ context }) {
        context.set("isClickFocus", true)
      },
      clearClickFocus({ context }) {
        context.set("isClickFocus", false)
      },
      setHasInteracted({ context }) {
        context.set("hasInteracted", true)
      },
      syncHasInteracted({ context, scope }) {
        if (!context.get("hasInteracted")) return
        if (dom.hasFocusableItem(scope)) return
        context.set("hasInteracted", false)
        context.set("focusedValue", null)
      },
      checkIfWithinToolbar({ context, scope }) {
        const closestToolbar = dom.getRootEl(scope)?.closest("[role=toolbar]")
        context.set("isWithinToolbar", !!closestToolbar)
      },
      setFocusedValue({ context, event }) {
        context.set("focusedValue", event.value)
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
      focusNextToggle({ context, scope, computed }) {
        raf(() => {
          const focusedValue = context.get("focusedValue")
          if (!focusedValue) return
          const id = dom.getItemId(scope, focusedValue)
          dom.getNextEl(scope, id, computed("currentLoopFocus"))?.focus({ preventScroll: true })
        })
      },
      focusPrevToggle({ context, scope, computed }) {
        raf(() => {
          const focusedValue = context.get("focusedValue")
          if (!focusedValue) return
          const id = dom.getItemId(scope, focusedValue)
          dom.getPrevEl(scope, id, computed("currentLoopFocus"))?.focus({ preventScroll: true })
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

    effects: {
      trackItemMutations({ scope, send }) {
        const root = dom.getRootEl(scope)
        if (!root) return
        return observeChildren(root, {
          attributes: true,
          attributeFilter: ["disabled", "data-disabled"],
          callback() {
            send({ type: "ITEMS.CHANGE" })
          },
        })
      },
    },
  },
})
