import { createMachine, memo, type Params } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { isEqual, warn } from "@zag-js/utils"
import * as dom from "./steps.dom"
import { COMPLETE, type StepsSchema } from "./steps.types"
import {
  findEffectiveIndex,
  findItem,
  findItemIndex,
  findNearestNavigable,
  getEffectiveItems,
  getFirstNavigableValue,
  getNextResult,
  getPrevResult,
  getReachability,
  hashItems,
  isItemDisabled,
  validateItems,
  type NavContext,
  type NavResult,
} from "./utils"

type StepsParams = Params<StepsSchema>

const toNavContext = ({ context, prop }: Pick<StepsParams, "context" | "prop">): NavContext => ({
  items: prop("items"),
  value: context.get("value"),
  completedValues: context.get("completedValues"),
  linear: prop("linear"),
})

export const machine = createMachine<StepsSchema>({
  props({ props }) {
    return {
      items: [],
      linear: false,
      orientation: "horizontal",
      defaultCompletedValues: [],
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable<string | null>(() => ({
        defaultValue: prop("defaultValue") ?? getFirstNavigableValue(prop("items")),
        value: prop("value"),
        onChange(value, prev) {
          prop("onValueChange")?.({
            value,
            index: findEffectiveIndex(prop("items"), value),
            previousValue: prev ?? null,
          })
        },
      })),
      completedValues: bindable<string[]>(() => ({
        defaultValue: prop("defaultCompletedValues"),
        value: prop("completedValues"),
        isEqual,
        onChange(completedValues) {
          prop("onCompletedChange")?.({ completedValues })
        },
      })),
    }
  },

  refs() {
    return { lastPosition: null }
  },

  computed: {
    effectiveItems: memo(
      ({ prop }) => [prop("items")],
      ([items]) => getEffectiveItems(items),
    ),
  },

  initialState() {
    return "idle"
  },

  entry: ["validateItems", "syncCurrentValue", "rememberPosition"],

  watch({ track, action, prop, context }) {
    track([() => hashItems(prop("items"))], () => {
      // Re-track after a reorder that keeps the current value
      action(["validateItems", "syncCurrentValue", "rememberPosition"])
    })
    track([() => context.get("value")], () => {
      action(["rememberPosition"])
    })
  },

  states: {
    idle: {
      on: {
        "VALUE.SET": { actions: ["goToValue"] },
        "STEP.NEXT": { actions: ["goToNextStep"] },
        "STEP.SKIP": { actions: ["skipStep"] },
        "STEP.PREV": { actions: ["goToPreviousStep"] },
        "STEP.RESET": { actions: ["resetStep"] },
        "COMPLETED.SET": { actions: ["setCompletedValues"] },
      },
    },
  },

  implementations: {
    actions: {
      validateItems({ prop }) {
        validateItems(prop("items"))
      },

      goToValue(params) {
        const ctx = toNavContext(params)
        const targetValue: string = params.event.value

        if (targetValue === ctx.value) return

        if (targetValue !== COMPLETE && findItem(ctx.items, targetValue) == null) {
          warn(`[zag-js/steps] no item with value "${targetValue}"`)
          return
        }

        const reachability = getReachability(ctx, targetValue)
        if (!reachability.ok) {
          emitBlocked(params, { ...reachability, targetValue })
          return
        }

        navigate(params, { ok: true, value: targetValue, completedValues: ctx.completedValues })
      },

      goToNextStep(params) {
        navigate(params, getNextResult(toNavContext(params)))
      },

      skipStep(params) {
        navigate(params, getNextResult(toNavContext(params), { skip: true }))
      },

      goToPreviousStep(params) {
        const ctx = toNavContext(params)
        navigate(params, getPrevResult(ctx, findItemIndex(ctx.items, ctx.value)))
      },

      resetStep({ context, prop }) {
        context.set("completedValues", [])
        context.set("value", getFirstNavigableValue(prop("items")))
      },

      // Where to resume when the current step drops out of the flow
      rememberPosition({ context, prop, refs }) {
        const items = prop("items")
        const index = findItemIndex(items, context.get("value"))
        // Skip `COMPLETE`, which resolves to `items.length`
        if (index !== -1 && index < items.length) refs.set("lastPosition", index)
      },

      setCompletedValues({ context, event }) {
        context.set("completedValues", event.value)
      },

      syncCurrentValue(params) {
        const { context, prop, refs } = params
        const items = prop("items")
        const value = context.get("value")

        if (items.length === 0) {
          if (value != null && prop("value") === undefined) context.set("value", null)
          return
        }

        // A position, not a claim about history, so it is never undone here
        if (value === COMPLETE) return

        if (getEffectiveItems(items).length === 0) {
          warn(`[zag-js/steps] every item is disabled, so there is nothing to navigate to`)
          if (value != null && prop("value") === undefined) context.set("value", null)
          return
        }

        const item = findItem(items, value)
        if (item != null && !isItemDisabled(item)) return

        // Retargeting a controlled value would loop through onValueChange
        if (prop("value") !== undefined) {
          if (value != null) warn(`[zag-js/steps] the controlled value "${value}" is not navigable`)
          return
        }

        // Every remaining step is locked, hence completed, so the flow is done
        const replacement = findNearestNavigable(toNavContext(params), refs.get("lastPosition") ?? 0) ?? COMPLETE
        if (value != null) warn(`[zag-js/steps] value "${value}" is not navigable; moving to "${replacement}"`)
        context.set("value", replacement)
      },
    },
  },
})

function navigate(params: StepsParams, result: NavResult | null) {
  if (result == null) return

  if (!result.ok) {
    emitBlocked(params, result)
    return
  }

  const { context, prop, scope } = params
  context.set("completedValues", result.completedValues)
  context.set("value", result.value)
  if (result.value !== COMPLETE) return

  // Pass the result: React has not flushed the context write yet
  prop("onComplete")?.({ completedValues: result.completedValues })
  // Next is now disabled, so focus would otherwise drop to the body
  raf(() => scope.getById(dom.getContentId(scope, COMPLETE))?.focus())
}

function emitBlocked(params: StepsParams, result: Extract<NavResult, { ok: false }>) {
  const { prop, context } = params
  const value = context.get("value")
  prop("onNavigationBlocked")?.({
    value,
    index: findEffectiveIndex(prop("items"), value),
    targetValue: result.targetValue,
    reason: result.reason,
    blockedBy: result.blockedBy,
  })
}
