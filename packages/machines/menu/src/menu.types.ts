import type { Machine, StateMachine as S } from "@ui-machines/core"
import type { PlacementOptions, Placement } from "@ui-machines/popper"
import type { Point } from "@ui-machines/rect-utils"
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
  /**
   * @computed Whether the menu is a submenu (has a parent menu)
   */
  readonly isSubmenu: boolean
  /**
   * @computed Whether the writing direction is rtl
   */
  readonly isRtl: boolean
  /**
   * The options used to dynamically position the menu
   */
  placementOptions: PlacementOptions
  /**
   * Whether to disable dynamic placement
   */
  disablePlacement?: boolean
  /**
   * The computed placement (maybe different from initial placement)
   */
  __placement?: Placement
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
