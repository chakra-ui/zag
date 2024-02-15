import type { StateMachine as S } from "@zag-js/core"
import type { AnchorRect, Placement } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

export interface StepDetails {
  id: string
  target?(): HTMLElement | null
  title: any
  description: any
  placement?: Placement
  [key: string]: any
}

export interface StepChangeDetails {
  step: string | null
  index: number
  count: number
  complete: boolean
}

export interface OpenChangeDetails {
  open: boolean
}

interface PublicContext extends DirectionProperty, CommonProperties {
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
  onOpenChange?(details: OpenChangeDetails): void
  /**
   * Callback when the tour is completed
   */
  onCompleted?(): void
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
   * Whether the tour is open
   */
  open?: boolean
  /**
   *  Whether the tour's open state is controlled by the user
   */
  "open.controlled"?: boolean
  /**
   * The offsets to apply to the overlay
   */
  offset: { x: number; y: number }
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
   * The size of the window
   */
  windowSize: { width: number; height: number }
  /**
   * @internal
   * The function to cleanup
   */
  _cleanup?: () => void
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
  value: "closed" | "open" | "open:prepare"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
