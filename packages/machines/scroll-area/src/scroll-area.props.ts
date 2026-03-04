import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ScrollAreaProps } from "./scroll-area.types"

export const props = createProps<ScrollAreaProps>()(["dir", "getRootNode", "ids", "id"])
export const splitProps = createSplitProps<Partial<ScrollAreaProps>>(props)
