import { createGuards, createMachine, type Params } from "@zag-js/core"
import { trackDismissableBranch } from "@zag-js/dismissable"
import { contains, isHTMLElement } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { isEqual, isString, nextIndex, prevIndex, warn } from "@zag-js/utils"
import * as dom from "./tour.dom"
import type { StepDetails, StepEffectArgs, StepEffectCleanup, StepPlacement, TourSchema } from "./tour.types"
import { isEventInRect, offset, type Rect, type Size } from "./utils/rect"
import {
  findStep,
  findStepIndex,
  getEffectiveSteps,
  getProgress,
  isDialogStep,
  isTooltipStep,
  isWaitStep,
} from "./utils/step"

const { and } = createGuards<TourSchema>()

export const machine = createMachine<TourSchema>({
  props({ props }) {
    return {
      preventInteraction: false,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      keyboardNavigation: true,
      spotlightOffset: { x: 10, y: 10 },
      spotlightRadius: 4,
      ...props,
      translations: {
        nextStep: "next step",
        prevStep: "previous step",
        close: "close tour",
        progressText: ({ current, total }) => `${current + 1} of ${total}`,
        skip: "skip tour",
        ...props.translations,
      },
    }
  },

  initialState() {
    return "tourInactive"
  },

  context({ prop, bindable, getContext }) {
    return {
      steps: bindable<StepDetails[]>(() => ({
        defaultValue: prop("steps") ?? [],
        onChange(value) {
          prop("onStepsChange")?.({ steps: value })
        },
      })),
      stepId: bindable<string | null>(() => ({
        defaultValue: prop("stepId"),
        sync: true,
        onChange(value) {
          const context = getContext()
          const steps = context.get("steps")
          const stepIndex = findStepIndex(steps, value)
          const progress = getProgress(steps, stepIndex)
          const complete = stepIndex == steps.length - 1
          prop("onStepChange")?.({ stepId: value, stepIndex, totalSteps: steps.length, complete, progress })
        },
      })),
      resolvedTarget: bindable<HTMLElement | null>(() => ({
        sync: true,
        defaultValue: null,
      })),
      targetRect: bindable<Rect>(() => ({
        defaultValue: { width: 0, height: 0, x: 0, y: 0 },
      })),
      boundarySize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      currentPlacement: bindable<StepPlacement | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  computed: {
    stepIndex: ({ context }) => findStepIndex(context.get("steps"), context.get("stepId")),
    step: ({ context }) => findStep(context.get("steps"), context.get("stepId")),
    hasNextStep: ({ context, computed }) => computed("stepIndex") < context.get("steps").length - 1,
    hasPrevStep: ({ computed }) => computed("stepIndex") > 0,
    isFirstStep: ({ computed }) => computed("stepIndex") === 0,
    isLastStep: ({ context, computed }) => computed("stepIndex") === context.get("steps").length - 1,
    progress: ({ context, computed }) => {
      const effectiveLength = getEffectiveSteps(context.get("steps")).length
      return (computed("stepIndex") + 1) / effectiveLength
    },
  },

  // Watch for external stepId changes (via sync: true bindable).
  // Internal changes set _internalChange flag to skip this.
  watch({ track, context, refs, send }) {
    track([() => context.get("stepId")], () => {
      if (refs.get("_internalChange")) {
        refs.set("_internalChange", false)
        return
      }
      // External change: resolve target and route
      const step = findStep(context.get("steps"), context.get("stepId"))
      context.set("resolvedTarget", step?.target?.() ?? null)
      syncTargetAttrsFromContext({ context, refs })
      queueMicrotask(() => {
        send({ type: "STEP.CHANGED" })
      })
    })
  },

  effects: ["trackBoundarySize"],

  exit: ["cleanupAll"],

  on: {
    "STEPS.SET": {
      actions: ["setSteps", "validateSteps"],
    },
    // External step change (from watch): cleans up previous effect
    "STEP.CHANGED": [
      {
        guard: and("isValidStep", "hasResolvedTarget"),
        target: "running.scrolling",
        reenter: true,
        actions: ["cleanupStepEffect"],
      },
      {
        guard: and("isValidStep", "hasTarget"),
        target: "running.resolving",
        reenter: true,
        actions: ["cleanupStepEffect"],
      },
      {
        guard: and("isValidStep", "isWaitingStep"),
        target: "running.waiting",
        reenter: true,
        actions: ["cleanupStepEffect"],
      },
      {
        guard: "isValidStep",
        target: "running.active",
        reenter: true,
        actions: ["cleanupStepEffect"],
      },
    ],
    // Internal step change (from performStepTransition/show): no effect cleanup
    // because performStepTransition already cleaned up the previous effect
    "STEP.ROUTE": [
      {
        guard: and("isValidStep", "hasResolvedTarget"),
        target: "running.scrolling",
        reenter: true,
      },
      {
        guard: and("isValidStep", "hasTarget"),
        target: "running.resolving",
        reenter: true,
      },
      {
        guard: and("isValidStep", "isWaitingStep"),
        target: "running.waiting",
        reenter: true,
      },
      {
        guard: "isValidStep",
        target: "running.active",
        reenter: true,
      },
    ],
  },

  states: {
    tourInactive: {
      tags: ["closed"],
      entry: ["validateSteps"],
      on: {
        START: {
          actions: ["setInitialStep", "invokeOnStart"],
        },
      },
    },

    running: {
      initial: "resolving",

      on: {
        "STEP.SET": {
          actions: ["setStep"],
        },
        "STEP.NEXT": {
          actions: ["setNextStep"],
        },
        "STEP.PREV": {
          actions: ["setPrevStep"],
        },
        DISMISS: [
          {
            guard: "isLastStep",
            target: "tourInactive",
            actions: ["cleanupAll", "invokeOnDismiss", "invokeOnComplete", "clearStep"],
          },
          {
            target: "tourInactive",
            actions: ["cleanupAll", "invokeOnDismiss", "clearStep"],
          },
        ],
        SKIP: {
          target: "tourInactive",
          actions: ["cleanupAll", "invokeOnSkip", "clearStep"],
        },
      },

      states: {
        resolving: {
          tags: ["closed"],
          effects: ["waitForTarget", "waitForTargetTimeout"],

          on: {
            "TARGET.NOT_FOUND": {
              target: "tourInactive",
              actions: ["invokeOnNotFound", "clearStep"],
            },
            "TARGET.RESOLVED": {
              target: "scrolling",
              actions: ["setResolvedTarget"],
            },
          },
        },

        scrolling: {
          tags: ["open"],
          entry: ["scrollToTarget"],
          effects: [
            "waitForScrollEnd",
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown",
          ],
          on: {
            "SCROLL.END": {
              target: "active",
            },
          },
        },

        waiting: {
          tags: ["closed"],
        },

        active: {
          tags: ["open"],
          effects: [
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown",
          ],
        },
      },
    },
  },

  implementations: {
    guards: {
      isLastStep: ({ computed, context }) => computed("stepIndex") === context.get("steps").length - 1,
      isValidStep: ({ context }) => context.get("stepId") != null,
      hasTarget: ({ computed }) => computed("step")?.target != null,
      hasResolvedTarget: ({ context }) => context.get("resolvedTarget") != null,
      isWaitingStep: ({ computed }) => computed("step")?.type === "wait",
    },

    actions: {
      scrollToTarget({ context }) {
        const node = context.get("resolvedTarget")
        node?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" })
      },
      setSteps(params) {
        const { event, context } = params
        context.set("steps", event.value)
      },
      setStep(params) {
        const { event } = params
        if (event.value == null) return
        const steps = params.context.get("steps")
        const idx = isString(event.value) ? findStepIndex(steps, event.value) : event.value
        performStepTransition(params, idx)
      },
      clearStep({ context, refs }) {
        refs.get("_targetCleanup")?.()
        refs.set("_targetCleanup", undefined)

        context.set("targetRect", { width: 0, height: 0, x: 0, y: 0 })
        context.set("resolvedTarget", null)

        refs.set("_internalChange", true)
        context.set("stepId", null)
      },
      setInitialStep(params) {
        const { context, event } = params
        const steps = context.get("steps")
        if (steps.length === 0) return
        const idx = isString(event.value) ? findStepIndex(steps, event.value) : (event.value ?? 0)
        performStepTransition(params, idx)
      },
      setNextStep(params) {
        const steps = params.context.get("steps")
        const idx = nextIndex(steps, params.computed("stepIndex"))
        performStepTransition(params, idx)
      },
      setPrevStep(params) {
        const steps = params.context.get("steps")
        const idx = prevIndex(steps, params.computed("stepIndex"))
        performStepTransition(params, idx)
      },
      invokeOnStart({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "started",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex"),
        })
      },
      invokeOnDismiss({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "dismissed",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex"),
        })
      },
      invokeOnComplete({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "completed",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex"),
        })
      },
      invokeOnSkip({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "skipped",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex"),
        })
      },
      invokeOnNotFound({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "not-found",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex"),
        })
      },
      setResolvedTarget({ context, event, computed }) {
        const node = event.node ?? computed("step")?.target?.()
        context.set("resolvedTarget", node ?? null)
      },
      cleanupAll({ refs }) {
        refs.get("_targetCleanup")?.()
        refs.set("_targetCleanup", undefined)
        refs.set("_prevTarget", undefined)

        refs.get("_effectCleanup")?.()
        refs.set("_effectCleanup", undefined)
      },
      cleanupStepEffect({ refs }) {
        refs.get("_effectCleanup")?.()
        refs.set("_effectCleanup", undefined)
      },
      validateSteps({ context }) {
        const ids = new Set()

        context.get("steps").forEach((step) => {
          if (ids.has(step.id)) {
            throw new Error(`[zag-js/tour] Duplicate step id: ${step.id}`)
          }

          if (step.target == null && step.type == null) {
            throw new Error(`[zag-js/tour] Step ${step.id} has no target or type. At least one of those is required.`)
          }

          ids.add(step.id)
        })
      },
    },

    effects: {
      waitForScrollEnd({ send }) {
        const id = setTimeout(() => {
          send({ type: "SCROLL.END" })
        }, 100)
        return () => clearTimeout(id)
      },

      waitForTargetTimeout({ send }) {
        const id = setTimeout(() => {
          send({ type: "TARGET.NOT_FOUND" })
        }, 3000)
        return () => clearTimeout(id)
      },

      waitForTarget({ scope, computed, send }) {
        const step = computed("step")
        if (!step) return

        const targetEl = step.target

        const win = scope.getWin()
        const rootNode = scope.getRootNode()

        const observer = new win.MutationObserver(() => {
          const node = targetEl?.()
          if (node) {
            send({ type: "TARGET.RESOLVED", node })
            observer.disconnect()
          }
        })

        observer.observe(rootNode, {
          childList: true,
          subtree: true,
          characterData: true,
        })

        return () => {
          observer.disconnect()
        }
      },

      trackBoundarySize({ context, scope }) {
        const win = scope.getWin()
        const doc = scope.getDoc()

        const onResize = () => {
          const width = visualViewport?.width ?? win.innerWidth
          const height = doc.documentElement.scrollHeight
          context.set("boundarySize", { width, height })
        }

        onResize()

        const viewport = win.visualViewport ?? win
        viewport.addEventListener("resize", onResize)
        return () => viewport.removeEventListener("resize", onResize)
      },

      trackEscapeKeydown({ scope, send, prop }) {
        if (!prop("closeOnEscape")) return
        const doc = scope.getDoc()

        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            send({ type: "DISMISS", src: "esc" })
          }
        }

        doc.addEventListener("keydown", onKeyDown, true)
        return () => {
          doc.removeEventListener("keydown", onKeyDown, true)
        }
      },

      trackInteractOutside({ context, computed, scope, send, prop }) {
        const step = computed("step")
        if (step == null) return
        const contentEl = () => dom.getContentEl(scope)

        return trackInteractOutside(contentEl, {
          defer: true,
          exclude(target) {
            return contains(step.target?.(), target)
          },
          onFocusOutside(event) {
            prop("onFocusOutside")?.(event)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
          },
          onPointerDownOutside(event) {
            prop("onPointerDownOutside")?.(event)

            const isWithin = isEventInRect(context.get("targetRect"), event.detail.originalEvent)

            if (isWithin) {
              event.preventDefault()
              return
            }

            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
          },
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            send({ type: "DISMISS", src: "interact-outside" })
          },
        })
      },

      trackDismissableBranch({ computed, scope }) {
        const step = computed("step")
        if (step == null) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableBranch(contentEl, { defer: true })
      },

      trapFocus({ computed, scope, context }) {
        const step = computed("step")
        if (step == null) return
        const contentEl = () => dom.getContentEl(scope)
        const targetEl = () => context.get("resolvedTarget")
        return trapFocus([contentEl, targetEl], {
          escapeDeactivates: false,
          allowOutsideClick: true,
          preventScroll: true,
          returnFocusOnDeactivate: false,
          getShadowRoot: true,
        })
      },

      trackPlacement({ context, computed, scope, prop }) {
        const step = computed("step")
        if (step == null) return

        context.set("currentPlacement", step.placement ?? "bottom")

        if (isDialogStep(step)) {
          return dom.syncZIndex(scope)
        }

        if (!isTooltipStep(step)) {
          return
        }

        const positionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(context.get("resolvedTarget"), positionerEl, {
          defer: true,
          placement: step.placement ?? "bottom",
          strategy: "absolute",
          gutter: 10,
          offset: step.offset,
          restoreStyles: true,
          getAnchorRect(el) {
            if (!isHTMLElement(el)) return null
            const rect = el.getBoundingClientRect()
            return offset(rect, prop("spotlightOffset"))
          },
          onComplete(data) {
            const { rects } = data.middlewareData
            context.set("currentPlacement", data.placement)
            context.set("targetRect", rects.reference)
          },
        })
      },
    },
  },
})

