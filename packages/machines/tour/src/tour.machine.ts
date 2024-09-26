import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableBranch } from "@zag-js/dismissable"
import { contains, isHTMLElement } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { compact, isEqual, isString, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./tour.dom"
import type { MachineContext, MachineState, StepBaseDetails, UserDefinedContext } from "./tour.types"
import { findStep, findStepIndex, isTooltipStep } from "./utils/step"
import { isEventInRect, offset } from "./utils/rect"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tour",
      initial: "tour.inactive",

      context: {
        step: null,
        steps: [],
        preventInteraction: false,
        closeOnInteractOutside: true,
        closeOnEscape: true,
        keyboardNavigation: true,
        offset: { x: 10, y: 10 },
        radius: 4,
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
        currentRect: ref({ width: 0, height: 0, x: 0, y: 0 }),
        boundarySize: ref({ width: 0, height: 0 }),
      },

      computed: {
        currentStepIndex: (ctx) => findStepIndex(ctx.steps, ctx.step),
        currentStep: (ctx) => findStep(ctx.steps, ctx.step),
        hasNextStep: (ctx) => ctx.currentStepIndex < ctx.steps.length - 1,
        hasPrevStep: (ctx) => ctx.currentStepIndex > 0,
        isFirstStep: (ctx) => ctx.currentStepIndex === 0,
        isLastStep: (ctx) => ctx.currentStepIndex === ctx.steps.length - 1,
      },

      created: ["validateSteps"],

      watch: {
        step: ["setResolvedTarget", "raiseStepChange", "syncTargetAttrs"],
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
        isValidStep: (ctx) => ctx.step != null,
        hasTarget: (ctx) => ctx.currentStep?.target != null,
        hasResolvedTarget: (ctx) => ctx.resolvedTarget.value != null,
        isWaitingStep: (ctx) => ctx.currentStep?.type === "wait",
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
          ctx.currentRect = ref({ width: 0, height: 0, x: 0, y: 0 })
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
          const idx = nextIndex(ctx.steps, ctx.currentStepIndex)
          set.step(ctx, idx)
        },
        setPrevStep(ctx) {
          const idx = prevIndex(ctx.steps, ctx.currentStepIndex)
          set.step(ctx, idx)
        },
        invokeOnStart(ctx) {
          ctx.onStatusChange?.({ status: "started", step: ctx.step })
        },
        invokeOnDismiss(ctx) {
          ctx.onStatusChange?.({ status: "dismissed", step: ctx.step })
        },
        invokeOnComplete(ctx) {
          ctx.onStatusChange?.({ status: "completed", step: ctx.step })
        },
        invokeOnSkip(ctx) {
          ctx.onStatusChange?.({ status: "skipped", step: ctx.step })
        },
        invokeOnNotFound(ctx) {
          ctx.onStatusChange?.({ status: "not-found", step: ctx.step })
        },
        raiseStepChange(_ctx, _evt, { send }) {
          send({ type: "STEP.CHANGED" })
        },
        setResolvedTarget(ctx, evt) {
          const node = evt.node ?? ctx.currentStep?.target?.()
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
          const targetEl = ctx.currentStep?.target

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
          // Use window size as boundary for now
          const win = dom.getWin(ctx)
          const onResize = () => {
            ctx.boundarySize = { width: win.innerWidth, height: win.innerHeight }
          }
          onResize()

          win.addEventListener("resize", onResize)
          return () => {
            win.removeEventListener("resize", onResize)
          }
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
          if (ctx.currentStep == null) return
          const getContentEl = () => dom.getContentEl(ctx)

          return trackInteractOutside(getContentEl, {
            defer: true,
            exclude(target) {
              return contains(ctx.currentStep?.target?.(), target)
            },
            onFocusOutside(event) {
              ctx.onFocusOutside?.(event)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onPointerDownOutside(event) {
              ctx.onPointerDownOutside?.(event)
              const isWithin = isEventInRect(ctx.currentRect, event.detail.originalEvent)
              const dismiss = ctx.closeOnInteractOutside || !isWithin
              if (!dismiss) {
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
          if (ctx.currentStep == null) return
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableBranch(getContentEl, { defer: true })
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
          if (ctx.currentStep == null) return

          ctx.currentPlacement = ctx.currentStep.placement ?? "bottom"

          if (!isTooltipStep(ctx.currentStep)) return

          const positionerEl = () => dom.getPositionerEl(ctx)

          return getPlacement(ctx.resolvedTarget.value, positionerEl, {
            defer: !!positionerEl(),
            placement: ctx.currentStep.placement ?? "bottom",
            strategy: "absolute",
            gutter: 10,
            getAnchorRect(el) {
              if (!isHTMLElement(el)) return null
              const { x, y, width, height } = el.getBoundingClientRect()
              return offset({ x, y, width, height }, ctx.offset)
            },
            onComplete(data) {
              const { rects } = data.middlewareData
              ctx.currentPlacement = data.placement
              ctx.currentRect = rects.reference
            },
          })
        },
      },
    },
  )
}

const invoke = {
  stepChange(ctx: MachineContext) {
    const effectiveLength = ctx.steps.filter((step) => step.type !== "wait").length
    const progress = (ctx.currentStepIndex + 1) / effectiveLength

    ctx.onStepChange?.({
      complete: ctx.isLastStep,
      currentStepId: ctx.step,
      totalSteps: ctx.steps.length,
      currentStepIndex: ctx.currentStepIndex,
      progress,
    })

    // cleanup previous effect
    ctx._effectCleanup?.()
    ctx._effectCleanup = undefined
  },
}

const set = {
  step(ctx: MachineContext, idx: number) {
    const step = ctx.steps[idx]

    if (!step) {
      ctx.step = null
      invoke.stepChange(ctx)
      return
    }

    if (isEqual(ctx.step, step.id)) return

    const update = (data: Partial<StepBaseDetails>) => {
      ctx.steps[idx] = { ...step, ...data }
    }

    const next = () => {
      const idx = nextIndex(ctx.steps, ctx.currentStepIndex)
      ctx.step = ctx.steps[idx].id
      invoke.stepChange(ctx)
    }

    const goto = (id: string) => {
      const idx = ctx.steps.findIndex((s) => s.id === id)
      ctx.step = ctx.steps[idx].id
      invoke.stepChange(ctx)
    }

    const dismiss = () => {
      ctx.step = null
      invoke.stepChange(ctx)
      ctx.onStatusChange?.({ status: "dismissed", step: ctx.step })
    }

    const show = () => {
      ctx.step = step.id
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
