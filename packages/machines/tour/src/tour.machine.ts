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
    return "tour.inactive"
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

  watch({ track, context, action }) {
    track([() => context.get("stepId")], () => {
      queueMicrotask(() => {
        action(["setResolvedTarget", "raiseStepChange", "syncTargetAttrs"])
      })
    })
  },

  effects: ["trackBoundarySize"],

  exit: ["cleanupAll"],

  on: {
    "STEPS.SET": {
      actions: ["setSteps", "validateSteps"],
    },
    "STEP.SET": {
      actions: ["setStep"],
    },
    "STEP.NEXT": {
      actions: ["setNextStep"],
    },
    "STEP.PREV": {
      actions: ["setPrevStep"],
    },
    "STEP.CHANGED": [
      {
        guard: and("isValidStep", "hasResolvedTarget"),
        target: "target.scrolling",
        actions: ["cleanupStepEffect"],
      },
      {
        guard: and("isValidStep", "hasTarget"),
        target: "target.resolving",
        actions: ["cleanupStepEffect"],
      },
      {
        guard: and("isValidStep", "isWaitingStep"),
        target: "step.waiting",
        actions: ["cleanupStepEffect"],
      },
      {
        guard: "isValidStep",
        target: "tour.active",
        actions: ["cleanupStepEffect"],
      },
    ],
    DISMISS: [
      {
        guard: "isLastStep",
        target: "tour.inactive",
        actions: ["cleanupAll", "invokeOnDismiss", "invokeOnComplete", "clearStep"],
      },
      {
        target: "tour.inactive",
        actions: ["cleanupAll", "invokeOnDismiss", "clearStep"],
      },
    ],
    SKIP: {
      target: "tour.inactive",
      actions: ["cleanupAll", "invokeOnSkip", "clearStep"],
    },
  },

  states: {
    "tour.inactive": {
      tags: ["closed"],
      entry: ["validateSteps"],
      on: {
        START: {
          actions: ["setInitialStep", "invokeOnStart"],
        },
      },
    },

    "target.resolving": {
      tags: ["closed"],
      effects: ["waitForTarget", "waitForTargetTimeout"],

      on: {
        "TARGET.NOT_FOUND": {
          target: "tour.inactive",
          actions: ["invokeOnNotFound", "clearStep"],
        },
        "TARGET.RESOLVED": {
          target: "target.scrolling",
          actions: ["setResolvedTarget"],
        },
      },
    },

    "target.scrolling": {
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
          target: "tour.active",
        },
      },
    },

    "step.waiting": {
      tags: ["closed"],
    },

    "tour.active": {
      tags: ["open"],
      effects: ["trapFocus", "trackPlacement", "trackDismissableBranch", "trackInteractOutside", "trackEscapeKeydown"],
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
        node?.scrollIntoView({ behavior: "instant", block: "center", inline: "center" })
      },
      setSteps(params) {
        const { event, context } = params
        context.set("steps", event.value)
      },
      setStep(params) {
        const { event } = params
        const step = event.value
        if (step == null) return

        const manager = new StepManager(params)
        manager.transitionToStep(step)
      },
      clearStep(params) {
        const manager = new StepManager(params)
        manager.clear()
      },
      setInitialStep(params) {
        const { context, event } = params
        const steps = context.get("steps")
        if (steps.length === 0) return

        const manager = new StepManager(params)
        manager.transitionToStep(event.value ?? 0)
      },
      setNextStep(params) {
        const { computed } = params
        const manager = new StepManager(params)
        manager.next(computed("stepIndex"))
      },
      setPrevStep(params) {
        const { computed } = params
        const manager = new StepManager(params)
        manager.prev(computed("stepIndex"))
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
      raiseStepChange({ send }) {
        send({ type: "STEP.CHANGED" })
      },
      setResolvedTarget({ context, event, computed }) {
        const node = event.node ?? computed("step")?.target?.()
        context.set("resolvedTarget", node ?? null)
      },
      syncTargetAttrs(params) {
        const { context } = params
        const targetEl = context.get("resolvedTarget")
        const manager = new StepManager(params)
        manager.syncTarget(targetEl)
      },
      cleanupAll(params) {
        const manager = new StepManager(params)
        manager.cleanupAll()
      },
      cleanupStepEffect(params) {
        const manager = new StepManager(params)
        manager.cleanupStepEffect()
      },
      validateSteps({ context }) {
        // ensure all steps have unique ids
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

      trapFocus({ computed, scope }) {
        const step = computed("step")
        if (step == null) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          escapeDeactivates: false,
          allowOutsideClick: true,
          preventScroll: true,
          returnFocusOnDeactivate: false,
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
// Step Manager
// ============================================================================

/**
 * Manages step transitions, cleanup, and effect execution for the tour machine.
 * Encapsulates all step-related logic in a single cohesive unit.
 */
class StepManager {
  constructor(private params: Params<TourSchema>) {}

  /**
   * Transition to a step by id or index
   */
  transitionToStep(step: string | number) {
    const steps = this.params.context.get("steps")
    const idx = isString(step) ? findStepIndex(steps, step) : step
    this.transitionTo(idx)
  }

  /**
   * Transition to the next step from the given index
   */
  next(currentIndex: number) {
    const steps = this.params.context.get("steps")
    const idx = nextIndex(steps, currentIndex)
    this.transitionTo(idx)
  }

  /**
   * Transition to the previous step from the given index
   */
  prev(currentIndex: number) {
    const steps = this.params.context.get("steps")
    const idx = prevIndex(steps, currentIndex)
    this.transitionTo(idx)
  }

  /**
   * Clear the current step and reset tour state
   */
  clear() {
    const { context } = this.params
    context.set("targetRect", { width: 0, height: 0, x: 0, y: 0 })
    context.set("resolvedTarget", null)
    this.transitionTo(-1)
  }

  /**
   * Cleanup all resources including effects, target attributes, and resolved target.
   * Use when completely tearing down the tour or transitioning between steps.
   */
  cleanupAll() {
    const { refs, context } = this.params

    refs.get("_targetCleanup")?.()
    refs.set("_targetCleanup", undefined)
    refs.set("_prevTarget", undefined)

    refs.get("_effectCleanup")?.()
    refs.set("_effectCleanup", undefined)

    // Clear resolved target to prevent stale DOM references
    context.set("resolvedTarget", null)
  }

  /**
   * Cleanup only the step effect cleanup function.
   * Skips cleanup if an effect is currently running.
   */
  cleanupStepEffect() {
    const { refs } = this.params

    // Don't cleanup if we're currently running an effect
    if (refs.get("_runningEffect")) {
      return
    }

    refs.get("_effectCleanup")?.()
    refs.set("_effectCleanup", undefined)
  }

  /**
   * Sync target element attributes (inert, data-tour-highlighted).
   * Handles cleanup of previous target and applies attributes to new target.
   */
  syncTarget(targetEl: HTMLElement | null) {
    const { refs, prop } = this.params
    const prevTarget = refs.get("_prevTarget")

    // Only cleanup if target has changed
    if (targetEl !== prevTarget) {
      refs.get("_targetCleanup")?.()
      refs.set("_targetCleanup", undefined)
    }

    if (!targetEl) {
      refs.set("_prevTarget", null)
      return
    }

    // Skip if same target (attributes already applied)
    if (targetEl === prevTarget) {
      return
    }

    // Apply attributes to new target
    if (prop("preventInteraction")) targetEl.inert = true
    targetEl.setAttribute("data-tour-highlighted", "")

    // Store cleanup and current target
    refs.set("_targetCleanup", () => {
      if (prop("preventInteraction")) targetEl.inert = false
      targetEl.removeAttribute("data-tour-highlighted")
    })
    refs.set("_prevTarget", targetEl)
  }

  /**
   * Transition to a step by index
   */
  transitionTo(idx: number) {
    const { context, refs } = this.params
    const steps = context.get("steps")
    const step = steps[idx]

    if (!step) {
      context.set("stepId", null)
      return
    }

    if (isEqual(context.get("stepId"), step.id)) {
      // Clear flag if somehow left set (defensive programming)
      refs.set("_runningEffect", false)
      return
    }

    this.cleanup()

    const utilities = this.createUtilities(step, idx)

    if (step.effect) {
      this.executeEffect(step, utilities)
    } else {
      utilities.show()
    }
  }

  /**
   * Clean up previous step effects and target attributes
   */
  private cleanup() {
    const { refs } = this.params

    refs.get("_effectCleanup")?.()
    refs.set("_effectCleanup", undefined)
    refs.get("_targetCleanup")?.()
    refs.set("_targetCleanup", undefined)
  }

  /**
   * Create utility functions for step effects
   */
  private createUtilities(step: StepDetails, idx: number): StepEffectArgs {
    const { context, computed, prop } = this.params
    const steps = context.get("steps")

    return {
      show: () => {
        context.set("stepId", step.id)
      },
      update: (data) => {
        context.set("steps", (prev) => prev.map((s, i) => (i === idx ? { ...s, ...data } : s)))
      },
      next: () => {
        const nextIdx = nextIndex(steps, computed("stepIndex"))
        this.transitionTo(nextIdx)
      },
      goto: (id: string) => {
        const targetIdx = findStepIndex(steps, id)
        if (targetIdx === -1) {
          warn(`[zag-js/tour] Step with id "${id}" not found`)
          return
        }
        this.transitionTo(targetIdx)
      },
      dismiss: () => {
        context.set("stepId", null)
        prop("onStatusChange")?.({ status: "dismissed", stepId: null, stepIndex: -1 })
      },
      target: step.target,
    }
  }

  /**
   * Execute a step's effect function
   */
  private executeEffect(step: StepDetails, utilities: StepEffectArgs) {
    const { refs } = this.params

    refs.set("_runningEffect", true)

    let cleanup: StepEffectCleanup | undefined

    try {
      cleanup = step.effect!(utilities)
    } catch (error) {
      refs.set("_runningEffect", false)
      console.error(error)
      return
    }

    refs.set("_effectCleanup", cleanup)

    // For wait-type steps, automatically set the stepId so the state machine
    // can transition to step.waiting state, but don't call show() from the effect
    if (isWaitStep(step)) {
      utilities.show()
    }

    // Clear the flag after all microtasks (including watcher) have completed
    // Use double queueMicrotask for deterministic timing
    queueMicrotask(() => {
      queueMicrotask(() => {
        refs.set("_runningEffect", false)
      })
    })
  }
}