// ============================================================================
// Step transition helpers
// ============================================================================

/**
 * Shared logic for syncing target element attributes.
 * Used by both actions and the watch callback.
 */
function syncTargetAttrsFromContext(params: {
  context: Params<TourSchema>["context"]
  refs: Params<TourSchema>["refs"]
  prop?: Params<TourSchema>["prop"]
}) {
  const { context, refs, prop } = params
  const targetEl = context.get("resolvedTarget")
  const prevTarget = refs.get("_prevTarget")

  if (targetEl !== prevTarget) {
    refs.get("_targetCleanup")?.()
    refs.set("_targetCleanup", undefined)
  }

  if (!targetEl) {
    refs.set("_prevTarget", null)
    return
  }

  if (targetEl === prevTarget) return

  if (prop?.("preventInteraction")) targetEl.inert = true
  targetEl.setAttribute("data-tour-highlighted", "")

  refs.set("_targetCleanup", () => {
    if (prop?.("preventInteraction")) targetEl.inert = false
    targetEl.removeAttribute("data-tour-highlighted")
  })
  refs.set("_prevTarget", targetEl)
}

function performStepTransition(params: Params<TourSchema>, idx: number) {
  const { context, refs, send } = params
  const steps = context.get("steps")
  const step = steps[idx]

  if (!step) {
    refs.set("_internalChange", true)
    context.set("stepId", null)
    return
  }

  if (isEqual(context.get("stepId"), step.id)) {
    return
  }

  // Cleanup previous step effects and target attributes
  refs.get("_effectCleanup")?.()
  refs.set("_effectCleanup", undefined)

  refs.get("_targetCleanup")?.()
  refs.set("_targetCleanup", undefined)

  if (step.effect) {
    executeStepEffect(params, step, idx)
    return
  }

  // Resolve target, set context, sync attrs, then route via STEP.ROUTE
  const resolvedTarget = step.target?.() ?? null
  context.set("resolvedTarget", resolvedTarget)
  refs.set("_internalChange", true)
  context.set("stepId", step.id)
  syncTargetAttrsFromContext(params)
  send({ type: "STEP.ROUTE" })
}

