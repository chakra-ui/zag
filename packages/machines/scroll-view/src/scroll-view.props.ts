import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ScrollViewProps } from "./scroll-view.types"

export const props = createProps<ScrollViewProps>()(["dir", "getRootNode", "ids", "id"])
export const splitProps = createSplitProps<Partial<ScrollViewProps>>(props)
