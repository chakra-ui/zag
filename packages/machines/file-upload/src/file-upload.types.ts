import type { StateMachine as S } from "@zag-js/core"
import type { FileError } from "@zag-js/file-utils"
import type { CommonProperties, LocaleProperties, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface FileRejection {
  file: File
  errors: FileError[]
}

export interface FileChangeDetails {
  acceptedFiles: File[]
  rejectedFiles: FileRejection[]
}

export interface FileAcceptDetails {
  files: File[]
}

export interface FileRejectDetails {
  files: FileRejection[]
}

export type { FileError }

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  dropzone: string
  hiddenInput: string
  trigger: string
  label: string
  item(id: string): string
  itemName(id: string): string
  itemSizeText(id: string): string
  itemPreview(id: string): string
}>

export interface IntlTranslations {
  itemPreview(file: File): string
  deleteFile(file: File): string
}

interface PublicContext extends LocaleProperties, CommonProperties {
  /**
   * The name of the underlying file input
   */
  name?: string
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The localized messages to use.
   */
  translations: IntlTranslations
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
  validate?: (file: File) => FileError[] | null
  /**
   * The current value of the file input
   */
  files: File[]
  /**
   * Function called when the value changes, whether accepted or rejected
   */
  onFilesChange?: (details: FileChangeDetails) => void
  /**
   * Function called when the file is accepted
   */
  onFileAccept?: (details: FileAcceptDetails) => void
  /**
   * Function called when the file is rejected
   */
  onFileReject?: (details: FileRejectDetails) => void
}

interface PrivateContext {
  /**
   * @internal
   * Whether the files includes any rejection
   */
  invalid: boolean
  /**
   * @internal
   * The rejected files
   */
  rejectedFiles: FileRejection[]
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * The accept attribute as a string
   */
  acceptAttr: string | undefined
  /**
   * @computed
   * Whether the file can select multiple files
   */
  multiple: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open" | "dragging"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  file: File
}

export interface ItemPreviewImageProps extends ItemProps {
  url: string
}

export interface MachineApi<T extends PropTypes> {
  /**
   * Whether the user is dragging something over the root element
   */
  isDragging: boolean
  /**
   * Whether the user is focused on the dropzone element
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
  setFiles(files: File[]): void
  /**
   * Function to clear the value
   */
  clearFiles(): void
  /**
   * Function to format the file size (e.g. 1.2MB)
   */
  getFileSize(file: File): string
  /**
   * Function to get the preview url of a file.
   * It returns a function to revoke the url.
   */
  createFileUrl(file: File, cb: (url: string) => void): VoidFunction

  labelProps: T["label"]
  rootProps: T["element"]
  dropzoneProps: T["element"]
  triggerProps: T["button"]
  hiddenInputProps: T["input"]
  itemGroupProps: T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemNameProps(props: ItemProps): T["element"]
  getItemPreviewProps(props: ItemProps): T["element"]
  getItemPreviewImageProps(props: ItemPreviewImageProps): T["img"]
  getItemSizeTextProps(props: ItemProps): T["element"]
  getItemDeleteTriggerProps(props: ItemProps): T["button"]
}
