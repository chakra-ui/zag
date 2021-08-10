import { connectTabsMachine } from "./tabs.connect"
import { tabsMachine } from "./tabs.machine"

export const tabs = {
  machine: tabsMachine,
  connect: connectTabsMachine,
}

export type { TabsMachineContext, TabsMachineState } from "./tabs.machine"
