import { setup } from "@zag-js/core"
import { trackFieldsetDisabled, whenNode } from "@zag-js/dom-query"
import { createSharedMutationObserver } from "@zag-js/dom-query/observe"
import * as dom from "./fieldset.dom"
import type { FieldsetSchema } from "./fieldset.types"

const partsObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true, subtree: true })

const { createMachine } = setup<FieldsetSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      dir: "ltr",
      disabled: false,
      invalid: false,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ bindable }) {
    return {
      hasErrorText: bindable<boolean>(() => ({ defaultValue: false })),
      hasHelperText: bindable<boolean>(() => ({ defaultValue: false })),
      hasLegend: bindable<boolean>(() => ({ defaultValue: false })),
      ancestorDisabled: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  computed: {
    disabled: ({ prop, context }) => !!prop("disabled") || context.get("ancestorDisabled"),
  },

  effects: ["trackTextParts", "trackAncestorDisabled"],

  states: {
    idle: {},
  },

  implementations: {
    effects: {
      trackTextParts({ context, scope }) {
        const sync = () => {
          context.set("hasErrorText", !!scope.getById(dom.getErrorTextId(scope)))
          context.set("hasHelperText", !!scope.getById(dom.getHelperTextId(scope)))
          context.set("hasLegend", !!scope.getById(dom.getLegendId(scope)))
        }
        sync()
        const getRootEl = () => {
          sync()
          return dom.getRootEl(scope)
        }
        return whenNode(getRootEl, (el) => partsObserver.observe(el, sync), { defer: true })
      },

      trackAncestorDisabled({ context, scope }) {
        return trackFieldsetDisabled(dom.getRootEl(scope)?.parentElement, (disabled) => {
          context.set("ancestorDisabled", disabled)
        })
      },
    },
  },
})
