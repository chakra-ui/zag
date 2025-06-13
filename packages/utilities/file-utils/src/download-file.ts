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
  win?: typeof window
  /**
   * Whether to add a BOM (Byte Order Mark) to the file.
   * Useful for CSV files.
   */
  appendBOM?: boolean
  /**
   * The timeout in milliseconds to revoke the object URL.
   * This is a safeguard for when the browser has not finished reading the
   * file data from memory before the URL is revoked.
   * @default 0
   */
  revokeTimeout?: number
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
