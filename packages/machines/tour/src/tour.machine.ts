import { createMachine, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact, isEqual, nextIndex, prevIndex } from "@zag-js/utils"
import { createFocusTrap, type FocusTrap } from "focus-trap"
import { dom } from "./tour.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tour.types"
import { autoUpdate } from "./utils/auto-update"

const getCentered = (size: MachineContext["windowSize"]) => {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 }
}

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
        ...ctx,
        currentRect: ref<any>({}),
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
        step: ["raiseStepChange", "makeStepTargetInert"],
      },

      activities: ["trackWindowSize"],
      exit: ["clearStep"],

      on: {
        "STEP.CHANGED": {
          guard: "isValidStep",
          target: "open:prepare",
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
            ctx.currentRect = getCentered(ctx.windowSize)
            return
          }

          const { x, y, width, height } = targetEl.getBoundingClientRect()

          targetEl.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" })

          ctx.currentRect = { x, y, width, height }
        },
        clearStep(ctx) {
          ctx.currentRect = ref<any>({})
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
        makeStepTargetInert(ctx) {
          ctx._inertCleanup?.()

          const targetEl = ctx.currentStep?.target?.()
          if (!targetEl) return

          targetEl.inert = true

          ctx._inertCleanup = () => {
            targetEl.inert = false
          }
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
          return trackDismissableElement(dom.getContentEl(ctx), {
            exclude: [ctx.currentStep?.target?.() ?? null],
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside" })
            },
          })
        },
        trackStepTarget(ctx) {
          if (ctx.currentStep == null) return
          const targetEl = ctx.currentStep.target?.()
          if (!targetEl) return
          return autoUpdate(targetEl, () => {
            const { x, y, width, height } = targetEl.getBoundingClientRect()
            ctx.currentRect = { x, y, width, height }
          })
        },
        trapFocus(ctx) {
          let trap: FocusTrap | undefined
          raf(() => {
            const el = dom.getContentEl(ctx)
            if (!el) return
            trap = createFocusTrap(el, {
              escapeDeactivates: false,
              allowOutsideClick: true,
              preventScroll: true,
              returnFocusOnDeactivate: true,
              document: dom.getDoc(ctx),
              fallbackFocus: el,
              setReturnFocus: false,
            })
            try {
              trap.activate()
            } catch {}
          })
          return () => trap?.deactivate()
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
            updatePosition({ updatePosition }) {
              if (targetEl()) {
                updatePosition()
              } else {
                ctx.currentRect = getCentered(ctx.windowSize)
                const positioner = positionerEl()
                // given the positioner's width and height, and the window size, we can center it
                const midX = ctx.windowSize.width / 2 - positioner!.offsetWidth / 2
                const midY = ctx.windowSize.height / 2 - positioner!.offsetHeight / 2

                if (positioner) {
                  positioner.style.setProperty("--x", `${midX}px`)
                  positioner.style.setProperty("--y", `${midY}px`)
                }
              }
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
}
