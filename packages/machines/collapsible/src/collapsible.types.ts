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

export interface CollapsibleProps extends CommonProperties, DirectionProperty {
  ids?: ElementIds
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (details: OpenChangeDetails) => void
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

export interface CollapsibleApi<T extends PropTypes = PropTypes> {
  open: boolean
  visible: boolean
  disabled: boolean
  setOpen(open: boolean): void
  measureSize(): void

  getRootProps(): T["element"]
  getTriggerProps(): T["button"]
  getContentProps(): T["element"]
}
