import type { Machine, StateMachine as S } from "@zag-js/core"
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
  root?: string
  list?: string
  triggerId?(index: number): string
  contentId?(index: number): string
}

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The custom ids for the stepper elements
   */
  ids?: ElementIds
  /**
   * The current value of the stepper
   */
  step: number
  /**
   * Callback to be called when the value changes
   */
  onStepChange?(details: StepChangeDetails): void
  /**
   * Callback to be called when a step is completed
   */
  onStepComplete?: VoidFunction
  /**
   * If `true`, the stepper requires the user to complete the steps in order
   */
  linear?: boolean
  /**
   * The orientation of the stepper
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The total number of steps
   */
  count: number
}

interface PrivateContext {}

type ComputedContext = Readonly<{
  percent: number
  hasNextStep: boolean
  hasPrevStep: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

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
  last: boolean
  first: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
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
   * Function to set the value of the stepper.
   */
  setValue(value: number): void
  /**
   * Function to go to the next step.
   */
  goToNextStep(): void
  /**
   * Function to go to the previous step.
   */
  goToPrevStep(): void
  /**
   * Function to go to reset the stepper.
   */
  resetStep(): void
  /**
   * Returns the state of the item at the given index.
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getListProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getTriggerProps(props: ItemProps): T["element"]
  getContentProps(props: ItemProps): T["element"]
  getNextTriggerProps(): T["button"]
  getPrevTriggerProps(): T["button"]
  getProgressProps(): T["element"]
  getIndicatorProps(props: ItemProps): T["element"]
  getSeparatorProps(props: ItemProps): T["element"]
}
