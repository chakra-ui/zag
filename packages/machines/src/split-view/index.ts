import { connectSplitViewMachine } from "./split-view.connect"
import { splitViewMachine } from "./split-view.machine"

export const splitView = {
  machine: splitViewMachine,
  connect: connectSplitViewMachine,
}
