import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { AnchorRect, Placement } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface StepEffectArgs {
  next(): void
  update(args: Partial<StepInit>): void
}

export interface StepInit {
  /**
   * Function to return the target element to highlight
   */
  target?(): HTMLElement | null
  /**
   * The title of the step
   */
  title: any
  /**
   * The description of the step
   */
  description: any
  /**
   * The image or video to display in the step
   */
  media?: any
  /**
   * The placement of the step
   */
  placement?: Placement
  /**
   * Additional metadata of the step
   */
  meta?: Record<string, any>
}

export interface StepDetails extends StepInit {
  /**
   * The unique identifier of the step
   */
  id: string
  /**
   * The effect to run before the step is shown
   */
  effect?(args: StepEffectArgs): VoidFunction
}

export interface StepChangeDetails {
  step: string | null
  index: number
  count: number
  complete: boolean
}

export type StepStatus = "idle" | "started" | "skipped" | "completed" | "stopped"

export interface StatusChangeDetails {
  status: StepStatus
  step: string | null
}

export interface ProgressTextDetails {
  current: number
  total: number
}

export interface IntlTranslations {
  progressText?(details: ProgressTextDetails): string
  nextStep?: string
  prevStep?: string
  close?: string
  skip?: string
}

export interface Offset {
  x: number
  y: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The steps of the tour
   */
  steps: StepDetails[]
  /**
   * The index of the currently highlighted step
   */
  step: string | null
  /**
   * Callback when the highlighted step changes
   */
  onStepChange?(details: StepChangeDetails): void
  /**
   * Callback when the tour is opened or closed
   */
  onStatusChange?(details: StatusChangeDetails): void
  /**
   * Whether to close the tour when the user clicks outside the tour
   */
  closeOnInteractOutside: boolean
  /**
   * Whether to close the tour when the user presses the escape key
   */
  closeOnEsc: boolean
  /**
   * Whether to allow keyboard navigation (right/left arrow keys to navigate between steps)
   */
  keyboardNavigation: boolean
  /**
   * Prevents interaction with the rest of the page while the tour is open
   */
  preventInteraction: boolean
  /**
   * The offsets to apply to the overlay
   */
  offset: Offset
  /**
   * The radius of the overlay clip path
   */
  radius: number
  /**
   * The translations for the tour
   */
  translations: IntlTranslations
  /**
   * The behavior when the tour is skipped
   */
  skipBehavior: "skip-step" | "complete"
}

type PrivateContext = Context<{
  /**
   * @internal
   * The rect of the current step's target element
   */
  currentRect: Required<AnchorRect>
  /**
   * @internal
   * The current placement of the menu
   */
  currentPlacement?: Placement
  /**
   * @internal
   * The size of the boundary element (default to the window size)
   */
  boundarySize: { width: number; height: number }
  /**
   * @internal
   * The function to cleanup the target attributes
   */
  _targetCleanup?: VoidFunction
  /**
   * @internal
   * The function to cleanup the step effects
   */
  _effectCleanup?: VoidFunction
}>

type ComputedContext = Readonly<{
  /**
   * The current step details
   */
  currentStep: StepDetails | null
  /**
   * The index of the current step
   */
  currentStepIndex: number
  /**
   * Whether there is a next step
   */
  hasNextStep: boolean
  /**
   * Whether there is a previous step
   */
  hasPrevStep: boolean
  /**
   * Whether the current step is the first step
   */
  isFirstStep: boolean
  /**
   * Whether the current step is the last step
   */
  isLastStep: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "closed" | "open"
  value: "closed" | "open" | "scrolling"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The index of the current step
   */
  currentIndex: number
  /**
   * The current step details
   */
  currentStep: StepDetails | null
  /**
   * Whether there is a next step
   */
  hasNextStep: boolean
  /**
   * Whether there is a previous step
   */
  hasPrevStep: boolean
  /**
   * Whether the current step is the first step
   */
  isFirstStep: boolean
  /**
   * Whether the current step is the last step
   */
  isLastStep: boolean
  /**
   * Add a new step to the tour
   */
  addStep(step: StepDetails): void
  /**
   * Remove a step from the tour
   */
  removeStep(id: string): void
  /**
   * Update a step in the tour with partial details
   */
  updateStep(id: string, stepOverrides: Partial<StepDetails>): void
  /**
   * Set the steps of the tour
   */
  setSteps(steps: StepDetails[]): void
  /**
   * Set the current step of the tour
   */
  setStep(id: string): void
  /**
   * Start the tour at a specific step (or the first step if not provided)
   */
  start(id?: string): void
  /**
   * Check if a step is valid
   */
  isValidStep(id: string): boolean
  /**
   * Check if a step is visible
   */
  isCurrentStep(id: string): boolean
  /**
   * Move to the next step
   */
  next(): void
  /**
   * Move to the previous step
   */
  prev(): void
  /**
   * Skip the tour. The behavior is defined by the `skipBehavior` option
   */
  skip(): void
  /**
   * Get the progress text
   */
  getProgressText(): string

  overlayProps: T["element"]
  spotlightProps: T["element"]
  progressTextProps: T["element"]

  positionerProps: T["element"]
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  contentProps: T["element"]

  titleProps: T["element"]
  descriptionProps: T["element"]

  nextTriggerProps: T["button"]
  prevTriggerProps: T["button"]
  closeTriggerProps: T["button"]
  skipTriggerProps: T["button"]
}
