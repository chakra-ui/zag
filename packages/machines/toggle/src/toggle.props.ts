import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ToggleProps } from "./toggle.types"

export const props = createProps<ToggleProps>()(["defaultPressed", "pressed", "onPressedChange", "disabled"])
export const splitProps = createSplitProps<Partial<ToggleProps>>(props)
