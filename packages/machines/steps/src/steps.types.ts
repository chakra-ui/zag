import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/** The value of the position past the last step */
export const COMPLETE = "__complete__"

/* -----------------------------------------------------------------------------
 * Item
 * -----------------------------------------------------------------------------*/

export interface StepItem {
  /**
   * The unique value of the step
   */
  value: string
  /**
   * The title of the step. Used in the progress announcement when set.
   */
  title?: string | undefined
  /**
   * The description of the step
   */
  description?: string | undefined
  /**
   * Whether the step is removed from the flow. Disabled steps are jumped over by next/prev.
   */
  disabled?: boolean | undefined
  /**
   * Whether the step can be left without being completed
   */
  optional?: boolean | undefined
  /**
   * Whether a completed step can be returned to
   * @default true
   */
  editable?: boolean | undefined
  /**
   * Whether the step fails validation. An invalid step blocks forward navigation.
   */
  invalid?: boolean | undefined
}

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string | null
  /** The position of the step in the flow, excluding disabled steps */
  index: number
  previousValue: string | null
}

export interface CompletedChangeDetails {
  completedValues: string[]
}

export interface CompleteDetails {
  completedValues: string[]
}

export type BlockReason = "disabled" | "locked" | "invalid" | "incomplete"

export interface NavigationBlockedDetails {
  value: string | null
  index: number
  /** The target step, or `COMPLETE` when heading past the last step */
  targetValue: string
  /** The step responsible for the block */
  blockedBy: string | null
  reason: BlockReason
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ElementIds {
  root?: string | undefined
  list?: string | undefined
  triggerId?: ((value: string) => string) | undefined
  contentId?: ((value: string) => string) | undefined
}

export interface ProgressTextDetails {
  /**
   * The position of the current step among the steps in the flow
   */
  index: number
  /**
   * The number of steps in the flow
   */
  count: number
  /**
   * The rounded completion percentage
   */
  percent: number
  /**
   * The current step's title, if any
   */
  title: string | undefined
  /**
   * Whether the flow is complete
   */
  complete: boolean
}

export interface IntlTranslations {
  /**
   * The accessible name of the progress bar
   */
  progressLabel?: string | undefined
  /**
   * The text announced for the progress bar's value
   */
  progressText?: ((details: ProgressTextDetails) => string) | undefined
}

export interface StepsProps<T extends StepItem = StepItem> extends DirectionProperty, CommonProperties {
  /**
   * The custom ids for the stepper elements
   */
  ids?: ElementIds | undefined
  /**
   * The localized messages to use
   */
  translations?: IntlTranslations | undefined
  /**
   * The steps of the stepper
   */
  items: T[]
  /**
   * The controlled value of the stepper. `COMPLETE` is the position past the last step.
   */
  value?: string | undefined
  /**
   * The initial value of the stepper when rendered.
   * Use when you don't need to control the value of the stepper.
   */
  defaultValue?: string | undefined
  /**
   * Callback to be called when the value changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The controlled values of the completed steps
   */
  completedValues?: string[] | undefined
  /**
   * The initial values of the completed steps when rendered.
   * Use when you don't need to control the completed steps.
   */
  defaultCompletedValues?: string[] | undefined
  /**
   * Callback to be called when the completed steps change.
   * Also fires on `goToNext`, which marks the step it leaves as completed.
   */
  onCompletedChange?: ((details: CompletedChangeDetails) => void) | undefined
  /**
   * Callback to be called when navigation is blocked
   */
  onNavigationBlocked?: ((details: NavigationBlockedDetails) => void) | undefined
  /**
   * Callback to be called when the user moves past the last step.
   * With a controlled value, it fires on each request, whether or not you apply it.
   */
  onComplete?: ((details: CompleteDetails) => void) | undefined
  /**
   * If `true`, the stepper requires the user to complete the steps in order
   */
  linear?: boolean | undefined
  /**
   * The orientation of the stepper
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
}

type PropsWithDefault = "orientation" | "linear" | "items" | "defaultCompletedValues"

interface PrivateContext {
  value: string | null
  completedValues: string[]
}

type ComputedContext = Readonly<{
  effectiveItems: StepItem[]
}>

interface Refs {
  lastPosition: number | null
}

export interface StepsSchema<T extends StepItem = StepItem> {
  props: StepsProps<T>
  defaultPropKey: PropsWithDefault
  context: PrivateContext
  refs: Refs
  computed: ComputedContext
  state: "idle"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type StepsService<T extends StepItem = StepItem> = Service<StepsSchema<T>>

export type StepsMachine<T extends StepItem = StepItem> = Machine<StepsSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the step item. Pass `COMPLETE` to `getContentProps` for the completed content.
   */
  value: string
}

export interface ItemState {
  value: string
  /** The position of the step in the flow, or `-1` when disabled */
  index: number
  triggerId: string
  contentId: string
  current: boolean
  completed: boolean
  /** Whether the flow moved past the step without completing it */
  skipped: boolean
  invalid: boolean
  disabled: boolean
  optional: boolean
  /** Whether the step is completed and cannot be returned to */
  locked: boolean
  /** Whether the step can be navigated to right now */
  reachable: boolean
}

export interface StepsApi<T extends PropTypes = PropTypes, V extends StepItem = StepItem> {
  /**
   * The steps in the flow, excluding disabled ones
   */
  items: V[]
  /**
   * The value of the current step, `COMPLETE` past the last step, or `null` when there are no steps
   */
  value: string | null
  /**
   * The position of the current step in the flow
   */
  index: number
  /**
   * The current step item
   */
  item: V | null
  /**
   * The number of steps in the flow, excluding disabled ones
   */
  count: number
  /**
   * The percentage of the stepper
   */
  percent: number
  /**
   * Whether the stepper has moved past the last step
   */
  complete: boolean
  /**
   * The values of the completed steps
   */
  completedValues: string[]
  /**
   * Whether the stepper has a next step
   */
  hasNextStep: boolean
  /**
   * Whether the stepper has a previous step
   */
  hasPrevStep: boolean
  /**
   * Whether the current step is optional and can be skipped
   */
  canSkip: boolean
  /**
   * Whether `goToNextStep` would complete the stepper
   */
  canComplete: boolean
  /**
   * Returns the state of the item with the given value
   */
  getItemState: (props: ItemProps) => ItemState
  /**
   * Function to set the value of the stepper
   */
  setValue: (value: string) => void
  /**
   * Function to go to the next step
   */
  goToNextStep: VoidFunction
  /**
   * Function to go to the previous step
   */
  goToPrevStep: VoidFunction
  /**
   * Function to skip the current step. Only works when the step is optional.
   */
  skipStep: VoidFunction
  /**
   * Function to reset the stepper to its initial state
   */
  resetStep: VoidFunction
  /**
   * Function to set the completed steps
   */
  setCompletedValues: (values: string[]) => void

  getRootProps: () => T["element"]
  getListProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getTriggerProps: (props: ItemProps) => T["element"]
  getContentProps: (props: ItemProps) => T["element"]
  getNextTriggerProps: () => T["button"]
  getPrevTriggerProps: () => T["button"]
  getSkipTriggerProps: () => T["button"]
  getProgressProps: () => T["element"]
  getIndicatorProps: (props: ItemProps) => T["element"]
  getSeparatorProps: (props: ItemProps) => T["element"]
}
