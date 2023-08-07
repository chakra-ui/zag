import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

type PublicContext = CommonProperties & {
  /**
   * The name of the underlying file input
   */
  name?: string
  /**
   * The accept file types
   */
  accept?: Record<string, string[]> | string
  /**
   * Whether the file input is disabled
   */
  disabled?: boolean
  /**
   * Whether to allow drag and drop in the dropzone element
   */
  allowDrop?: boolean
  /**
   * The maximum file size in bytes
   */
  maxFileSize: number
  /**
   * The minimum file size in bytes
   */
  minFileSize: number
  /**
   * The maximum number of files
   */
  maxFiles: number
  /**
   * Function to validate a file
   */
  isValidFile?: (file: File) => boolean
  /**
   * The current value of the file input
   */
  files: File[]
  /**
   * Function called when the value changes
   */
  onChange?: (details: ChangeDetails) => void
}

export type RejectedFile = {
  file: File
  errors: (string | null)[]
}

type ChangeDetails = {
  acceptedFiles: File[]
  rejectedFiles: RejectedFile[]
}

type PrivateContext = {
  /**
   * Whether the files includes any rejection
   */
  invalid: boolean
  /**
   * The rejected files
   */
  rejectedFiles: RejectedFile[]
}

type ComputedContext = Readonly<{
  acceptAttr: string | undefined
  multiple: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "open" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type PublicApi<T extends PropTypes> = {
  /**
   * Whether the user is dragging something over the root element
   */
  isDragging: boolean
  /**
   * Whether the user is focused on the root element
   */
  isFocused: boolean
  /**
   * Function to open the file dialog
   */
  open(): void
  /**
   * Function to delete the file from the list
   */
  deleteFile(file: File): void
  /**
   * The files that have been dropped or selected
   */
  files: File[]
  /**
   * Function to set the value
   */
  setValue(files: File[]): void
  /**
   * Function to clear the value
   */
  clearValue(): void
  rootProps: T["element"]
  dropzoneProps: T["element"]
  triggerProps: T["button"]
  hiddenInputProps: T["input"]
  getDeleteTriggerProps(props: { file: File }): T["button"]
  labelProps: T["label"]
}
