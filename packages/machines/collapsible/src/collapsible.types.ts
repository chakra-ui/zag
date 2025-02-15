import type { Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

export type ElementIds = Partial<{
  root: string
  content: string
  trigger: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface CollapsibleProps extends CommonProperties, DirectionProperty {
  /**
   * The ids of the elements in the collapsible. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the collapsible is open.
   */
  open?: boolean
  /**
   * The default open state of the collapsible.
   */
  defaultOpen?: boolean
  /**
   * The callback invoked when the open state changes.
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The callback invoked when the exit animation completes.
   */
  onExitComplete?: () => void
}

export interface CollapsibleSchema {
  state: "open" | "closed" | "closing"
  props: CollapsibleProps
  context: {
    size: { width: number; height: number }
    initial: boolean
  }
  refs: {
    stylesRef: any
    cleanup: VoidFunction | undefined
  }

  guard: "isOpenControlled"

  event:
    | { type: "controlled.open" }
    | { type: "controlled.close" }
    | { type: "open" }
    | { type: "close" }
    | { type: "size.measure" }
    | { type: "animation.end" }

  action:
    | "setInitial"
    | "clearInitial"
    | "cleanupNode"
    | "measureSize"
    | "computeSize"
    | "invokeOnOpen"
    | "invokeOnClose"
    | "invokeOnExitComplete"
    | "toggleVisibility"

  effect: "trackEnterAnimation" | "trackExitAnimation"
}

export type CollapsibleService = Service<CollapsibleSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface CollapsibleApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the collapsible is open.
   */
  open: boolean
  /**
   * Whether the collapsible is visible (open or closing)
   */
  visible: boolean
  /**
   * Whether the collapsible is disabled
   */
  disabled: boolean
  /**
   * Function to open or close the collapsible.
   */
  setOpen(open: boolean): void
  /**
   * Function to measure the size of the content.
   */
  measureSize(): void

  getRootProps(): T["element"]
  getTriggerProps(): T["button"]
  getContentProps(): T["element"]
}
