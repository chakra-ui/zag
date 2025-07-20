import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { ItemProps, FileUploadProps } from "./file-upload.types"

export const props = createProps<FileUploadProps>()([
  "accept",
  "acceptedFiles",
  "allowDrop",
  "capture",
  "defaultAcceptedFiles",
  "dir",
  "directory",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileChange",
  "onFileReject",
  "preventDocumentDrop",
  "required",
  "transformFiles",
  "translations",
  "validate",
])
export const splitProps = createSplitProps<Partial<FileUploadProps>>(props)

export const itemProps = createProps<ItemProps>()(["file"])
export const splitItemProps = createSplitProps<ItemProps>(itemProps)
