import { tooltipConnect } from "./tooltip.connect"
import { tooltipMachine } from "./tooltip.machine"
import { tooltipStore } from "./tooltip.store"

export const tooltip = {
  machine: tooltipMachine,
  connect: tooltipConnect,
  store: tooltipStore,
}

export type { TooltipMachineContext, TooltipMachineState } from "./tooltip.types"
