import { mergeProps } from "@zag-js/core"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import { dom } from "./tour.dom"
import type { MachineApi, Send, State } from "./tour.types"
import { getClipPath } from "./utils/get-clip-path"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
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
    addStep(step) {
      const next = steps.concat(step)
      send({ type: "STEPS.SET", value: next, src: "addStep" })
    },
    removeStep(id) {
      const next = steps.filter((step) => step.id !== id)
      send({ type: "STEPS.SET", value: next, src: "removeStep" })
    },
    updateStep(id, stepOverrides) {
      const next = steps.map((step) => (step.id === id ? mergeProps(step, stepOverrides) : step))
      send({ type: "STEPS.SET", value: next, src: "updateStep" })
    },
    setSteps(steps) {
      send({ type: "STEPS.SET", value: steps, src: "setSteps" })
    },
    setStep(id) {
      send({ type: "STEP.SET", value: id })
    },
    start(id) {
      send({ type: "START", id })
    },
    isValidStep(id) {
      return steps.some((step) => step.id === id)
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
      const details = { current: index + 1, total: steps.length }
      return state.context.translations.progressText?.(details) ?? ""
    },

    overlayProps: normalize.element({
      ...parts.overlay.attrs,
      id: dom.getOverlayId(state.context),
      dir: state.context.dir,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      style: {
        clipPath: `path("${clipPath}")`,
        position: "absolute",
        inset: "0",
        willChange: "clip-path",
      },
    }),

    spotlightProps: normalize.element({
      ...parts.spotlight.attrs,
      hidden: !isOpen,
      style: {
        position: "absolute",
        width: `${currentRect.width}px`,
        height: `${currentRect.height}px`,
        left: `${currentRect.x}px`,
        top: `${currentRect.y}px`,
        borderRadius: `${state.context.overlayRadius}px`,
        pointerEvents: "none",
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
      dir: state.context.dir,
      role: "alertdialog",
      "aria-modal": "true",
      "aria-live": "assertive",
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      "data-placement": hasTarget ? state.context.currentPlacement : "center",
      "data-step": step?.id,
      "aria-labelledby": dom.getTitleId(state.context),
      "aria-describedby": dom.getDescriptionId(state.context),
      tabIndex: -1,
      onKeyDown(event) {
        const isRtl = state.context.dir === "rtl"
        switch (event.key) {
          case "ArrowRight":
            if (!hasNextStep) return
            send({ type: isRtl ? "PREV" : "NEXT", src: "keydown" })
            break
          case "ArrowLeft":
            if (!hasPrevStep) return
            send({ type: isRtl ? "NEXT" : "PREV", src: "keydown" })
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
      "aria-label": state.context.translations.nextStepLabel,
      onClick() {
        send({ type: "NEXT", src: "nextTrigger" })
      },
    }),

    prevTriggerProps: normalize.button({
      disabled: !hasPrevStep,
      ...parts.prevTrigger.attrs,
      type: "button",
      "aria-label": state.context.translations.prevStepLabel,
      onClick() {
        send({ type: "PREV", src: "prevTrigger" })
      },
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      type: "button",
      "aria-label": state.context.translations.closeLabel,
      onClick() {
        send({ type: "CLOSE", src: "closeTrigger" })
      },
    }),
  }
}
