import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { AvatarProps } from "./avatar.types"

export const props = createProps<AvatarProps>()(["dir", "id", "ids", "onStatusChange", "getRootNode"])
export const splitProps = createSplitProps<Partial<AvatarProps>>(props)
