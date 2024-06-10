import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./presence.types"

export const props = createProps<UserDefinedContext>()(["onExitComplete", "present", "immediate"])
