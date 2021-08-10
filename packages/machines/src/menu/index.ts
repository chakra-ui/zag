import { connectMenuMachine } from "./menu.connect"
import { menuMachine } from "./menu.machine"

export const menu = {
  machine: menuMachine,
  connect: connectMenuMachine,
}

export type { MenuMachineContext, MenuMachineState } from "./menu.machine"
