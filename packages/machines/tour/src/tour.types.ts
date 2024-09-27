import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { AnchorRect, Placement } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface StepEffectArgs {
  next(): void
  goto(id: string): void
  dismiss(): void
  show(): void
  update(data: Partial<StepBaseDetails>): void
  target?: () => HTMLElement | null
}

export type StepType = "tooltip" | "dialog" | "wait" | "floating"

export type StepActionType = "next" | "prev" | "skip" | "dismiss"

export type StepActionFn = (actionMap: StepActionMap) => void

export type StepPlacement = Placement | "center"

export interface StepAction {
  /**
   * The label of the action
   */
  label: string
  /**
   * The action to perform
   */
  action?: StepActionType | StepActionFn
  /**
   * The attributes to apply to the action trigger
   */
  attrs?: Record<string, any>
}

export interface StepBaseDetails {
  /**
   * The type of the step. If no target is provided,
   * the step will be treated as a modal step.
   */
  type?: StepType
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
   * The placement of the step
   */
  placement?: StepPlacement
  /**
   * The offset between the content and the target
   */
  offset?: { mainAxis?: number; crossAxis?: number }
  /**
   * Additional metadata of the step
   */
  meta?: Record<string, any>
  /**
   * Whether to show a backdrop behind the step
   */
  backdrop?: boolean
  /**
   * Whether to show an arrow tip on the step
   */
  arrow?: boolean
  /**
   * The actions to perform when the step is completed
   */
  actions?: StepAction[]
}

export interface StepDetails extends StepBaseDetails {
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
  currentStepId: string | null
  currentStepIndex: number
  totalSteps: number
  complete: boolean
  progress: number
}

export type StepStatus = "idle" | "started" | "skipped" | "completed" | "dismissed" | "not-found"

export interface StepActionMap {
  next(): void
  prev(): void
  dismiss(): void
  goto(id: string): void
}

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

export type ElementIds = Partial<{
  content: string
  title: string
  description: string
  positioner: string
  backdrop: string
  arrow: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the tour. Useful for composition.
   */
  ids?: ElementIds
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
   * @default true
   */
  closeOnInteractOutside: boolean
  /**
   * Whether to close the tour when the user presses the escape key
   * @default true
   */
  closeOnEscape: boolean
  /**
   * Whether to allow keyboard navigation (right/left arrow keys to navigate between steps)
   * @default true
   */
  keyboardNavigation: boolean
  /**
   * Prevents interaction with the rest of the page while the tour is open
   * @default false
   */
  preventInteraction: boolean
  /**
   * The offsets to apply to the overlay
   * @default "{ x: 10, y: 10 }"
   */
  offset: Offset
  /**
   * The radius of the overlay clip path
   * @default 4
   */
  radius: number
  /**
   * The translations for the tour
   */
  translations: IntlTranslations
}

interface PrivateContext {
  /**
   * @internal
   * The rect of the current step's target element
   */
  targetRect: Required<AnchorRect>
  /**
   * @internal
   * The current placement of the menu
   */
  currentPlacement?: StepPlacement
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
  /**
   * @internal
   * The resolved target element
   */
  resolvedTarget: { value: HTMLElement | null }
}

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
  value: "tour.inactive" | "tour.active" | "step.waiting" | "target.resolving" | "target.scrolling"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface StepActionTriggerProps {
  action: StepAction
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the tour is open
   */
  open: boolean
  /**
   * The total number of steps
   */
  totalSteps: number
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
  firstStep: boolean
  /**
   * Whether the current step is the last step
   */
  lastStep: boolean
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
   * Returns the progress text
   */
  getProgressText(): string
  /**
   * Returns the progress percent
   */
  getProgressPercent(): number

  getBackdropProps(): T["element"]
  getSpotlightProps(): T["element"]
  getProgressTextProps(): T["element"]

  getPositionerProps(): T["element"]
  getArrowProps(): T["element"]
  getArrowTipProps(): T["element"]
  getContentProps(): T["element"]

  getTitleProps(): T["element"]
  getDescriptionProps(): T["element"]
  getCloseTriggerProps(): T["button"]
  getActionTriggerProps(props: StepActionTriggerProps): T["button"]
}
