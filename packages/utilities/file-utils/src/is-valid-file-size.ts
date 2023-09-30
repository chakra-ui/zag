const isDefined = <T>(v: T | undefined): v is T => v !== undefined && v !== null

export function isValidFileSize(file: File, minSize?: number, maxSize?: number): [boolean, string | null] {
  if (isDefined(file.size)) {
    if (isDefined(minSize) && isDefined(maxSize)) {
      if (file.size > maxSize) return [false, "TOO_LARGE"]
      if (file.size < minSize) return [false, "TOO_SMALL"]
    } else if (isDefined(minSize) && file.size < minSize) {
      return [false, "TOO_SMALL"]
    } else if (isDefined(maxSize) && file.size > maxSize) {
      return [false, "TOO_LARGE"]
    }
  }
  return [true, null]
}
