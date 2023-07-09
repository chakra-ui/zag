import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send } from "./presence.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  void normalize
  return {
    /**
     * Whether the node is present in the DOM.
     */
    isPresent: state.matches("mounted", "unmountSuspended"),
    /**
     * Function to set the node (as early as possible)
     */
    setNode(node: HTMLElement | null) {
      if (!node) return
      send({ type: "NODE.SET", node })
    },
  }
}
