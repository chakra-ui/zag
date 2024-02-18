import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./progress.types"

export const props = createProps<UserDefinedContext>()([
  "dir",
  "getRootNode",
  "id",
  "max",
  "min",
  "orientation",
  "translations",
  "value",
])
