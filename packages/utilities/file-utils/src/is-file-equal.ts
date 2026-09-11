export const isFileEqual = (file1: File, file2: File) => {
  return file1.name === file2.name && file1.size === file2.size && file1.type === file2.type
}

// must agree with `isFileEqual`, for callers that dedupe in one pass
export const getFileKey = (file: File) => {
  return `${file.name}|${file.size}|${file.type}`
}
