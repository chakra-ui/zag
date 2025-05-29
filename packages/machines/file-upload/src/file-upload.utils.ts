import type { Params } from "@zag-js/core"
import { getEventTarget, getWindow } from "@zag-js/dom-query"
import { isValidFileSize, isValidFileType, type FileError } from "@zag-js/file-utils"
import type { FileRejection, FileUploadSchema } from "./file-upload.types"

export function isEventWithFiles(event: Pick<DragEvent, "dataTransfer" | "target">) {
  const target = getEventTarget<Element>(event)
  if (!event.dataTransfer) return !!target && "files" in target
  return event.dataTransfer.types.some((type) => {
    return type === "Files" || type === "application/x-moz-file"
  })
}

export function isFilesWithinRange(ctx: Params<FileUploadSchema>, incomingCount: number) {
  const { context, prop, computed } = ctx
  if (!computed("multiple") && incomingCount > 1) return false
  if (!computed("multiple") && incomingCount + context.get("acceptedFiles").length === 2) return true
  if (incomingCount + context.get("acceptedFiles").length > prop("maxFiles")) return false
  return true
}

export function getEventFiles(ctx: Params<FileUploadSchema>, files: File[]) {
  const { context, prop, computed } = ctx
  const acceptedFiles: File[] = []
  const rejectedFiles: FileRejection[] = []

  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file, computed("acceptAttr"))
    const [sizeMatch, sizeError] = isValidFileSize(file, prop("minFileSize"), prop("maxFileSize"))

    const validateErrors = prop("validate")?.(file, {
      acceptedFiles: context.get("acceptedFiles"),
      rejectedFiles: context.get("rejectedFiles"),
    })

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
