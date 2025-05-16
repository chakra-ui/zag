import { mergeProps } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tour.anatomy"
import * as dom from "./tour.dom"
import type { StepActionMap, TourApi, TourService } from "./tour.types"
import { getClipPath } from "./utils/clip-path"
import { findStepIndex, isTooltipPlacement, isTooltipStep } from "./utils/step"

export function connect<T extends PropTypes>(service: TourService, normalize: NormalizeProps<T>): TourApi<T> {
  const { state, context, computed, send, prop, scope } = service
  const open = state.hasTag("open")

  const steps = Array.from(context.get("steps"))
  const stepIndex = computed("stepIndex")
  const step = computed("step")
  const hasTarget = typeof step?.target?.() !== "undefined"

  const hasNextStep = computed("hasNextStep")
  const hasPrevStep = computed("hasPrevStep")

  const firstStep = computed("isFirstStep")
  const lastStep = computed("isLastStep")

  const placement = context.get("currentPlacement")
  const targetRect = context.get("targetRect")

  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: isTooltipPlacement(placement) ? placement : undefined,
  })

  const clipPath = getClipPath({
    enabled: isTooltipStep(step),
    rect: targetRect,
    rootSize: context.get("boundarySize"),
    radius: prop("spotlightRadius"),
  })

  const actionMap: StepActionMap = {
    next() {
      send({ type: "STEP.NEXT", src: "actionTrigger" })
    },
    prev() {
      send({ type: "STEP.PREV", src: "actionTrigger" })
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
    stepIndex,
    step,
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
      send({ type: "START", value: id })
    },
    isValidStep(id) {
      return steps.some((step) => step.id === id)
    },
    isCurrentStep(id) {
      return Boolean(step?.id === id)
    },
    next() {
      send({ type: "STEP.NEXT" })
    },
    prev() {
      send({ type: "STEP.PREV" })
    },
    getProgressPercent() {
      return (stepIndex / steps.length) * 100
    },
    getProgressText() {
      const effectiveSteps = steps.filter((step) => step.type !== "wait")
      const index = findStepIndex(effectiveSteps, step?.id)
      const details = { current: index, total: effectiveSteps.length }
      return prop("translations").progressText?.(details) ?? ""
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(scope),
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        style: {
          "--tour-layer": 0,
          clipPath: isTooltipStep(step) ? `path("${clipPath}")` : undefined,
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
          "--tour-layer": 1,
          position: "absolute",
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          left: `${targetRect.x}px`,
          top: `${targetRect.y}px`,
          borderRadius: `${prop("spotlightRadius")}px`,
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
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
        "data-type": step?.type,
        "data-placement": placement,
        style: {
          "--tour-layer": 2,
          ...(step?.type === "tooltip" && popperStyles.floating),
        },
      })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(scope),
        ...parts.arrow.attrs,
        dir: prop("dir"),
        hidden: step?.type !== "tooltip",
        style: step?.type === "tooltip" ? popperStyles.arrow : undefined,
        opacity: hasTarget ? undefined : 0,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        dir: prop("dir"),
        role: "alertdialog",
        "aria-modal": "true",
        "aria-live": "polite",
        "aria-atomic": "true",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        "data-placement": placement,
        "data-step": step?.id,
        "aria-labelledby": dom.getTitleId(scope),
        "aria-describedby": dom.getDescriptionId(scope),
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!prop("keyboardNavigation")) return
          const isRtl = prop("dir") === "rtl"
          switch (event.key) {
            case "ArrowRight":
              if (!hasNextStep) return
              send({ type: isRtl ? "STEP.PREV" : "STEP.NEXT", src: "keydown" })
              break
            case "ArrowLeft":
              if (!hasPrevStep) return
              send({ type: isRtl ? "STEP.NEXT" : "STEP.PREV", src: "keydown" })
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
        id: dom.getTitleId(scope),
        "data-placement": hasTarget ? placement : "center",
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(scope),
        "data-placement": hasTarget ? placement : "center",
      })
    },

    getCloseTriggerProps() {
      return normalize.element({
        ...parts.closeTrigger.attrs,
        "data-type": step?.type,
        "aria-label": prop("translations").close,
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
            "aria-label": prop("translations").nextStep,
            onClick: actionMap.next,
          }
          break

        case "prev":
          actionProps = {
            "data-type": "prev",
            disabled: !hasPrevStep,
            "data-disabled": dataAttr(!hasPrevStep),
            "aria-label": prop("translations").prevStep,
            onClick: actionMap.prev,
          }
          break

        case "dismiss":
          actionProps = {
            "data-type": "close",
            "aria-label": prop("translations").close,
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
