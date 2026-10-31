import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./file-upload.types"

// en-GB joins the last item with "and" without the Oxford comma
const listFormat = new Intl.ListFormat("en-GB")

export const defaultTranslations: Required<IntlTranslations> = {
  dropzone: "dropzone",
  itemPreview: (file) => `preview of ${file.name}`,
  deleteFile: (file) => `delete file ${file.name}`,
  filesAdded: (files) => `${listFormat.format(files.map((file) => file.name))} added`,
  fileDeleted: (file) => `${file.name} deleted`,
}
