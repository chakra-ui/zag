import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { MachineApi, Send, State } from "./presence.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi {
  void normalize
  return {
    isPresent: state.matches("mounted", "unmountSuspended"),

    setNode(node: HTMLElement | null) {
      if (!node) return
      send({ type: "NODE.SET", node })
    },
  }
}
