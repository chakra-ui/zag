import { tabsConnect } from "./tabs.connect"
import { tabsMachine } from "./tabs.machine"

export const tabs = {
  machine: tabsMachine,
  connect: tabsConnect,
}

export type { TabsMachineContext, TabsMachineState } from "./tabs.types"
