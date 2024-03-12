import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  list: string
  trigger(id: string): string
  link(id: string): string
  content(id: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the nav menu. Useful for composition.
   */
  ids?: ElementIds
  /**
   *  The orientation of the nav menu triggers.
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The `id` of the active menu.
   */
  activeId: string | null
  /**
   * The `id` of the highlighted link.
   */
  highlightedLinkId: string | null
  /**
   * The `id` of the active link for the current page.
   */
  activeLinkId: string | null
}

interface PrivateContext {
  /**
   * @internal
   * The `id` of the focused menu item.
   */
  focusedId: string | null
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "collapsed" | "expanded"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
