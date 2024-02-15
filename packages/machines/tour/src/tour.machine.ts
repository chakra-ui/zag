import { createMachine, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement, type AnchorRect } from "@zag-js/popper"
import { compact, isEqual, nextIndex, prevIndex } from "@zag-js/utils"
import { createFocusTrap, type FocusTrap } from "focus-trap"
import { dom } from "./tour.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tour.types"
import { autoUpdate } from "./utils/auto-update"
import { getCenterRect, isEventInRect, offset } from "./utils/rect"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tour",

      initial: ctx.open ? "open" : "closed",

      context: {
        step: null,
        steps: [],
        preventInteraction: false,
        closeOnInteractOutside: true,
        closeOnEsc: true,
        keyboardNavigation: true,
        offset: { x: 20, y: 20 },
        ...ctx,
        currentRect: ref({ width: 0, height: 0, x: 0, y: 0 }),
        windowSize: ref({ width: 0, height: 0 }),
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
        isFirstStep: (ctx) => ctx.currentStepIndex === 0,
        isLastStep: (ctx) => ctx.currentStepIndex === ctx.steps.length - 1,
      },

      watch: {
        step: ["raiseStepChange", "syncTargetEl"],
        open: ["toggleVisibility"],
      },

      activities: ["trackWindowSize"],
      exit: ["clearStep"],

      on: {
        "STEP.CHANGED": {
          guard: "isValidStep",
          target: "open:prepare",
        },
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
              actions: ["setInitialStep", "invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },
        "open:prepare": {
          tags: ["open"],
          entry: ["prepareStepTarget"],
          activities: ["trackStepTarget", "trapFocus", "trackPlacement", "trackDismissableElement"],
          after: {
            0: "open",
          },
        },
        open: {
          tags: ["open"],
          activities: ["trackStepTarget", "trapFocus", "trackPlacement", "trackDismissableElement"],
          on: {
            NEXT: {
              actions: ["setNextStep"],
            },
            PREV: {
              actions: ["setPrevStep"],
            },
            CLOSE: {
              target: "closed",
              actions: ["clearStep", "invokeOnClose"],
            },
          },
        },
      },
    },
    {
      guards: {
        isValidStep: (ctx) => ctx.step != null,
        isOpenControlled: (ctx) => ctx["open.controlled"] !== undefined,
      },
      actions: {
        prepareStepTarget(ctx, _evt) {
          const targetEl = ctx.currentStep?.target?.()

          if (!targetEl) {
            set.currentRect(ctx, getCenterRect(ctx.windowSize))
            return
          }

          targetEl.scrollIntoView({ behavior: "instant", block: "center", inline: "center" })

          const { x, y, width, height } = targetEl.getBoundingClientRect()
          set.currentRect(ctx, { x, y, width, height })
        },
        setStep(ctx, evt) {
          set.step(ctx, evt.value)
        },
        clearStep(ctx) {
          ctx.currentRect = ref({ width: 0, height: 0, x: 0, y: 0 })
          set.step(ctx, null)
        },
        setInitialStep(ctx) {
          if (ctx.steps.length === 0) return
          set.step(ctx, ctx.steps[0].id)
        },
        setNextStep(ctx) {
          const idx = nextIndex(ctx.steps, ctx.currentStepIndex)
          const nextStep = ctx.steps[idx]
          if (!nextStep) return
          set.step(ctx, nextStep.id)
        },
        setPrevStep(ctx) {
          const idx = prevIndex(ctx.steps, ctx.currentStepIndex)
          const prevStep = ctx.steps[idx]
          if (!prevStep) return
          set.step(ctx, prevStep.id)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        raiseStepChange(_ctx, _evt, { send }) {
          send({ type: "STEP.CHANGED" })
        },
        syncTargetEl(ctx) {
          ctx._cleanup?.()
          ctx._cleanup = undefined

          const targetEl = ctx.currentStep?.target?.()
          if (!targetEl) return

          if (ctx.preventInteraction) {
            targetEl.inert = true
          }

          targetEl.dataset.tour = ""

          ctx._cleanup = () => {
            if (ctx.preventInteraction) {
              targetEl.inert = false
            }
            delete targetEl.dataset.tour
          }
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" })
        },
      },
      activities: {
        trackWindowSize(ctx) {
          const win = dom.getWin(ctx)
          const onResize = () => {
            ctx.windowSize = { width: win.innerWidth, height: win.innerHeight }
          }
          onResize()
          win.addEventListener("resize", onResize)
          return () => win.removeEventListener("resize", onResize)
        },
        trackDismissableElement(ctx, _evt, { send }) {
          if (ctx.currentStep == null) return
          let dismiss = true
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            onEscapeKeyDown(event) {
              event.preventDefault()
              if (!ctx.closeOnEsc) return
              send({ type: "CLOSE", src: "keydown" })
            },
            onPointerDownOutside(event) {
              dismiss = !isEventInRect(ctx.currentRect, event.detail.originalEvent)
            },
            onDismiss() {
              if (dismiss) {
                send({ type: "CLOSE", src: "interact-outside" })
              }
            },
          })
        },
        trackStepTarget(ctx) {
          if (ctx.currentStep == null) return
          const targetEl = ctx.currentStep.target?.()
          if (!targetEl) return
          return autoUpdate(targetEl, () => {
            const { x, y, width, height } = targetEl.getBoundingClientRect()
            set.currentRect(ctx, { x, y, width, height })
          })
        },
        trapFocus(ctx) {
          let trap: FocusTrap | undefined

          const _cleanup = raf(() => {
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return

            trap = createFocusTrap(contentEl, {
              escapeDeactivates: false,
              allowOutsideClick: true,
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
            _cleanup?.()
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
            getAnchorRect(el) {
              if (!el) return null
              const { x, y, width, height } = el.getBoundingClientRect()
              return offset({ x, y, width, height }, [ctx.offset.x, ctx.offset.y])
            },
            updatePosition({ updatePosition }) {
              if (targetEl()) {
                updatePosition()
                return
              }

              // Center the tour (if no target is defined)
              // given the positioner's width and height, and the window size, we can center it

              set.currentRect(ctx, getCenterRect(ctx.windowSize))

              const positioner = positionerEl()
              if (!positioner) return

              const midX = ctx.windowSize.width / 2 - positioner.offsetWidth / 2
              const midY = ctx.windowSize.height / 2 - positioner.offsetHeight / 2

              positioner.style.setProperty("--x", `${midX}px`)
              positioner.style.setProperty("--y", `${midY}px`)
            },
            onComplete(data) {
              ctx.currentPlacement = data.placement
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
      complete: ctx.isLastStep,
      step: ctx.step,
      count: ctx.steps.length,
      index: ctx.currentStepIndex,
    })
  },
}

const set = {
  step(ctx: MachineContext, stepId: string | null) {
    if (isEqual(ctx.step, stepId)) return
    ctx.step = stepId
    invoke.stepChange(ctx)
  },
  currentRect(ctx: MachineContext, rect: Required<AnchorRect>) {
    ctx.currentRect = offset(rect, [ctx.offset.x, ctx.offset.y])
  },
}
