import { mergeProps } from "@zag-js/core"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import { dom } from "./tour.dom"
import type { Send, State, StepDetails } from "./tour.types"
import { getClipPath } from "./utils/get-clip-path"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const steps = Array.from(state.context.steps)
  const index = state.context.currentStepIndex
  const step = state.context.currentStep
  const hasTarget = typeof step?.target?.() !== "undefined"

  const hasNextStep = state.context.hasNextStep
  const hasPrevStep = state.context.hasPrevStep

  const isFirstStep = state.context.isFirstStep
  const isLastStep = state.context.isLastStep

  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: state.context.currentPlacement,
  })

  const currentRect = state.context.currentRect

  const clipPath = getClipPath({
    rect: currentRect,
    rootSize: state.context.windowSize,
    radius: state.context.overlayRadius,
  })

  return {
    currentIndex: index,
    currentStep: step,
    hasNextStep,
    hasPrevStep,
    isFirstStep,
    isLastStep,
    addStep(step: StepDetails) {
      const next = steps.concat(step)
      send({ type: "STEPS.SET", value: next, src: "addStep" })
    },
    removeStep(id: string) {
      const next = steps.filter((step) => step.id !== id)
      send({ type: "STEPS.SET", value: next, src: "removeStep" })
    },
    updateStep(id: string, stepOverrides: Partial<StepDetails>) {
      const next = steps.map((step) => (step.id === id ? mergeProps(step, stepOverrides) : step))
      send({ type: "STEPS.SET", id, value: next, src: "updateStep" })
    },
    setSteps(steps: StepDetails[]) {
      send({ type: "STEPS.SET", value: steps, src: "setSteps" })
    },
    setStep(id: string) {
      send({ type: "STEP.SET", value: id })
    },
    start() {
      send({ type: "START" })
    },
    next() {
      send({ type: "NEXT" })
    },
    prev() {
      send({ type: "PREV" })
    },
    open() {
      send({ type: "OPEN" })
    },
    close() {
      send({ type: "CLOSE" })
    },
    getProgressText() {
      if (index === -1) return ""
      return `Step ${index} / ${steps.length}`
    },

    overlayProps: normalize.element({
      ...parts.overlay.attrs,
      id: dom.getOverlayId(state.context),
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      style: {
        clipPath: `path("${clipPath}")`,
        position: "absolute",
        inset: "0",
        willChange: "clip-path",
      },
    }),

    strokeProps: normalize.element({
      ...parts.stroke.attrs,
      hidden: !isOpen,
      style: {
        position: "absolute",
        width: `${currentRect.width}px`,
        height: `${currentRect.height}px`,
        left: `${currentRect.x}px`,
        top: `${currentRect.y}px`,
        borderRadius: `${state.context.overlayRadius}px`,
      },
    }),

    progressTextProps: normalize.element({
      ...parts.progressText.attrs,
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      dir: state.context.dir,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      ...parts.arrow.attrs,
      dir: state.context.dir,
      style: {
        ...popperStyles.arrow,
        opacity: hasTarget ? undefined : 0,
      },
    }),

    arrowTipProps: normalize.element({
      ...parts.arrowTip.attrs,
      dir: state.context.dir,
      style: popperStyles.arrowTip,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      role: "dialog",
      "aria-modal": "true",
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      "data-placement": hasTarget ? state.context.currentPlacement : "center",
      "data-step": step?.id,
      "aria-labelledby": dom.getTitleId(state.context),
      "aria-describedby": dom.getDescriptionId(state.context),
      tabIndex: -1,
      onKeyDown(event) {
        switch (event.key) {
          case "ArrowRight":
            if (!hasNextStep) return
            send({ type: "NEXT", src: "keydown" })
            break
          case "ArrowLeft":
            if (!hasPrevStep) return
            send({ type: "PREV", src: "keydown" })
            break
          default:
            break
        }
      },
    }),

    titleProps: normalize.element({
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
      "data-placement": hasTarget ? state.context.currentPlacement : "center",
    }),

    descriptionProps: normalize.element({
      ...parts.description.attrs,
      id: dom.getDescriptionId(state.context),
      "data-placement": hasTarget ? state.context.currentPlacement : "center",
    }),

    nextTriggerProps: normalize.button({
      disabled: !hasNextStep,
      ...parts.nextTrigger.attrs,
      "aria-label": "Go to next step",
      onClick() {
        send({ type: "NEXT", src: "nextTrigger" })
      },
    }),

    prevTriggerProps: normalize.button({
      disabled: !hasPrevStep,
      ...parts.prevTrigger.attrs,
      type: "button",
      "aria-label": "Go to previous step",
      onClick() {
        send({ type: "PREV", src: "prevTrigger" })
      },
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      type: "button",
      "aria-label": "Close tour",
      onClick() {
        send({ type: "CLOSE", src: "closeTrigger" })
      },
    }),
  }
}
