import type { FileError } from "./types"

export function isValidFileSize(file: File, minSize?: number, maxSize?: number): [boolean, FileError | null] {
  const size = file.size
  if (size == null) return [true, null]
  if (maxSize != null && size > maxSize) return [false, "FILE_TOO_LARGE"]
  if (minSize != null && size < minSize) return [false, "FILE_TOO_SMALL"]
  return [true, null]
}

export const isFileEqual = (file1: File, file2: File) =>
  file1.name === file2.name && file1.size === file2.size && file1.type === file2.type

// must agree with `isFileEqual`, for callers that dedupe in one pass
export const getFileKey = (file: File) => `${file.name}|${file.size}|${file.type}`

export const getTotalFileSize = (files: File[]) => files.reduce((acc, file) => acc + file.size, 0)