function createEffectUtilities(params: Params<TourSchema>, step: StepDetails, idx: number): StepEffectArgs {
  const { context, computed, refs, send, prop } = params
  const steps = context.get("steps")

  return {
    show: () => {
      // Resolve target and route via STEP.ROUTE (no effect cleanup)
      const resolvedTarget = step.target?.() ?? null
      context.set("resolvedTarget", resolvedTarget)
      refs.set("_internalChange", true)
      context.set("stepId", step.id)
      syncTargetAttrsFromContext(params)
      send({ type: "STEP.ROUTE" })
    },
    update: (data) => {
      context.set("steps", (prev) => prev.map((s, i) => (i === idx ? { ...s, ...data } : s)))
    },
    next: () => {
      const nextIdx = nextIndex(steps, computed("stepIndex"))
      performStepTransition(params, nextIdx)
    },
    goto: (id: string) => {
      const targetIdx = findStepIndex(steps, id)
      if (targetIdx === -1) {
        warn(`[zag-js/tour] Step with id "${id}" not found`)
        return
      }
      performStepTransition(params, targetIdx)
    },
    dismiss: () => {
      refs.set("_internalChange", true)
      context.set("stepId", null)
      prop("onStatusChange")?.({ status: "dismissed", stepId: null, stepIndex: -1 })
    },
    target: step.target,
  }
}

function executeStepEffect(params: Params<TourSchema>, step: StepDetails, idx: number) {
  const { refs } = params

  const utilities = createEffectUtilities(params, step, idx)

  let cleanup: StepEffectCleanup | undefined

  try {
    cleanup = step.effect!(utilities)
  } catch (error) {
    console.error(error)
    return
  }

  refs.set("_effectCleanup", cleanup)

  if (isWaitStep(step)) {
    utilities.show()
  }
}
