import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface StepChangeDetails {
  step: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ElementIds {
  root?: string | undefined
  list?: string | undefined
  triggerId?: ((index: number) => string) | undefined
  contentId?: ((index: number) => string) | undefined
}

export interface StepsProps extends DirectionProperty, CommonProperties {
  /**
   * The custom ids for the stepper elements
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the stepper
   */
  step?: number | undefined
  /**
   * The initial value of the stepper when rendered.
   * Use when you don't need to control the value of the stepper.
   */
  defaultStep?: number | undefined
  /**
   * Callback to be called when the value changes
   */
  onStepChange?: ((details: StepChangeDetails) => void) | undefined
  /**
   * Callback to be called when a step is completed
   */
  onStepComplete?: VoidFunction | undefined
  /**
   * If `true`, the stepper requires the user to complete the steps in order
   */
  linear?: boolean | undefined
  /**
   * The orientation of the stepper
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
  /**
   * The total number of steps
   */
  count?: number | undefined
}

type PropsWithDefault = "orientation" | "linear" | "count"

interface PrivateContext {
  step: number
}

type ComputedContext = Readonly<{
  percent: number
  hasNextStep: boolean
  hasPrevStep: boolean
  completed: boolean
}>

export interface StepsSchema {
  props: RequiredBy<StepsProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  state: "idle"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type StepsService = Service<StepsSchema>

export type StepsMachine = Machine<StepsSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  index: number
}

export interface ItemState {
  index: number
  triggerId: string
  contentId: string
  current: boolean
  completed: boolean
  incomplete: boolean
  last: boolean
  first: boolean
}

export interface StepsApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the stepper.
   */
  value: number
  /**
   * The percentage of the stepper.
   */
  percent: number
  /**
   * The total number of steps.
   */
  count: number
  /**
   * Whether the stepper has a next step.
   */
  hasNextStep: boolean
  /**
   * Whether the stepper has a previous step.
   */
  hasPrevStep: boolean
  /**
   * Whether the stepper is completed.
   */
  isCompleted: boolean
  /**
   * Function to set the value of the stepper.
   */
  setStep: (step: number) => void
  /**
   * Function to go to the next step.
   */
  goToNextStep: VoidFunction
  /**
   * Function to go to the previous step.
   */
  goToPrevStep: VoidFunction
  /**
   * Function to go to reset the stepper.
   */
  resetStep: VoidFunction
  /**
   * Returns the state of the item at the given index.
   */
  getItemState: (props: ItemProps) => ItemState

  getRootProps: () => T["element"]
  getListProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getTriggerProps: (props: ItemProps) => T["element"]
  getContentProps: (props: ItemProps) => T["element"]
  getNextTriggerProps: () => T["button"]
  getPrevTriggerProps: () => T["button"]
  getProgressProps: () => T["element"]
  getIndicatorProps: (props: ItemProps) => T["element"]
  getSeparatorProps: (props: ItemProps) => T["element"]
}
