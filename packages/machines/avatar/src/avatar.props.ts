import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./avatar.types"

export const props = createProps<UserDefinedContext>()(["dir", "id", "onLoadingStatusChange", "getRootNode"])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
