import { createGuards, createMachine, type Params, type Scope } from "@zag-js/core"
import { trackDismissableBranch } from "@zag-js/dismissable"
import { contains, getComputedStyle, isHTMLElement, raf } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { isEqual, isString, nextIndex, prevIndex } from "@zag-js/utils"
import * as dom from "./tour.dom"
import type { StepBaseDetails, StepDetails, StepPlacement, TourSchema } from "./tour.types"
import { isEventInRect, offset, type Rect, type Size } from "./utils/rect"
import { findStep, findStepIndex, isDialogStep, isTooltipStep } from "./utils/step"

const { and } = createGuards<TourSchema>()

const getEffectiveSteps = (steps: StepDetails[]) => steps.filter((step) => step.type !== "wait")
const getProgress = (steps: StepDetails[], stepIndex: number) => {
  const effectiveLength = getEffectiveSteps(steps).length
  return (stepIndex + 1) / effectiveLength
}

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

  exit: ["cleanupRefs"],

  on: {
    "STEPS.SET": {
      actions: ["setSteps"],
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
        actions: ["cleanupRefs"],
      },
      {
        guard: and("isValidStep", "hasTarget"),
        target: "target.resolving",
        actions: ["cleanupRefs"],
      },
      {
        guard: and("isValidStep", "isWaitingStep"),
        target: "step.waiting",
        actions: ["cleanupRefs"],
      },
      {
        guard: "isValidStep",
        target: "tour.active",
        actions: ["cleanupRefs"],
      },
    ],
    DISMISS: [
      {
        guard: "isLastStep",
        target: "tour.inactive",
        actions: ["invokeOnDismiss", "invokeOnComplete", "clearStep"],
      },
      {
        target: "tour.inactive",
        actions: ["invokeOnDismiss", "clearStep"],
      },
    ],
  },

  states: {
    "tour.inactive": {
      tags: ["closed"],
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
      setStep(params) {
        const { event, context } = params
        const steps = context.get("steps")

        let step: string | number | undefined = event.value
        if (step == null) return

        setStep(params, isString(step) ? findStepIndex(steps, step) : step)
      },
      clearStep(params) {
        const { context } = params
        context.set("targetRect", { width: 0, height: 0, x: 0, y: 0 })
        setStep(params, -1)
      },
      setInitialStep(params) {
        const { context, event } = params
        const steps = context.get("steps")
        if (steps.length === 0) return

        if (isString(event.value)) {
          const idx = findStepIndex(steps, event.value)
          setStep(params, idx)
          return
        }

        setStep(params, 0)
      },
      setNextStep(params) {
        const { context, computed } = params
        const steps = context.get("steps")
        const idx = nextIndex(steps, computed("stepIndex"))
        setStep(params, idx)
      },
      setPrevStep(params) {
        const { context, computed } = params
        const steps = context.get("steps")
        const idx = prevIndex(steps, computed("stepIndex"))
        setStep(params, idx)
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
      syncTargetAttrs({ context, refs, prop }) {
        refs.get("_targetCleanup")?.()
        refs.set("_targetCleanup", undefined)

        const targetEl = context.get("resolvedTarget")
        if (!targetEl) return

        if (prop("preventInteraction")) targetEl.inert = true
        targetEl.setAttribute("data-tour-highlighted", "")

        refs.set("_targetCleanup", () => {
          if (prop("preventInteraction")) targetEl.inert = false
          targetEl.removeAttribute("data-tour-highlighted")
        })
      },
      cleanupRefs({ refs }) {
        refs.get("_targetCleanup")?.()
        refs.set("_targetCleanup", undefined)

        refs.get("_effectCleanup")?.()
        refs.set("_effectCleanup", undefined)
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
        return trackDismissableBranch(contentEl, { defer: !contentEl() })
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
          return syncZIndex(scope)
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

function syncZIndex(scope: Scope) {
  return raf(() => {
    // sync z-index of positioner with content
    const contentEl = dom.getContentEl(scope)
    if (!contentEl) return

    const styles = getComputedStyle(contentEl)
    const positionerEl = dom.getPositionerEl(scope)
    const backdropEl = dom.getBackdropEl(scope)

    if (positionerEl) {
      positionerEl.style.setProperty("--z-index", styles.zIndex)
      positionerEl.style.setProperty("z-index", "var(--z-index)")
    }

    if (backdropEl) {
      backdropEl.style.setProperty("--z-index", styles.zIndex)
    }
  })
}

function setStep(params: Params<TourSchema>, idx: number) {
  const { context, refs, computed, prop } = params
  const steps = context.get("steps")
  const step = steps[idx]

  if (!step) {
    context.set("stepId", null)
    return
  }

  if (isEqual(context.get("stepId"), step.id)) return

  const update = (data: Partial<StepBaseDetails>) => {
    context.set("steps", (prev) => prev.map((s, i) => (i === idx ? { ...s, ...data } : s)))
  }

  const next = () => {
    const idx = nextIndex(steps, computed("stepIndex"))
    context.set("stepId", steps[idx].id)
  }

  const goto = (id: string) => {
    const step = findStep(steps, id)
    if (!step) return
    context.set("stepId", step.id)
  }

  const dismiss = () => {
    context.set("stepId", null)
    prop("onStatusChange")?.({ status: "dismissed", stepId: null, stepIndex: -1 })
  }

  const show = () => {
    context.set("stepId", step.id)
  }

  if (!step.effect) {
    show()
    return
  }

  const cleanup = step.effect({
    show,
    next,
    update,
    target: step.target,
    dismiss,
    goto,
  })

  refs.set("_effectCleanup", cleanup)
}
