import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./avatar.types"

export const props = createProps<UserDefinedContext>()(["dir", "id", "onLoadingStatusChange", "getRootNode"])
