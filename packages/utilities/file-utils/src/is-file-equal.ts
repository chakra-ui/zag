export const isFileEqual = (file1: File, file2: File) => {
  return file1.name === file2.name && file1.size === file2.size && file1.type === file2.type
}
