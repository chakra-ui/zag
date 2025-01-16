import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableBranch } from "@zag-js/dismissable"
import { contains, getComputedStyle, isHTMLElement, raf } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { compact, isEqual, isString, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./tour.dom"
import type { MachineContext, MachineState, StepBaseDetails, StepStatus, UserDefinedContext } from "./tour.types"
import { findStep, findStepIndex, isDialogStep, isTooltipStep } from "./utils/step"
import { isEventInRect, offset } from "./utils/rect"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tour",
      initial: "tour.inactive",

      context: {
        stepId: null,
        steps: [],
        preventInteraction: false,
        closeOnInteractOutside: true,
        closeOnEscape: true,
        keyboardNavigation: true,
        spotlightOffset: { x: 10, y: 10 },
        spotlightRadius: 4,
        translations: {
          nextStep: "next step",
          prevStep: "previous step",
          close: "close tour",
          progressText: ({ current, total }) => `${current + 1} of ${total}`,
          skip: "skip tour",
          ...ctx.translations,
        },
        ...ctx,
        resolvedTarget: ref({ value: null }),
        targetRect: ref({ width: 0, height: 0, x: 0, y: 0 }),
        boundarySize: ref({ width: 0, height: 0 }),
      },

      computed: {
        stepIndex: (ctx) => findStepIndex(ctx.steps, ctx.stepId),
        step: (ctx) => findStep(ctx.steps, ctx.stepId),
        hasNextStep: (ctx) => ctx.stepIndex < ctx.steps.length - 1,
        hasPrevStep: (ctx) => ctx.stepIndex > 0,
        isFirstStep: (ctx) => ctx.stepIndex === 0,
        isLastStep: (ctx) => ctx.stepIndex === ctx.steps.length - 1,
      },

      created: ["validateSteps"],

      watch: {
        stepId: ["setResolvedTarget", "raiseStepChange", "syncTargetAttrs"],
      },

      activities: ["trackBoundarySize"],

      exit: ["clearStep", "cleanupFns"],

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
          },
          {
            guard: and("isValidStep", "hasTarget"),
            target: "target.resolving",
          },
          {
            guard: and("isValidStep", "isWaitingStep"),
            target: "step.waiting",
          },
          {
            guard: "isValidStep",
            target: "tour.active",
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
          activities: ["waitForTarget"],
          after: {
            MISSING_TARGET_TIMEOUT: {
              target: "tour.inactive",
              actions: ["invokeOnNotFound", "clearStep"],
            },
          },
          on: {
            "TARGET.RESOLVED": {
              target: "target.scrolling",
              actions: ["setResolvedTarget"],
            },
          },
        },

        "target.scrolling": {
          tags: ["open"],
          entry: ["scrollToTarget"],
          activities: [
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown",
          ],
          after: {
            100: "tour.active",
          },
        },

        "step.waiting": {
          tags: ["closed"],
        },

        "tour.active": {
          tags: ["open"],
          activities: [
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown",
          ],
        },
      },
    },
    {
      delays: {
        MISSING_TARGET_TIMEOUT: 3000,
      },

      guards: {
        isLastStep: (ctx) => ctx.isLastStep,
        isValidStep: (ctx) => ctx.stepId != null,
        hasTarget: (ctx) => ctx.step?.target != null,
        hasResolvedTarget: (ctx) => ctx.resolvedTarget.value != null,
        isWaitingStep: (ctx) => ctx.step?.type === "wait",
      },

      actions: {
        scrollToTarget(ctx, _evt) {
          const node = ctx.resolvedTarget.value
          node?.scrollIntoView({ behavior: "instant", block: "center", inline: "center" })
        },
        setStep(ctx, evt) {
          set.step(ctx, evt.value)
        },
        clearStep(ctx) {
          ctx.targetRect = ref({ width: 0, height: 0, x: 0, y: 0 })
          set.step(ctx, -1)
        },
        setInitialStep(ctx, evt) {
          if (ctx.steps.length === 0) return

          if (isString(evt.id)) {
            const idx = findStepIndex(ctx.steps, evt.id)
            set.step(ctx, idx)
            return
          }

          set.step(ctx, 0)
        },
        setNextStep(ctx) {
          const idx = nextIndex(ctx.steps, ctx.stepIndex)
          set.step(ctx, idx)
        },
        setPrevStep(ctx) {
          const idx = prevIndex(ctx.steps, ctx.stepIndex)
          set.step(ctx, idx)
        },
        invokeOnStart(ctx) {
          invoke.statusChange(ctx, "started")
        },
        invokeOnDismiss(ctx) {
          invoke.statusChange(ctx, "dismissed")
        },
        invokeOnComplete(ctx) {
          invoke.statusChange(ctx, "completed")
        },
        invokeOnSkip(ctx) {
          invoke.statusChange(ctx, "skipped")
        },
        invokeOnNotFound(ctx) {
          invoke.statusChange(ctx, "not-found")
        },
        raiseStepChange(_ctx, _evt, { send }) {
          send({ type: "STEP.CHANGED" })
        },
        setResolvedTarget(ctx, evt) {
          const node = evt.node ?? ctx.step?.target?.()
          ctx.resolvedTarget.value = node ?? null
        },
        syncTargetAttrs(ctx) {
          ctx._targetCleanup?.()
          ctx._targetCleanup = undefined

          const targetEl = ctx.resolvedTarget.value
          if (!targetEl) return

          if (ctx.preventInteraction) targetEl.inert = true
          targetEl.setAttribute("data-tour-highlighted", "")

          ctx._targetCleanup = () => {
            if (ctx.preventInteraction) targetEl.inert = false
            targetEl.removeAttribute("data-tour-highlighted")
          }
        },
        cleanupFns(ctx) {
          ctx._targetCleanup?.()
          ctx._targetCleanup = undefined

          ctx._effectCleanup?.()
          ctx._effectCleanup = undefined
        },
        validateSteps(ctx) {
          // ensure all steps have unique ids
          const ids = new Set()

          ctx.steps.forEach((step) => {
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

      activities: {
        waitForTarget(ctx, _evt, { send }) {
          const targetEl = ctx.step?.target

          const win = dom.getWin(ctx)
          const rootNode = dom.getRootNode(ctx)

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

        trackBoundarySize(ctx) {
          const win = dom.getWin(ctx)
          const doc = dom.getDoc(ctx)

          const onResize = () => {
            const width = visualViewport?.width ?? win.innerWidth
            const height = doc.documentElement.scrollHeight
            ctx.boundarySize = { width, height }
          }

          onResize()

          const viewport = win.visualViewport ?? win
          viewport.addEventListener("resize", onResize)
          return () => viewport.removeEventListener("resize", onResize)
        },

        trackEscapeKeydown(ctx, _evt, { send }) {
          if (!ctx.closeOnEscape) return
          const doc = dom.getDoc(ctx)

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

        trackInteractOutside(ctx, _evt, { send }) {
          if (ctx.step == null) return
          const contentEl = () => dom.getContentEl(ctx)

          return trackInteractOutside(contentEl, {
            defer: true,
            exclude(target) {
              return contains(ctx.step?.target?.(), target)
            },
            onFocusOutside(event) {
              ctx.onFocusOutside?.(event)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onPointerDownOutside(event) {
              ctx.onPointerDownOutside?.(event)

              const isWithin = isEventInRect(ctx.targetRect, event.detail.originalEvent)

              if (isWithin) {
                event.preventDefault()
                return
              }

              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              send({ type: "DISMISS", src: "interact-outside" })
            },
          })
        },

        trackDismissableBranch(ctx) {
          if (ctx.step == null) return
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableBranch(contentEl, { defer: !contentEl() })
        },

        trapFocus(ctx) {
          const contentEl = () => dom.getContentEl(ctx)
          return trapFocus(contentEl, {
            escapeDeactivates: false,
            allowOutsideClick: true,
            preventScroll: true,
            returnFocusOnDeactivate: false,
          })
        },

        trackPlacement(ctx) {
          if (ctx.step == null) return

          ctx.currentPlacement = ctx.step.placement ?? "bottom"

          if (isDialogStep(ctx.step)) return syncZIndex(ctx)

          if (!isTooltipStep(ctx.step)) return

          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(ctx.resolvedTarget.value, positionerEl, {
            defer: true,
            placement: ctx.step.placement ?? "bottom",
            strategy: "absolute",
            gutter: 10,
            offset: ctx.step.offset,
            getAnchorRect(el) {
              if (!isHTMLElement(el)) return null
              const rect = el.getBoundingClientRect()
              return offset(rect, ctx.spotlightOffset)
            },
            onComplete(data) {
              const { rects } = data.middlewareData
              ctx.currentPlacement = data.placement
              ctx.targetRect = rects.reference
            },
          })
        },
      },
    },
  )
}

function syncZIndex(ctx: MachineContext) {
  return raf(() => {
    // sync z-index of positioner with content
    const contentEl = dom.getContentEl(ctx)
    if (!contentEl) return

    const styles = getComputedStyle(contentEl)
    const positionerEl = dom.getPositionerEl(ctx)
    const backdropEl = dom.getBackdropEl(ctx)

    if (positionerEl) {
      positionerEl.style.setProperty("--z-index", styles.zIndex)
      positionerEl.style.setProperty("z-index", "var(--z-index)")
    }

    if (backdropEl) {
      backdropEl.style.setProperty("--z-index", styles.zIndex)
    }
  })
}

const invoke = {
  stepChange(ctx: MachineContext) {
    const effectiveLength = ctx.steps.filter((step) => step.type !== "wait").length
    const progress = (ctx.stepIndex + 1) / effectiveLength

    ctx.onStepChange?.({
      complete: ctx.isLastStep,
      stepId: ctx.stepId,
      totalSteps: ctx.steps.length,
      stepIndex: ctx.stepIndex,
      progress,
    })

    // cleanup previous effect
    ctx._effectCleanup?.()
    ctx._effectCleanup = undefined
  },

  statusChange(ctx: MachineContext, status: StepStatus) {
    ctx.onStatusChange?.({
      status,
      stepId: ctx.stepId,
      stepIndex: ctx.stepIndex,
    })
  },
}

const set = {
  step(ctx: MachineContext, idx: number) {
    const step = ctx.steps[idx]

    if (!step) {
      ctx.stepId = null
      invoke.stepChange(ctx)
      return
    }

    if (isEqual(ctx.stepId, step.id)) return

    const update = (data: Partial<StepBaseDetails>) => {
      ctx.steps[idx] = { ...step, ...data }
    }

    const next = () => {
      const idx = nextIndex(ctx.steps, ctx.stepIndex)
      ctx.stepId = ctx.steps[idx].id
      invoke.stepChange(ctx)
    }

    const goto = (id: string) => {
      const idx = ctx.steps.findIndex((s) => s.id === id)
      ctx.stepId = ctx.steps[idx].id
      invoke.stepChange(ctx)
    }

    const dismiss = () => {
      ctx.stepId = null
      invoke.stepChange(ctx)
      invoke.statusChange(ctx, "dismissed")
    }

    const show = () => {
      ctx.stepId = step.id
      invoke.stepChange(ctx)
    }

    if (!step.effect) {
      show()
      return
    }

    ctx._effectCleanup = step.effect({
      show,
      next,
      update,
      target: step.target,
      dismiss,
      goto,
    })
  },
}
