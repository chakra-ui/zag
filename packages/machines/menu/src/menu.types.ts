import { Machine, StateMachine as S } from "@ui-machines/core"
import type { Context } from "@ui-machines/types"
import { Point } from "@ui-machines/point-utils"

export type MenuMachine = Machine<MenuMachineContext, MenuMachineState>

export type MenuMachineState = {
  value: "unknown" | "idle" | "open" | "close" | "opening" | "closing"
}

export type MenuMachineContext = Context<{
  activeId: string | null
  onSelect?: (value: string) => void
  parent: MenuMachine | null
  children: Record<string, MenuMachine>
  orientation: "horizontal" | "vertical"
  /**
   * The polygon tells us if the pointer is
   * moving toward the submenu
   */
  intentPolygon: Point[] | null
  suspendPointer: boolean
  hoverId: string | null
  loop: boolean
  readonly isSubmenu: boolean
  readonly isRtl: boolean
  readonly isHorizontal: boolean
  readonly isVertical: boolean
}>

export type MenuState = S.State<MenuMachineContext, MenuMachineState>

export type MenuSend = (event: S.Event<S.AnyEventObject>) => void

export type MenuItemProps = {
  id: string
  disabled?: boolean
  valueText?: string
}

export type MenuOptionItemProps = MenuItemProps & {
  type: "radio" | "checkbox"
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
