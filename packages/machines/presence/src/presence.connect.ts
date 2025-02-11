import type { Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { PresenceApi, PresenceSchema } from "./presence.types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function connect<T extends PropTypes>(
  service: Service<PresenceSchema>,
  _normalize: NormalizeProps<T>,
): PresenceApi {
  const { state, send, context } = service
  const present = state.matches("mounted", "unmountSuspended")
  return {
    skip: !context.initial && present,
    present,
    setNode(node) {
      if (!node) return
      send({ type: "NODE.SET", node })
    },
    unmount() {
      send({ type: "UNMOUNT" })
    },
  }
}
