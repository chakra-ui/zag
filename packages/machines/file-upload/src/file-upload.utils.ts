import type { Params } from "@zag-js/core"
import { getEventTarget, getWindow } from "@zag-js/dom-query"
import { createFileTypeValidator, getFileKey, isValidFileSize, type FileError } from "@zag-js/file-utils"
import type { FileRejection, FileUploadSchema } from "./file-upload.types"

export function isEventWithFiles(event: Pick<DragEvent, "dataTransfer" | "target">) {
  const target = getEventTarget<Element>(event)
  if (!event.dataTransfer) return !!target && "files" in target
  return event.dataTransfer.types.some((type) => {
    return type === "Files" || type === "application/x-moz-file"
  })
}

export function isFilesWithinRange(ctx: Params<FileUploadSchema>, incomingCount: number, currentAcceptedFiles: File[]) {
  const { prop, computed } = ctx
  if (!computed("multiple") && incomingCount > 1) return false
  if (!computed("multiple") && incomingCount + currentAcceptedFiles.length === 2) return true
  if (incomingCount + currentAcceptedFiles.length > prop("maxFiles")) return false
  return true
}

export function getEventFiles(
  ctx: Params<FileUploadSchema>,
  files: File[],
  currentAcceptedFiles: File[] = [],
  currentRejectedFiles: FileRejection[] = [],
) {
  const { prop, computed } = ctx
  const acceptedFiles: File[] = []
  const rejectedFiles: FileRejection[] = []

  const validateParams = {
    acceptedFiles: currentAcceptedFiles,
    rejectedFiles: currentRejectedFiles,
  }

  const acceptedKeys = new Set(currentAcceptedFiles.map(getFileKey))

  const isValidFileType = createFileTypeValidator(computed("acceptAttr"))
  const minFileSize = prop("minFileSize")
  const maxFileSize = prop("maxFileSize")
  const validate = prop("validate")

  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file)
    const [sizeMatch, sizeError] = isValidFileSize(file, minFileSize, maxFileSize)

    const fileKey = getFileKey(file)
    const isDuplicate = acceptedKeys.has(fileKey)

    const validateErrors = validate?.(file, validateParams)

    const valid = validateErrors ? validateErrors.length === 0 : true

    if (accepted && sizeMatch && valid && !isDuplicate) {
      acceptedFiles.push(file)
      acceptedKeys.add(fileKey)
    } else {
      const errors: FileError[] = []
      if (acceptError) errors.push(acceptError)
      if (sizeError) errors.push(sizeError)
      if (isDuplicate) errors.push("FILE_EXISTS")
      if (!valid) errors.push(...(validateErrors ?? []))
      rejectedFiles.push({ file, errors })
    }
  })

  if (!isFilesWithinRange(ctx, acceptedFiles.length, currentAcceptedFiles)) {
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

export function setInputFiles(inputEl: HTMLInputElement, files: File[]) {
  const win = getWindow(inputEl)
  try {
    if ("DataTransfer" in win) {
      const dataTransfer = new win.DataTransfer()
      files.forEach((file) => {
        dataTransfer.items.add(file)
      })
      inputEl.files = dataTransfer.files
    }
  } catch {
    // do nothing
  }
}
