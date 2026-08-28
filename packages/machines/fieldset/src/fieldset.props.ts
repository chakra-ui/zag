import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { FieldsetProps } from "./fieldset.types"

export const props = createProps<FieldsetProps>()(["dir", "disabled", "getRootNode", "id", "ids", "invalid"])
export const splitProps = createSplitProps<Partial<FieldsetProps>>(props)
