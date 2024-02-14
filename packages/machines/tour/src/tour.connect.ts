import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import { dom } from "./tour.dom"
import type { Send, State, StepDetails } from "./tour.types"
import { getClipPath } from "./utils/get-clip-path"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const index = state.context.currentStepIndex
  const step = state.context.currentStep

  const hasNextStep = state.context.hasNextStep
  const hasPrevStep = state.context.hasPrevStep

  const isFirstStep = state.context.isFirstStep
  const isLastStep = state.context.isLastStep

  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: state.context.currentPlacement,
  })

  const clipPath = getClipPath({
    rect: state.context.currentRect,
    rootSize: state.context.windowSize,
    radius: 4,
  })

  return {
    index,
    currentStep: step,
    hasNextStep,
    hasPrevStep,
    isFirstStep,
    isLastStep,
    addStep(step: StepDetails) {
      send({ type: "STEPS.ADD", value: step })
    },
    removeStep(id: string) {
      send({ type: "STEPS.REMOVE", value: id })
    },
    update(id: string, step: StepDetails) {
      send({ type: "STEPS.UPDATE", id, value: step })
    },
    setSteps(steps: StepDetails[]) {
      send({ type: "STEPS.SET", value: steps })
    },
    highlight(step: StepDetails) {
      send({ type: "HIGHLIGHT", step })
    },
    goto(index: number) {
      send({ type: "INDEX.SET", value: index })
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

    overlayProps: normalize.element({
      ...parts.overlay.attrs,
      id: dom.getOverlayId(state.context),
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      style: {
        background: "rgba(0,0,0,0.5)",
        clipPath: `path("${clipPath}")`,
        position: "absolute",
        inset: "0",
        willChange: "clip-path",
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
        opacity: typeof step?.target?.() === "undefined" ? 0 : 1,
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
      "data-step": step?.id,
      "aria-labelledby": dom.getTitleId(state.context),
      "aria-describedby": dom.getDescriptionId(state.context),
      tabIndex: -1,
      onKeyDown(event) {
        switch (event.key) {
          case "Escape":
            if (!state.context.closeOnEsc) return
            send({ type: "CLOSE", src: "keydown" })
            break
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
      id: dom.getTitleId(state.context),
      ...parts.title.attrs,
    }),

    descriptionProps: normalize.element({
      id: dom.getDescriptionId(state.context),
      ...parts.description.attrs,
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
      "aria-label": "Go to previous step",
      onClick() {
        send({ type: "PREV", src: "prevTrigger" })
      },
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      "aria-label": "Close tour",
      onClick() {
        send({ type: "CLOSE", src: "closeTrigger" })
      },
    }),
  }
}
