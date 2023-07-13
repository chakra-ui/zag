import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { PublicApi, Send, State } from "./presence.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): PublicApi {
  void normalize
  return {
    isPresent: state.matches("mounted", "unmountSuspended"),

    setNode(node: HTMLElement | null) {
      if (!node) return
      send({ type: "NODE.SET", node })
    },
  }
}
