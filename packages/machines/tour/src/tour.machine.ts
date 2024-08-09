import { createMachine, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { isHTMLElement, raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact, isEqual, isString, nextIndex, prevIndex } from "@zag-js/utils"
import { createFocusTrap, type FocusTrap } from "focus-trap"
import { dom } from "./tour.dom"
import type { MachineContext, MachineState, StepInit, UserDefinedContext } from "./tour.types"
import { getCenterRect, isEventInRect, offset } from "./utils/rect"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tour",
      initial: "closed",

      context: {
        step: null,
        steps: [],
        preventInteraction: false,
        closeOnInteractOutside: true,
        closeOnEscape: true,
        keyboardNavigation: true,
        offset: { x: 10, y: 10 },
        radius: 4,
        skipBehavior: "complete",
        translations: {
          nextStep: "next step",
          prevStep: "previous step",
          close: "close tour",
          progressText: ({ current, total }) => `${current + 1} of ${total}`,
          skip: "skip tour",
          ...ctx.translations,
        },
        ...ctx,
        currentRect: ref({ width: 0, height: 0, x: 0, y: 0 }),
        boundarySize: ref({ width: 0, height: 0 }),
      },

      computed: {
        currentStepIndex: (ctx) => {
          if (ctx.step == null) return -1
          return ctx.steps.findIndex((s) => s.id === ctx.step)
        },
        currentStep: (ctx) => {
          if (ctx.step == null) return null
          return ctx.steps.find((s) => s.id === ctx.step) ?? null
        },
        hasNextStep: (ctx) => ctx.currentStepIndex < ctx.steps.length - 1,
        hasPrevStep: (ctx) => ctx.currentStepIndex > 0,
        firstStep: (ctx) => ctx.currentStepIndex === 0,
        lastStep: (ctx) => ctx.currentStepIndex === ctx.steps.length - 1,
      },

      watch: {
        step: ["raiseStepChange", "syncTargetAttrs"],
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
      },

      states: {
        closed: {
          tags: ["closed"],
          on: {
            START: {
              target: "open",
              actions: ["setInitialStep", "invokeOnStart"],
            },
            RESUME: {
              target: "scrolling",
              actions: ["invokeOnStart"],
            },
          },
        },
        scrolling: {
          tags: ["open"],
          entry: ["scrollStepTargetIntoView"],
          activities: ["trapFocus", "trackPlacement", "trackDismissableElement"],
          after: {
            0: "open",
          },
        },
        open: {
          tags: ["open"],
          activities: ["trapFocus", "trackPlacement", "trackDismissableElement"],
          on: {
            "STEP.CHANGED": {
              guard: "isValidStep",
              target: "scrolling",
            },
            NEXT: {
              actions: ["setNextStep"],
            },
            PREV: {
              actions: ["setPrevStep"],
            },
            PAUSE: {
              target: "closed",
              actions: ["invokeOnStop"],
            },
            SKIP: [
              {
                guard: "completeOnSkip",
                target: "closed",
                actions: ["invokeOnComplete", "invokeOnSkip", "clearStep"],
              },
              {
                actions: ["invokeOnSkip", "setNextStep"],
              },
            ],
            STOP: [
              {
                guard: "lastStep",
                target: "closed",
                actions: ["invokeOnStop", "invokeOnComplete", "clearStep"],
              },
              {
                target: "closed",
                actions: ["invokeOnStop", "clearStep"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        lastStep: (ctx) => ctx.lastStep,
        isValidStep: (ctx) => ctx.step != null,
        completeOnSkip: (ctx) => ctx.skipBehavior === "complete",
      },
      actions: {
        scrollStepTargetIntoView(ctx, _evt) {
          const targetEl = ctx.currentStep?.target?.()
          targetEl?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
          })
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
            const idx = ctx.steps.findIndex((s) => s.id === evt.id)
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
        invokeOnStop(ctx) {
          ctx.onStatusChange?.({ status: "stopped", step: ctx.step })
        },
        invokeOnComplete(ctx) {
          ctx.onStatusChange?.({ status: "completed", step: ctx.step })
        },
        invokeOnSkip(ctx) {
          ctx.onStatusChange?.({ status: "skipped", step: ctx.step })
        },
        raiseStepChange(_ctx, _evt, { send }) {
          send({ type: "STEP.CHANGED" })
        },
        syncTargetAttrs(ctx) {
          ctx._targetCleanup?.()
          ctx._targetCleanup = undefined

          const targetEl = ctx.currentStep?.target?.()
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
      },
      activities: {
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

        trackDismissableElement(ctx, _evt, { send }) {
          if (ctx.currentStep == null) return

          let dismiss = true
          const getContentEl = () => dom.getContentEl(ctx)

          return trackDismissableElement(getContentEl, {
            defer: true,
            onEscapeKeyDown(event) {
              event.preventDefault()
              if (!ctx.closeOnEscape) return
              send({ type: "STOP", src: "esc" })
            },
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside(event) {
              ctx.onPointerDownOutside?.(event)
              dismiss = !isEventInRect(ctx.currentRect, event.detail.originalEvent)
            },
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onDismiss() {
              if (dismiss) {
                send({ type: "STOP", src: "interact-outside" })
              }
            },
          })
        },

        trapFocus(ctx) {
          let trap: FocusTrap | undefined

          const rafCleanup = raf(() => {
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return

            trap = createFocusTrap(contentEl, {
              escapeDeactivates: false,
              preventScroll: true,
              returnFocusOnDeactivate: false,
              document: dom.getDoc(ctx),
              fallbackFocus: contentEl,
            })

            try {
              trap.activate()
            } catch {}
          })

          return () => {
            trap?.deactivate()
            rafCleanup?.()
          }
        },
        trackPlacement(ctx) {
          if (ctx.currentStep == null) return
          ctx.currentPlacement = ctx.currentStep.placement ?? "bottom"

          const targetEl = () => ctx.currentStep!.target?.() ?? null
          const positionerEl = () => dom.getPositionerEl(ctx)

          return getPlacement(targetEl, positionerEl, {
            defer: true,
            placement: ctx.currentStep.placement ?? "bottom",
            strategy: "absolute",
            gutter: 10,
            getAnchorRect(el) {
              if (!isHTMLElement(el)) return null
              const { x, y, width, height } = el.getBoundingClientRect()
              return offset({ x, y, width, height }, ctx.offset)
            },
            updatePosition({ updatePosition }) {
              if (targetEl()) {
                updatePosition()
                return
              }

              // Center the tour (if no target is defined)
              // given the positioner's width and height, and the boundary size, we can center it

              ctx.currentRect = getCenterRect(ctx.boundarySize)

              const positioner = positionerEl()
              if (!positioner) return

              const midX = ctx.boundarySize.width / 2 - positioner.offsetWidth / 2
              const midY = ctx.boundarySize.height / 2 - positioner.offsetHeight / 2

              positioner.style.setProperty("--x", `${midX}px`)
              positioner.style.setProperty("--y", `${midY}px`)
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
    ctx.onStepChange?.({
      complete: ctx.lastStep,
      step: ctx.step,
      count: ctx.steps.length,
      index: ctx.currentStepIndex,
    })
  },
}

const set = {
  step(ctx: MachineContext, idx: number) {
    ctx._effectCleanup?.()

    const step = ctx.steps[idx]

    if (!step) {
      ctx.step = null
      return
    }

    if (isEqual(ctx.step, step.id)) return

    const update = (data: Partial<StepInit>) => {
      ctx.steps[idx] = { ...step, ...data }
    }

    const next = () => {
      ctx.step = step.id
      invoke.stepChange(ctx)
    }

    if (!step.effect) {
      next()
      return
    }

    ctx._effectCleanup = step.effect({ next, update })
  },
}
