import { setup } from "@zag-js/core"
import { observeChildren, trackFieldsetDisabled } from "@zag-js/dom-query"
import * as dom from "./fieldset.dom"
import type { FieldsetSchema } from "./fieldset.types"

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
        return observeChildren(() => dom.getRootEl(scope), { defer: true, callback: sync })
      },

      trackAncestorDisabled({ context, scope }) {
        return trackFieldsetDisabled(dom.getRootEl(scope)?.parentElement, (disabled) => {
          context.set("ancestorDisabled", disabled)
        })
      },
    },
  },
})
