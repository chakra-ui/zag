import { mergeProps } from "@zag-js/core"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import { dom } from "./tour.dom"
import type { MachineApi, Send, State } from "./tour.types"
import { getClipPath } from "./utils/get-clip-path"
import { dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isOpen = state.hasTag("open")

  const steps = Array.from(state.context.steps)
  const index = state.context.currentStepIndex
  const step = state.context.currentStep
  const hasTarget = typeof step?.target?.() !== "undefined"

  const hasNextStep = state.context.hasNextStep
  const hasPrevStep = state.context.hasPrevStep

  const firstStep = state.context.firstStep
  const lastStep = state.context.lastStep

  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: state.context.currentPlacement,
  })

  const currentRect = state.context.currentRect

  const clipPath = getClipPath({
    rect: currentRect,
    rootSize: state.context.boundarySize,
    radius: state.context.radius,
  })

  return {
    currentIndex: index,
    currentStep: step,
    hasNextStep,
    hasPrevStep,
    firstStep,
    lastStep,
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
    isCurrentStep(id) {
      return Boolean(step?.id === id)
    },
    next() {
      send({ type: "NEXT" })
    },
    prev() {
      send({ type: "PREV" })
    },
    skip() {
      send({ type: "SKIP" })
    },
    getProgressText() {
      const details = { current: index + 1, total: steps.length }
      return state.context.translations.progressText?.(details) ?? ""
    },

    getOverlayProps() {
      return normalize.element({
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
      })
    },

    getSpotlightProps() {
      return normalize.element({
        ...parts.spotlight.attrs,
        hidden: !isOpen,
        style: {
          position: "absolute",
          width: `${currentRect.width}px`,
          height: `${currentRect.height}px`,
          left: `${currentRect.x}px`,
          top: `${currentRect.y}px`,
          borderRadius: `${state.context.radius}px`,
          pointerEvents: "none",
        },
      })
    },

    getProgressTextProps() {
      return normalize.element({
        ...parts.progressText.attrs,
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        style: popperStyles.floating,
      })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(state.context),
        ...parts.arrow.attrs,
        dir: state.context.dir,
        style: {
          ...popperStyles.arrow,
          opacity: hasTarget ? undefined : 0,
        },
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: state.context.dir,
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(state.context),
        dir: state.context.dir,
        role: "alertdialog",
        "aria-modal": "true",
        "aria-live": "polite",
        "aria-atomic": "true",
        hidden: !isOpen,
        "data-state": isOpen ? "open" : "closed",
        "data-placement": hasTarget ? state.context.currentPlacement : "center",
        "data-step": step?.id,
        "aria-labelledby": dom.getTitleId(state.context),
        "aria-describedby": dom.getDescriptionId(state.context),
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!state.context.keyboardNavigation) return
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
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(state.context),
        "data-placement": hasTarget ? state.context.currentPlacement : "center",
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(state.context),
        "data-placement": hasTarget ? state.context.currentPlacement : "center",
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        disabled: !hasNextStep,
        "data-disabled": dataAttr(!hasNextStep),
        "aria-label": state.context.translations.nextStep,
        onClick() {
          send({ type: "NEXT", src: "nextTrigger" })
        },
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs,
        disabled: !hasPrevStep,
        "data-disabled": dataAttr(!hasPrevStep),
        type: "button",
        "aria-label": state.context.translations.prevStep,
        onClick() {
          send({ type: "PREV", src: "prevTrigger" })
        },
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        type: "button",
        "aria-label": state.context.translations.close,
        onClick() {
          send({ type: "STOP", src: "closeTrigger" })
        },
      })
    },

    getSkipTriggerProps() {
      return normalize.button({
        ...parts.skipTrigger.attrs,
        type: "button",
        "aria-label": state.context.translations.skip,
        onClick() {
          send({ type: "SKIP" })
        },
      })
    },
  }
}
