import { createProps } from "@zag-js/types"
import type { ItemProps, UserDefinedContext } from "./file-upload.types"

export const props = createProps<UserDefinedContext>()([
  "accept",
  "allowDrop",
  "dir",
  "disabled",
  "files",
  "getRootNode",
  "id",
  "ids",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileReject",
  "onFilesChange",
  "translations",
  "validate",
])

export const itemProps = createProps<ItemProps>()(["file"])
