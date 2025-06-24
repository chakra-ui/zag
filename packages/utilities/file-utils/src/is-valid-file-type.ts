import type { FileError } from "./types"

function isFileAccepted(file: File | null, accept: string[] | string | undefined) {
  if (file && accept) {
    const types = Array.isArray(accept) ? accept : typeof accept === "string" ? accept.split(",") : []

    if (types.length === 0) return true

    const fileName = file.name || ""
    const mimeType = (file.type || "").toLowerCase()
    const baseMimeType = mimeType.replace(/\/.*$/, "")

    return types.some((type) => {
      const validType = type.trim().toLowerCase()

      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType)
      }

      if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "")
      }

      return mimeType === validType
    })
  }
  return true
}

export function isValidFileType(file: File, accept: string | undefined): [boolean, FileError | null] {
  const isAcceptable = file.type === "application/x-moz-file" || isFileAccepted(file, accept)
  return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"]
}
