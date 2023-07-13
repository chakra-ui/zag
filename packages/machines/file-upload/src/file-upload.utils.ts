import { type MachineContext, type RejectedFile } from "./file-upload.types"

export function isEventWithFiles(event: Pick<DragEvent, "dataTransfer" | "target">) {
  if (!event.dataTransfer) {
    return !!event.target && "files" in event.target
  }
  return event.dataTransfer.types.some((type) => type === "Files" || type === "application/x-moz-file")
}

function isMIMEType(v: string) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v)
}

function isExt(v: string) {
  return /^.*\.[\w]+$/.test(v)
}

function isAccepted(file: File | null, accept: string[] | string | undefined) {
  if (file && accept) {
    const types = Array.isArray(accept) ? accept : accept.split(",")

    const fileName = file.name || ""
    const mimeType = (file.type || "").toLowerCase()
    const baseMimeType = mimeType.replace(/\/.*$/, "")

    return types.some((type) => {
      const validType = type.trim().toLowerCase()

      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType)
      }

      if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "")
      }

      return mimeType === validType
    })
  }
  return true
}

const isDefined = <T>(v: T | undefined): v is T => v !== undefined && v !== null

function isValidFileSize(file: File, minSize?: number, maxSize?: number): [boolean, string | null] {
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

function isValidFileType(file: File, accept: string | undefined): [boolean, string | null] {
  const isAcceptable = file.type === "application/x-moz-file" || isAccepted(file, accept)
  return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"]
}

export function isFilesWithinRange(ctx: MachineContext, incomingCount: number) {
  if (!ctx.multiple && incomingCount > 1) return false
  if (!ctx.multiple && incomingCount + ctx.files.length === 2) return true
  if (incomingCount + ctx.files.length > ctx.maxFiles) return false
  return true
}

export function getAcceptAttrString(accept: Record<string, string[]> | string | undefined) {
  if (!accept) return
  if (typeof accept === "string") return accept
  return Object.entries(accept)
    .reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], [] as string[])
    .filter((v) => isMIMEType(v) || isExt(v))
    .join(",")
}

export function getFilesFromEvent(ctx: MachineContext, files: File[]) {
  const acceptedFiles: File[] = []
  const rejectedFiles: RejectedFile[] = []

  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file, ctx.acceptAttr)
    const [sizeMatch, sizeError] = isValidFileSize(file, ctx.minSize, ctx.maxSize)
    const valid = ctx.isValidFile?.(file) ?? true

    if (accepted && sizeMatch && valid) {
      acceptedFiles.push(file)
    } else {
      const errors = [acceptError, sizeError]
      if (!valid) errors.push("INVALID")
      rejectedFiles.push({ file, errors: errors.filter(Boolean) })
    }
  })

  if (!isFilesWithinRange(ctx, acceptedFiles.length)) {
    acceptedFiles.forEach((file) => {
      rejectedFiles.push({ file, errors: ["TOO_MANY_FILES_REJECTION"] })
    })
    acceptedFiles.splice(0)
  }

  return {
    acceptedFiles,
    rejectedFiles,
  }
}
