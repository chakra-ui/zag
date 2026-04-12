import { mergeProps } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./tour.anatomy"
import * as dom from "./tour.dom"
import type { StepActionMap, TourApi, TourService } from "./tour.types"
import { getClipPath } from "./utils/clip-path"
import { getEffectiveStepIndex, getEffectiveSteps, isDialogStep, isTooltipPlacement, isTooltipStep } from "./utils/step"

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
    positioned: context.get("positioned"),
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
    skip() {
      send({ type: "SKIP", src: "actionTrigger" })
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
      const index = getEffectiveStepIndex(steps, step?.id)
      const total = getEffectiveSteps(steps).length
      return ((index + 1) / total) * 100
    },
    getProgressText() {
      const index = getEffectiveStepIndex(steps, step?.id)
      const total = getEffectiveSteps(steps).length
      const details = { current: index, total }
      return prop("translations").progressText?.(details) ?? ""
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs(scope.id),
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        style: {
          "--tour-layer": 0,
          clipPath: isTooltipStep(step) ? `path("${clipPath}")` : undefined,
          position: isDialogStep(step) ? "fixed" : "absolute",
          inset: "0",
          willChange: isTooltipStep(step) ? "clip-path" : undefined,
        },
      })
    },

    getSpotlightProps() {
      return normalize.element({
        ...parts.spotlight.attrs(scope.id),
        hidden: !open || !step?.target?.(),
        style: {
          "--tour-layer": 1,
          position: "absolute",
          width: toPx(targetRect.width),
          height: toPx(targetRect.height),
          left: toPx(targetRect.x),
          top: toPx(targetRect.y),
          borderRadius: toPx(prop("spotlightRadius")),
          pointerEvents: "none",
        },
      })
    },

    getProgressTextProps() {
      return normalize.element({
        ...parts.progressText.attrs(scope.id),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
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
        ...parts.arrow.attrs(scope.id),
        dir: prop("dir"),
        hidden: step?.type !== "tooltip",
        style: step?.type === "tooltip" ? popperStyles.arrow : undefined,
        opacity: hasTarget ? undefined : 0,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs(scope.id),
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
        ...parts.title.attrs(scope.id),
        id: dom.getTitleId(scope),
        "data-placement": hasTarget ? placement : "center",
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs(scope.id),
        id: dom.getDescriptionId(scope),
        "data-placement": hasTarget ? placement : "center",
      })
    },

    getCloseTriggerProps() {
      return normalize.element({
        ...parts.closeTrigger.attrs(scope.id),
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
        ...parts.actionTrigger.attrs(scope.id),
        type: "button",
        ...attrs,
        ...actionProps,
      })
    },
  }
}
