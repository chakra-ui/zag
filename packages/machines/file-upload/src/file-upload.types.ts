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
