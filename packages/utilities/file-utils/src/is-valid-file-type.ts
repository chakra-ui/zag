import type { FileError } from "./types"
import { getFileMimeType } from "./get-file-mime-type"

interface AcceptMatchers {
  extensions: string[]
  baseMimes: string[]
  mimes: string[]
}

function parseAccept(accept: string[] | string | undefined): AcceptMatchers | null {
  if (!accept) return null
  const types = Array.isArray(accept) ? accept : accept.split(",")
  const matchers: AcceptMatchers = { extensions: [], baseMimes: [], mimes: [] }
  for (const type of types) {
    const validType = type.trim().toLowerCase()
    if (validType.charAt(0) === ".") matchers.extensions.push(validType)
    else if (validType.endsWith("/*")) matchers.baseMimes.push(validType.slice(0, validType.indexOf("/")))
    else matchers.mimes.push(validType)
  }
  if (!matchers.extensions.length && !matchers.baseMimes.length && !matchers.mimes.length) return null
  return matchers
}

function matches(matchers: AcceptMatchers, file: File) {
  const fileName = file.name || ""
  const mimeType = (file.type || getFileMimeType(fileName) || "").toLowerCase()

  if (matchers.mimes.includes(mimeType)) return true

  if (matchers.baseMimes.length) {
    const slash = mimeType.indexOf("/")
    if (matchers.baseMimes.includes(slash === -1 ? mimeType : mimeType.slice(0, slash))) return true
  }

  if (matchers.extensions.length) {
    const lowerName = fileName.toLowerCase()
    if (matchers.extensions.some((ext) => lowerName.endsWith(ext))) return true
  }

  return false
}

/**
 * Parses `accept` once and returns a validator, so checking many files does not re-parse it per file.
 */
export function createFileTypeValidator(accept: string[] | string | undefined) {
  const matchers = parseAccept(accept)
  return function isValidFileType(file: File): [boolean, FileError | null] {
    const isAcceptable = file.type === "application/x-moz-file" || !matchers || matches(matchers, file)
    return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"]
  }
}

export function isValidFileType(file: File, accept: string | undefined): [boolean, FileError | null] {
  return createFileTypeValidator(accept)(file)
}
