export function isMSEdge(win: Window): win is Window & { navigator: { msSaveOrOpenBlob: Function } } {
  // @ts-ignore
  return Boolean(win.navigator && win.navigator.msSaveOrOpenBlob)
}

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
  win: typeof window
}

export function downloadFile(options: DownloadFileOptions) {
  const { file, win, type, name } = options

  const doc = win.document

  const obj = typeof file === "string" ? new Blob([file], { type }) : file
  const fileName = file instanceof File ? name || file.name : name

  if (isMSEdge(win)) {
    win.navigator.msSaveOrOpenBlob(obj, fileName || "file-download")
    return
  }

  const url = win.URL.createObjectURL(obj)

  const anchor = doc.createElement("a")
  anchor.style.display = "none"
  anchor.href = url
  anchor.rel = "noopener"
  anchor.download = fileName || "file-download"

  doc.documentElement.appendChild(anchor)
  anchor.click()

  setTimeout(() => {
    win.URL.revokeObjectURL(url)
    anchor.remove()
  }, 0)
}
