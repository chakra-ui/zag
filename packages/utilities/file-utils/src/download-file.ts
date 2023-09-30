export function downloadFile(fileOrUrl: File | string, win: typeof window) {
  const doc = win.document
  const objectUrl = typeof fileOrUrl === "string" ? fileOrUrl : win.URL.createObjectURL(fileOrUrl)

  const anchor = doc.createElement("a")
  anchor.style.display = "none"
  anchor.href = objectUrl
  anchor.download = typeof fileOrUrl === "string" ? objectUrl : fileOrUrl.name

  doc.body.appendChild(anchor)
  anchor.click()

  setTimeout(() => {
    if (typeof fileOrUrl !== "string") {
      win.URL.revokeObjectURL(objectUrl)
    }
    anchor?.parentNode?.removeChild(anchor)
  }, 0)
}
