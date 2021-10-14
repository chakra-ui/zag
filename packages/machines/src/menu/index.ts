import { menuConnect } from "./menu.connect"
import { menuMachine } from "./menu.machine"

export const menu = {
  machine: menuMachine,
  connect: menuConnect,
}

export type { MenuMachineContext, MenuMachineState } from "./menu.types"
