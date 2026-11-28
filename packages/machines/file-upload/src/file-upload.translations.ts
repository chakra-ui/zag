import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./file-upload.types"

export const defaultTranslations: Required<IntlTranslations> = {
  dropzone: "dropzone",
  itemPreview: (file) => `preview of ${file.name}`,
  removeFile: (file) => `Remove ${file.name}`,
  filesAdded: (files) => `${files.map((file) => file.name).join(", ")} added`,
  fileRemoved: (file) => `${file.name} removed`,
}
