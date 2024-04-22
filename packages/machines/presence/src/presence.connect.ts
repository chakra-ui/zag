import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { MachineApi, Send, State } from "./presence.types"

export function connect<T extends PropTypes>(state: State, send: Send, _normalize: NormalizeProps<T>): MachineApi {
  return {
    present: state.matches("mounted", "unmountSuspended"),
    setNode(node: HTMLElement | null) {
      if (!node) return
      send({ type: "NODE.SET", node })
    },
  }
}
