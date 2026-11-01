import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./file-upload.types"

export const defaultTranslations: Required<IntlTranslations> = {
  dropzone: "dropzone",
  itemPreview: (file) => `preview of ${file.name}`,
  deleteFile: (file) => `delete file ${file.name}`,
  filesAdded: (files) => `${files.map((file) => file.name).join(", ")} added`,
  fileDeleted: (file) => `${file.name} deleted`,
}
