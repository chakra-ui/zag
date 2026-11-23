export function dataURItoBlob(uri: string): Blob {
  const [header, data] = uri.split(",")
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes.buffer], { type: header.split(":")[1].split(";")[0] })
}

export const getFileDataUrl = (file: File | Blob) =>
  new Promise<string | undefined>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => {
      reader.abort()
      reject(new Error("There was an error reading a file"))
    }
    reader.onloadend = () => {
      const { result } = reader
      if (result instanceof ArrayBuffer) reject(new Error("Expected DataURL as string from Blob/File, got ArrayBuffer"))
      else resolve(result || undefined)
    }
    reader.readAsDataURL(file)
  })

export interface DownloadFileOptions {
  /**
   * The name of the file
   */
  name?: string | undefined
  /**
   * The MIME type of the file
   */
  type: string
  /**
   * The file contents
   */
  file: File | Blob | string
  /**
   * The window environment
   */
  win?: typeof window | undefined
  /**
   * Whether to add a BOM (Byte Order Mark) to the file.
   * Useful for CSV files.
   */
  appendBOM?: boolean | undefined
  /**
   * The timeout in milliseconds to revoke the object URL.
   * This is a safeguard for when the browser has not finished reading the
   * file data from memory before the URL is revoked.
   * @default 0
   */
  revokeTimeout?: number | undefined
}

const BOM_REGEX = /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i
const MAC_REGEX = /Macintosh/
const APPLE_WEBKIT_REGEX = /AppleWebKit/
const SAFARI_REGEX = /Safari/

function getBlob(blobOrString: Blob | File | string, type: string, appendBOM?: boolean) {
  let blob = typeof blobOrString === "string" ? new Blob([blobOrString], { type }) : blobOrString
  if (appendBOM && BOM_REGEX.test(blob.type)) {
    return new Blob([String.fromCharCode(0xfeff), blob], { type: blob.type })
  }
  return blob
}

function isMSEdge(win: any): win is Window & { navigator: { msSaveOrOpenBlob: Function } } {
  return Boolean(win.navigator && win.navigator.msSaveOrOpenBlob)
}

function isWebView(win: Window) {
  return (
    win.navigator &&
    MAC_REGEX.test(win.navigator.userAgent) &&
    APPLE_WEBKIT_REGEX.test(win.navigator.userAgent) &&
    !SAFARI_REGEX.test(win.navigator.userAgent)
  )
}

export function downloadFile(options: DownloadFileOptions) {
  const { file, win = window, type, name, appendBOM, revokeTimeout = 0 } = options

  const doc = win.document

  const blob = getBlob(file, type, appendBOM)
  const fileName = (file instanceof File ? name || file.name : name) || "file-download"

  if (isMSEdge(win)) {
    win.navigator.msSaveOrOpenBlob(blob, fileName)
    return
  }

  const isMacOSWebView = isWebView(win)

  const anchor = doc.createElement("a")
  const canUseDownload = "download" in anchor && !isMacOSWebView

  if (canUseDownload) {
    const url = win.URL.createObjectURL(blob)
    anchor.href = url
    anchor.rel = "noopener"
    anchor.download = fileName
    anchor.style.display = "none"

    doc.body.appendChild(anchor)
    anchor.dispatchEvent(new win.MouseEvent("click"))

    setTimeout(() => {
      win.URL.revokeObjectURL(url)
      anchor.remove()
    }, revokeTimeout)

    return
  }

  const url = win.URL.createObjectURL(blob)
  const popup = win.open(url, "_blank")
  if (!popup) {
    win.location.href = url
  }

  setTimeout(() => {
    win.URL.revokeObjectURL(url)
  }, revokeTimeout)
}

const getItemEntry = (item: any): FileSystemEntry | null =>
  typeof item.getAsEntry === "function"
    ? item.getAsEntry()
    : typeof item.webkitGetAsEntry === "function"
      ? item.webkitGetAsEntry()
      : null

const addRelativePath = (file: File, path: string) => {
  Object.defineProperty(file, "relativePath", { value: path ? `${path}/${file.name}` : file.name })
  return file
}

/** Reads a file entry, recording where it sits under the dropped folder */
const readFileEntry = (entry: FileSystemFileEntry, path: string) =>
  new Promise<File | null>((resolve) => entry.file((file) => resolve(addRelativePath(file, path))))

export const getFileEntries = (items: DataTransferItemList, traverseDirectories: boolean | undefined) =>
  Promise.all(
    Array.from(items)
      .filter((item) => item.kind === "file")
      .map((item) => {
        const entry = getItemEntry(item)
        if (!entry) return null
        if (entry.isDirectory && traverseDirectories) {
          return getDirectoryFiles((entry as FileSystemDirectoryEntry).createReader(), entry.name)
        }
        if (!entry.isFile) return undefined
        if (typeof item.getAsFile === "function") {
          const file = item.getAsFile()
          return Promise.resolve(file ? addRelativePath(file, "") : null)
        }
        return readFileEntry(entry as FileSystemFileEntry, "")
      })
      .filter((b) => b),
  )

const getDirectoryFiles = (reader: FileSystemDirectoryReader, path = ""): Promise<Array<File | null>> =>
  new Promise((resolve) => {
    const entryPromises: Promise<unknown>[] = []
    const readDirectoryEntries = () => {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          resolve(Promise.all(entryPromises).then((entries) => entries.flat() as Array<File | null>))
          return
        }
        const promises = entries
          .map((entry) => {
            if (!entry) return null
            if (entry.isDirectory) {
              return getDirectoryFiles((entry as FileSystemDirectoryEntry).createReader(), `${path}/${entry.name}`)
            }
            if (entry.isFile) return readFileEntry(entry as FileSystemFileEntry, path)
          })
          .filter((b) => b)
        entryPromises.push(Promise.all(promises))
        readDirectoryEntries()
      })
    }
    readDirectoryEntries()
  })
