import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, RequiredBy } from "@zag-js/types"

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
   * Whether to allow multiple files
   */
  multiple?: boolean
  /**
   * Whether the file input is disabled
   */
  disabled?: boolean
  /**
   * Whether to disable the click event. Useful of the root element is a label
   */
  disableClick?: boolean
  /**
   * Whether to allow dropping files
   */
  dropzone?: boolean
  /**
   * The maximum file size in bytes
   */
  maxSize: number
  /**
   * The minimum file size in bytes
   */
  minSize: number
  /**
   * The maximum number of files
   */
  maxFiles: number
  /**
   * Function called the user drops files
   */
  onDrop?: (details: DropDetails) => void
  /**
   * Function called when the user drags files over the dropzone
   */
  onDragOver?: () => void
  /**
   * Function called when files are dropped but rejected
   */
  onDropRejected?: (details: DropDetails) => void
  /**
   * Function called when files are dropped and accepted
   */
  onDropAccepted?: (details: DropDetails) => void
  /**
   * Function called when the user drags files over the dropzone
   */
  onDragEnter?: () => void
  /**
   * Function called when the user drags files out of the dropzone
   */
  onDragLeave?: () => void
  /**
   * Function to validate a file
   */
  isValidFile?: (file: File) => boolean
  /**
   * The current value of the file input
   */
  value: File[]
  /**
   * Function called when the value changes
   */
  onChange?: (details: ChangeDetails) => void
}

type ChangeDetails = {
  files: File[]
}

type DropDetails = {
  acceptedFiles: File[]
  fileRejections: FileRejection[]
}

type PrivateContext = {
  invalid: boolean
  validityState: string | null
}

type ComputedContext = Readonly<{
  acceptAttr: string | undefined
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "open" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type FileRejection = {
  file: File
  errors: any[]
}
