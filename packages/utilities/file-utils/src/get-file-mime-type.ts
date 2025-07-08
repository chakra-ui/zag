import { mimeTypesMap } from "./mime-types"
import type { FileMimeType } from "./types"

export function getFileMimeType(name: string): FileMimeType | null {
  const extension = name.split(".").pop()
  return extension ? mimeTypesMap.get(extension) || null : null
}
