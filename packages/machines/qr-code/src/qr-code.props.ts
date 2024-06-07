import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./qr-code.types"

export const props = createProps<UserDefinedContext>()(["ids", "value", "id", "encoding", "dir", "getRootNode"])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
