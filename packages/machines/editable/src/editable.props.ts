import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { UserDefinedContext } from "./editable.types"

export const props = createProps<UserDefinedContext>()([
  "activationMode",
  "autoResize",
  "dir",
  "disabled",
  "finalFocusEl",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "maxLength",
  "name",
  "onEdit",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onValueChange",
  "onValueCommit",
  "onValueRevert",
  "placeholder",
  "readOnly",
  "required",
  "selectOnFocus",
  "startWithEditView",
  "submitMode",
  "translations",
  "value",
])

export const splitProps = createSplitProps<Partial<UserDefinedContext>>(props)
