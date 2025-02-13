import type { EventObject, Service } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { Placement } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { Point, Rect, Size } from "./utils/rect"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface StepEffectArgs {
  next(): void
  goto(id: string): void
  dismiss(): void
  show(): void
  update(data: Partial<StepBaseDetails>): void
  target?: (() => HTMLElement | null) | undefined
}

export type StepType = "tooltip" | "dialog" | "wait" | "floating"

export type StepActionType = "next" | "prev" | "dismiss"

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
  action?: StepActionType | StepActionFn | undefined
  /**
   * The attributes to apply to the action trigger
   */
  attrs?: Record<string, any> | undefined
}

export interface StepBaseDetails {
  /**
   * The type of the step. If no target is provided,
   * the step will be treated as a modal step.
   */
  type?: StepType | undefined
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
  placement?: StepPlacement | undefined
  /**
   * The offset between the content and the target
   */
  offset?: { mainAxis?: number; crossAxis?: number } | undefined
  /**
   * Additional metadata of the step
   */
  meta?: Record<string, any> | undefined
  /**
   * Whether to show a backdrop behind the step
   */
  backdrop?: boolean | undefined
  /**
   * Whether to show an arrow tip on the step
   */
  arrow?: boolean | undefined
  /**
   * The actions to perform when the step is completed
   */
  actions?: StepAction[] | undefined
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
  stepId: string | null
  stepIndex: number
  totalSteps: number
  complete: boolean
  progress: number
}

export interface StepsChangeDetails {
  steps: StepDetails[]
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
  stepId: string | null
  stepIndex: number
}

export interface ProgressTextDetails {
  current: number
  total: number
}

export interface IntlTranslations {
  progressText?(details: ProgressTextDetails): string
  nextStep?: string | undefined
  prevStep?: string | undefined
  close?: string | undefined
  skip?: string | undefined
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

export interface TourProps extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the tour. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The steps of the tour
   */
  steps?: StepDetails[] | undefined
  /**
   * The id of the currently highlighted step
   */
  stepId?: string | null | undefined
  /**
   * Callback when the highlighted step changes
   */
  onStepChange?: ((details: StepChangeDetails) => void) | undefined
  /**
   * Callback when the steps change
   */
  onStepsChange?: ((details: StepsChangeDetails) => void) | undefined
  /**
   * Callback when the tour is opened or closed
   */
  onStatusChange?: ((details: StatusChangeDetails) => void) | undefined
  /**
   * Whether to close the tour when the user clicks outside the tour
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the tour when the user presses the escape key
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * Whether to allow keyboard navigation (right/left arrow keys to navigate between steps)
   * @default true
   */
  keyboardNavigation?: boolean | undefined
  /**
   * Prevents interaction with the rest of the page while the tour is open
   * @default false
   */
  preventInteraction?: boolean | undefined
  /**
   * The offsets to apply to the spotlight
   * @default "{ x: 10, y: 10 }"
   */
  spotlightOffset?: Point | undefined
  /**
   * The radius of the spotlight clip path
   * @default 4
   */
  spotlightRadius?: number | undefined
  /**
   * The translations for the tour
   */
  translations?: IntlTranslations | undefined
}

type PropsWithDefault =
  | "spotlightOffset"
  | "spotlightRadius"
  | "translations"
  | "closeOnInteractOutside"
  | "closeOnEscape"
  | "keyboardNavigation"
  | "preventInteraction"

interface PrivateContext {
  /**
   * The rect of the current step's target element
   */
  targetRect: Rect
  /**
   * The current placement of the menu
   */
  currentPlacement?: StepPlacement | undefined
  /**
   * The size of the boundary element (default to the window size)
   */
  boundarySize: Size
  /**
   * The resolved target element
   */
  resolvedTarget: HTMLElement | null
  /**
   * The id of the current step
   */
  stepId: string | null
  /**
   * The steps of the tour
   */
  steps: StepDetails[]
}

interface Refs {
  /**
   * The function to cleanup the target attributes
   */
  _targetCleanup?: VoidFunction | undefined
  /**
   * The function to cleanup the step effects
   */
  _effectCleanup?: VoidFunction | undefined
}

type ComputedContext = Readonly<{
  /**
   * The current step details
   */
  step: StepDetails | null
  /**
   * The index of the current step
   */
  stepIndex: number
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
   * The progress of the tour
   */
  progress: number
}>

export interface TourSchema {
  tag: "open" | "closed"
  state: "tour.inactive" | "tour.active" | "step.waiting" | "target.resolving" | "target.scrolling"
  props: RequiredBy<TourProps, PropsWithDefault>
  context: PrivateContext
  refs: Refs
  computed: ComputedContext
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type TourService = Service<TourSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface StepActionTriggerProps {
  action: StepAction
}

export interface TourApi<T extends PropTypes = PropTypes> {
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
  stepIndex: number
  /**
   * The current step details
   */
  step: StepDetails | null
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

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Point } from "./utils/rect"
