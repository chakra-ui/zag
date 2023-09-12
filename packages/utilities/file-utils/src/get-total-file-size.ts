export const getTotalFileSize = (files: File[]) => {
  return files.reduce((acc, file) => acc + file.size, 0)
}
