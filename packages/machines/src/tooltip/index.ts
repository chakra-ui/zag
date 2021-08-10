import { connectTooltipMachine } from "./tooltip.connect"
import { tooltipMachine, tooltipStore } from "./tooltip.machine"

export const tooltip = {
  machine: tooltipMachine,
  connect: connectTooltipMachine,
  store: tooltipStore,
}

export type { TooltipMachineState, TooltipMachineContext } from "./tooltip.machine"
