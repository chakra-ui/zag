import { isValidFileSize, isValidFileType, type FileError } from "@zag-js/file-utils"
import { type FileRejection, type MachineContext } from "./file-upload.types"

export function isEventWithFiles(event: Pick<DragEvent, "dataTransfer" | "target">) {
  if (!event.dataTransfer) return !!event.target && "files" in event.target
  return event.dataTransfer.types.some((type) => {
    return type === "Files" || type === "application/x-moz-file"
  })
}

export function isFilesWithinRange(ctx: MachineContext, incomingCount: number) {
  if (!ctx.multiple && incomingCount > 1) return false
  if (!ctx.multiple && incomingCount + ctx.acceptedFiles.length === 2) return true
  if (incomingCount + ctx.acceptedFiles.length > ctx.maxFiles) return false
  return true
}

export function getFilesFromEvent(ctx: MachineContext, files: File[]) {
  const acceptedFiles: File[] = []
  const rejectedFiles: FileRejection[] = []

  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file, ctx.acceptAttr)
    const [sizeMatch, sizeError] = isValidFileSize(file, ctx.minFileSize, ctx.maxFileSize)

    const validateErrors = ctx.validate?.(file)
    const valid = validateErrors ? validateErrors.length === 0 : true

    if (accepted && sizeMatch && valid) {
      acceptedFiles.push(file)
    } else {
      const errors = [acceptError, sizeError]
      if (!valid) errors.push(...(validateErrors ?? []))
      rejectedFiles.push({ file, errors: errors.filter(Boolean) as FileError[] })
    }
  })

  if (!isFilesWithinRange(ctx, acceptedFiles.length)) {
    acceptedFiles.forEach((file) => {
      rejectedFiles.push({ file, errors: ["TOO_MANY_FILES"] })
    })
    acceptedFiles.splice(0)
  }

  return {
    acceptedFiles,
    rejectedFiles,
  }
}
