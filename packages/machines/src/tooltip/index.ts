import { tooltipConnect } from "./tooltip.connect"
import { tooltipMachine, tooltipStore } from "./tooltip.machine"

export const tooltip = {
  machine: tooltipMachine,
  connect: tooltipConnect,
  store: tooltipStore,
}

export type { TooltipMachineState, TooltipMachineContext } from "./tooltip.machine"
