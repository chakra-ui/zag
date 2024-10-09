import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./navigation-menu.types"

export const props = createProps<UserDefinedContext>()([])
export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
