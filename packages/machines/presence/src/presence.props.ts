import { createProps } from "@zag-js/types"
import type { PresenceProps } from "./presence.types"

export const props = createProps<PresenceProps>()(["onExitComplete", "present", "immediate"])
