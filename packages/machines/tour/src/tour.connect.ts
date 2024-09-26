import { mergeProps } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import { dom } from "./tour.dom"
import type { MachineApi, Send, State, StepActionMap } from "./tour.types"
import { getClipPath } from "./utils/clip-path"
import { findStepIndex, isTooltipPlacement } from "./utils/step"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const open = state.hasTag("open")

  const steps = Array.from(state.context.steps)
  const index = state.context.currentStepIndex
  const step = state.context.currentStep
  const hasTarget = typeof step?.target?.() !== "undefined"

  const hasNextStep = state.context.hasNextStep
  const hasPrevStep = state.context.hasPrevStep

  const firstStep = state.context.isFirstStep
  const lastStep = state.context.isLastStep

  const placement = state.context.currentPlacement
  const currentRect = state.context.currentRect

  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: isTooltipPlacement(placement) ? placement : undefined,
  })

  const clipPath = getClipPath({
    rect: currentRect,
    rootSize: state.context.boundarySize,
    radius: state.context.radius,
  })

  const actionMap: StepActionMap = {
    next() {
      send({ type: "NEXT", src: "actionTrigger" })
    },
    prev() {
      send({ type: "PREV", src: "actionTrigger" })
    },
    dismiss() {
      send({ type: "DISMISS", src: "actionTrigger" })
    },
    goto(id) {
      send({ type: "STEP.SET", value: id, src: "actionTrigger" })
    },
  }

  return {
    open: open,
    totalSteps: steps.length,
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
    getProgressPercent() {
      return (index / steps.length) * 100
    },
    getProgressText() {
      const effectiveSteps = steps.filter((step) => step.type !== "wait")
      const index = findStepIndex(effectiveSteps, step?.id)
      const details = { current: index, total: effectiveSteps.length }
      return state.context.translations.progressText?.(details) ?? ""
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(state.context),
        dir: state.context.dir,
        hidden: !open,
        "data-state": open ? "open" : "closed",
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
        hidden: !open || !step?.target?.(),
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
        "data-type": step?.type,
        "data-placement": state.context.currentPlacement,
        style: step?.type === "tooltip" ? popperStyles.floating : undefined,
      })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(state.context),
        ...parts.arrow.attrs,
        dir: state.context.dir,
        hidden: step?.type !== "tooltip",
        style: step?.type === "tooltip" ? popperStyles.arrow : undefined,
        opacity: hasTarget ? undefined : 0,
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
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        "data-placement": state.context.currentPlacement,
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

    getCloseTriggerProps() {
      return normalize.element({
        ...parts.closeTrigger.attrs,
        "aria-label": state.context.translations.close,
        onClick: actionMap.dismiss,
      })
    },

    getActionTriggerProps(props) {
      const { action, attrs } = props.action

      let actionProps: Record<string, any> = {}

      switch (action) {
        case "next":
          actionProps = {
            "data-type": "next",
            disabled: !hasNextStep,
            "data-disabled": dataAttr(!hasNextStep),
            "aria-label": state.context.translations.nextStep,
            onClick: actionMap.next,
          }
          break

        case "prev":
          actionProps = {
            "data-type": "prev",
            disabled: !hasPrevStep,
            "data-disabled": dataAttr(!hasPrevStep),
            "aria-label": state.context.translations.prevStep,
            onClick: actionMap.prev,
          }
          break

        case "dismiss":
          actionProps = {
            "data-type": "close",
            "aria-label": state.context.translations.close,
            onClick: actionMap.dismiss,
          }
          break

        default:
          actionProps = {
            "data-type": "custom",
            onClick() {
              if (typeof action === "function") {
                action(actionMap)
              }
            },
          }
          break
      }

      return normalize.button({
        ...parts.actionTrigger.attrs,
        type: "button",
        ...attrs,
        ...actionProps,
      })
    },
  }
}
