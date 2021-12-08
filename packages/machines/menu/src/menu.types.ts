import { Machine, StateMachine as S } from "@ui-machines/core"
import { Point } from "@ui-machines/rect-utils"
import type { Context } from "@ui-machines/types"

export type Service = Machine<MachineContext, MachineState>

export type MachineState = {
  value: "unknown" | "idle" | "open" | "close" | "opening" | "closing" | "opening:contextmenu"
}

export type MachineContext = Context<{
  /**
   * The `id` of the active menu item.
   */
  activeId: string | null
  /**
   * Function called when a menu item is selected.
   */
  onSelect?: (value: string) => void
  /**
   * The menu's parent. Used for submenus.
   */
  parent: Service | null
  /**
   * The child menus. Used for submenus.
   */
  children: Record<string, Service>
  /**
   * The orientation of the menu.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The polygon tells us if the pointer is
   * moving toward the submenu
   */
  intentPolygon: Point[] | null
  /**
   * Whether to suspend listening to pointer-over events on a submenu.
   * This is used to prevent the menu from closing when the user is hovering to a submenu.
   */
  suspendPointer: boolean
  /**
   * The `id` of the menu item that is currently being hovered.
   */
  hoverId: string | null
  /**
   * Whether to loop the keyboard navigation.
   */
  loop: boolean
  /**
   * For context menu, the point where the context menu is opened.
   */
  contextMenuPoint: Point | null
  readonly isSubmenu: boolean
  readonly isRtl: boolean
  readonly isHorizontal: boolean
  readonly isVertical: boolean
}>

export type State = S.State<MachineContext, MachineState>

export type Send = (event: S.Event<S.AnyEventObject>) => void

export type ItemProps = {
  id: string
  disabled?: boolean
  valueText?: string
}

export type OptionItemProps = ItemProps & {
  type: "radio" | "checkbox"
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
