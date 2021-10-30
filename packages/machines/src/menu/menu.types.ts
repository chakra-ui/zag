import { Machine, StateMachine as S } from "@ui-machines/core"
import { PointValue } from "tiny-point"
import type { Context } from "../utils"

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
  pointerExitPoint: PointValue | null
  hoverId: string | null
}>

export type MenuState = S.State<MenuMachineContext, MenuMachineState>

export type MenuSend = (event: S.Event<S.AnyEventObject>) => void

export type MenuItemProps = {
  id?: string
  disabled?: boolean
  valueText?: string
}

export type MenuOptionItemProps = MenuItemProps & {
  type: "radio" | "checkbox"
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
