import type { Placement } from "@zag-js/popper"
import type { StepDetails, StepPlacement } from "../tour.types"

export const isTooltipStep = (
  step: StepDetails | null,
): step is Omit<StepDetails, "placement"> & { placement: Placement } => {
  return step?.type === "tooltip"
}

export const isDialogStep = (step: StepDetails | null) => {
  return step?.type === "dialog"
}

export const isWaitStep = (step: StepDetails | null) => {
  return step?.type === "wait"
}

export const getEffectiveSteps = (steps: StepDetails[]) => {
  return steps.filter((step) => step.type !== "wait")
}

export const getProgress = (steps: StepDetails[], stepIndex: number) => {
  const effectiveLength = getEffectiveSteps(steps).length
  return (stepIndex + 1) / effectiveLength
}

export const getEffectiveStepIndex = (steps: StepDetails[], stepId: string | null | undefined) => {
  const effectiveSteps = getEffectiveSteps(steps)
  return findStepIndex(effectiveSteps, stepId)
}

export const isTooltipPlacement = (placement: StepPlacement | undefined): placement is Placement => {
  return placement != null && placement != "center"
}

const normalizeStep = (step: StepDetails): StepDetails => {
  if (step.type === "floating") {
    return { backdrop: false, arrow: false, placement: "bottom-end", ...step }
  }

  if (step.target == null || step.type === "dialog") {
    return { type: "dialog", placement: "center", backdrop: true, ...step }
  }

  if (!step.type || step.type === "tooltip") {
    return { type: "tooltip", arrow: true, backdrop: true, ...step }
  }

  return step
}

export const findStep = (steps: StepDetails[], id: string | undefined | null): StepDetails | null => {
  const res = id != null ? steps.find((step) => step.id === id) : null
  return res ? normalizeStep(res) : null
}

export const findStepIndex = (steps: StepDetails[], id: string | undefined | null): number => {
  return id != null ? steps.findIndex((step) => step.id === id) : -1
}
