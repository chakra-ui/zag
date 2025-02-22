const getItemEntry = (item: any): FileSystemEntry | null =>
  typeof item.getAsEntry === "function"
    ? item.getAsEntry()
    : typeof item.webkitGetAsEntry === "function"
      ? item.webkitGetAsEntry()
      : null

const isDirectoryEntry = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry => entry.isDirectory

const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry => entry.isFile

const addRelativePath = (file: File, path: string) => {
  Object.defineProperty(file, "relativePath", { value: path ? `${path}/${file.name}` : file.name })
  return file
}

export const getFileEntries = (items: DataTransferItemList, traverseDirectories: boolean | undefined) =>
  Promise.all(
    Array.from(items)
      .filter((item) => item.kind === "file")
      .map((item) => {
        const entry = getItemEntry(item)
        if (!entry) return null

        if (isDirectoryEntry(entry) && traverseDirectories) {
          return getDirectoryFiles(entry.createReader(), `${entry.name}`)
        }
        if (isFileEntry(entry)) {
          return new Promise<File | null>((resolve) => {
            entry.file((file) => {
              resolve(addRelativePath(file, ""))
            })
          })
        }
      })
      .filter((b) => b),
  )

const getDirectoryFiles = (reader: FileSystemDirectoryReader, path = ""): Promise<Array<File | null>> =>
  new Promise((resolve) => {
    const entryPromises: Promise<File | null>[] = []
    const readDirectoryEntries = () => {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          resolve(Promise.all(entryPromises).then((entries) => entries.flat()))
          return
        }

        const promises = entries
          .map((entry) => {
            if (!entry) return null

            if (isDirectoryEntry(entry)) {
              return getDirectoryFiles(entry.createReader(), `${path}${entry.name}`)
            }

            if (isFileEntry(entry)) {
              return new Promise<File | null>((resolve) => {
                entry.file((file) => {
                  resolve(addRelativePath(file, path))
                })
              })
            }
          })
          .filter((b) => b)

        // @ts-expect-error
        entryPromises.push(Promise.all(promises))
        readDirectoryEntries()
      })
    }
    readDirectoryEntries()
  })
