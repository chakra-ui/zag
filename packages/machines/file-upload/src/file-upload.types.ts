import type { EventObject, Machine, Service } from "@zag-js/core"
import type { FileError, FileMimeType } from "@zag-js/file-utils"
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

export interface FileValidateDetails {
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
  item: (id: string) => string
  itemName: (id: string) => string
  itemSizeText: (id: string) => string
  itemPreview: (id: string) => string
}>

export interface IntlTranslations {
  dropzone?: string | undefined
  itemPreview?: ((file: File) => string) | undefined
  deleteFile?: ((file: File) => string) | undefined
}

export interface FileUploadProps extends LocaleProperties, CommonProperties {
  /**
   * The name of the underlying file input
   */
  name?: string | undefined
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * The accept file types
   */
  accept?: Record<string, string[]> | FileMimeType | FileMimeType[] | undefined
  /**
   * Whether the file input is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the file input is required
   */
  required?: boolean | undefined
  /**
   * Whether to allow drag and drop in the dropzone element
   * @default true
   */
  allowDrop?: boolean | undefined
  /**
   * The maximum file size in bytes
   *
   * @default Infinity
   */
  maxFileSize?: number | undefined
  /**
   * The minimum file size in bytes
   *
   * @default 0
   */
  minFileSize?: number | undefined
  /**
   * The maximum number of files
   * @default 1
   */
  maxFiles?: number | undefined
  /**
   * Whether to prevent the drop event on the document
   * @default true
   */
  preventDocumentDrop?: boolean | undefined
  /**
   * Function to validate a file
   */
  validate?: ((file: File, details: FileValidateDetails) => FileError[] | null) | undefined
  /**
   * The default accepted files when rendered.
   * Use when you don't need to control the accepted files of the input.
   */
  defaultAcceptedFiles?: File[] | undefined
  /**
   * The controlled accepted files
   */
  acceptedFiles?: File[] | undefined
  /**
   * Function called when the value changes, whether accepted or rejected
   */
  onFileChange?: ((details: FileChangeDetails) => void) | undefined
  /**
   * Function called when the file is accepted
   */
  onFileAccept?: ((details: FileAcceptDetails) => void) | undefined
  /**
   * Function called when the file is rejected
   */
  onFileReject?: ((details: FileRejectDetails) => void) | undefined
  /**
   * The default camera to use when capturing media
   */
  capture?: "user" | "environment" | undefined
  /**
   * Whether to accept directories, only works in webkit browsers
   */
  directory?: boolean | undefined
  /**
   * Whether the file input is invalid
   */
  invalid?: boolean | undefined
  /**
   * Function to transform the accepted files to apply transformations
   */
  transformFiles?: ((files: File[]) => Promise<File[]>) | undefined
}

type PropsWithDefault =
  | "minFileSize"
  | "maxFileSize"
  | "maxFiles"
  | "preventDocumentDrop"
  | "allowDrop"
  | "translations"

interface Context {
  /**
   * The rejected files
   */
  rejectedFiles: FileRejection[]
  /**
   * The current value of the file input
   */
  acceptedFiles: File[]
  /**
   * Whether files are currently being transformed
   */
  transforming: boolean
}

type Computed = {
  /**
   * The accept attribute as a string
   */
  acceptAttr: string | undefined
  /**
   * Whether the file can select multiple files
   */
  multiple: boolean
}

export interface FileUploadSchema {
  state: "idle" | "focused" | "dragging"
  props: RequiredBy<FileUploadProps, PropsWithDefault>
  context: Context
  computed: Computed
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type FileUploadService = Service<FileUploadSchema>

export type FileUploadMachine = Machine<FileUploadSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export type ItemType = "accepted" | "rejected"

export interface ItemTypeProps {
  type?: ItemType | undefined
}

export interface ItemProps extends ItemTypeProps {
  file: File
}

export interface ItemPreviewImageProps extends ItemProps {
  url: string
}

export interface ItemGroupProps extends ItemTypeProps {}

export interface DropzoneProps {
  /**
   * Whether to disable the click event on the dropzone
   */
  disableClick?: boolean | undefined
}

export interface FileUploadApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the user is dragging something over the root element
   */
  dragging: boolean
  /**
   * Whether the user is focused on the dropzone element
   */
  focused: boolean
  /**
   * Whether the file input is disabled
   */
  disabled: boolean
  /**
   * Whether files are currently being transformed via `transformFiles`
   */
  transforming: boolean
  /**
   * Function to open the file dialog
   */
  openFilePicker: VoidFunction
  /**
   * Function to delete the file from the list
   */
  deleteFile: (file: File, type?: ItemType | undefined) => void
  /**
   * The accepted files that have been dropped or selected
   */
  acceptedFiles: File[]
  /**
   * The files that have been rejected
   */
  rejectedFiles: FileRejection[]
  /**
   * Sets the accepted files
   */
  setFiles: (files: File[]) => void
  /**
   * Clears the accepted files
   */
  clearFiles: VoidFunction
  /**
   * Clears the rejected files
   */
  clearRejectedFiles: VoidFunction
  /**
   * Returns the formatted file size (e.g. 1.2MB)
   */
  getFileSize: (file: File) => string
  /**
   * Returns the preview url of a file.
   * Returns a function to revoke the url.
   */
  createFileUrl: (file: File, cb: (url: string) => void) => VoidFunction
  /**
   * Sets the clipboard files
   * Returns `true` if the clipboard data contains files, `false` otherwise.
   */
  setClipboardFiles: (dt: DataTransfer | null) => boolean

  getLabelProps: () => T["label"]
  getRootProps: () => T["element"]
  getDropzoneProps: (props?: DropzoneProps) => T["element"]
  getTriggerProps: () => T["button"]
  getHiddenInputProps: () => T["input"]
  getItemGroupProps: (props?: ItemGroupProps) => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getItemNameProps: (props: ItemProps) => T["element"]
  getItemPreviewProps: (props: ItemProps) => T["element"]
  getItemPreviewImageProps: (props: ItemPreviewImageProps) => T["img"]
  getItemSizeTextProps: (props: ItemProps) => T["element"]
  getItemDeleteTriggerProps: (props: ItemProps) => T["button"]
  getClearTriggerProps: () => T["button"]
}

export type { FileMimeType }
