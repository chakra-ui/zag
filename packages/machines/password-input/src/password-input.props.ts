import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { PasswordInputProps } from "./password-input.types"

export const props = createProps<PasswordInputProps>()([
  "defaultVisible",
  "dir",
  "id",
  "onVisibilityChange",
  "visible",
  "ids",
  "getRootNode",
  "disabled",
  "invalid",
  "required",
  "readOnly",
  "translations",
  "ignorePasswordManagers",
  "autoComplete",
  "name",
])

export const splitProps = createSplitProps<Partial<PasswordInputProps>>(props)
