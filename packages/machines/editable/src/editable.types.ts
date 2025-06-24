import type { EventObject, Machine, Service } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/interact-outside"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string
}

export interface EditChangeDetails {
  edit: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ActivationMode = "focus" | "dblclick" | "click" | "none"

export type SubmitMode = "enter" | "blur" | "both" | "none"

export type IntlTranslations = {
  edit: string
  submit: string
  cancel: string
  input: string
}

export type ElementIds = Partial<{
  root: string
  area: string
  label: string
  preview: string
  input: string
  control: string
  submitTrigger: string
  cancelTrigger: string
  editTrigger: string
}>

export interface EditableProps extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements in the editable. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the input's value is invalid.
   */
  invalid?: boolean | undefined
  /**
   * The name attribute of the editable component. Used for form submission.
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input.
   */
  form?: string | undefined
  /**
   * Whether the editable should auto-resize to fit the content.
   */
  autoResize?: boolean | undefined
  /**
   * The activation mode for the preview element.
   *
   * - "focus" - Enter edit mode when the preview is focused
   * - "dblclick" - Enter edit mode when the preview is double-clicked
   * - "click" - Enter edit mode when the preview is clicked
   * - "none" - Edit can be triggered programmatically only
   *
   * @default "focus"
   */
  activationMode?: ActivationMode | undefined
  /**
   * The action that triggers submit in the edit mode:
   *
   * - "enter" - Trigger submit when the enter key is pressed
   * - "blur" - Trigger submit when the editable is blurred
   * - "none" - No action will trigger submit. You need to use the submit button
   * - "both" - Pressing `Enter` and blurring the input will trigger submit
   *
   * @default "both"
   */
  submitMode?: SubmitMode | undefined
  /**
   * Whether to select the text in the input when it is focused.
   * @default true
   */
  selectOnFocus?: boolean | undefined
  /**
   * Whether the editable is in edit mode.
   */
  edit?: boolean | undefined
  /**
   * Whether the editable is in edit mode by default.
   */
  defaultEdit?: boolean | undefined
  /**
   * Function to call when the edit mode changes.
   */
  onEditChange?: ((details: EditChangeDetails) => void) | undefined
  /**
   * The maximum number of characters allowed in the editable
   */
  maxLength?: number | undefined
  /**
   * Whether the editable is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the editable is read-only.
   */
  readOnly?: boolean | undefined
  /**
   * Whether the editable is required.
   */
  required?: boolean | undefined
  /**
   * The placeholder text for the editable.
   */
  placeholder?: string | { edit: string; preview: string } | undefined
  /**
   * The translations for the editable.
   */
  translations?: IntlTranslations | undefined
  /**
   * The element to receive focus when the editable is closed.
   */
  finalFocusEl?: (() => HTMLElement | null) | undefined
  /**
   * The controlled value of the editable.
   */
  value?: string | undefined
  /**
   * The initial value of the editable when rendered.
   * Use when you don't need to control the value of the editable.
   */
  defaultValue?: string | undefined
  /**
   * Function to call when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function to call when the value is reverted.
   */
  onValueRevert?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function to call when the value is committed.
   */
  onValueCommit?: ((details: ValueChangeDetails) => void) | undefined
}

type PropsWithDefault = "activationMode" | "submitMode" | "selectOnFocus" | "translations"

export interface EditableSchema {
  props: RequiredBy<EditableProps, PropsWithDefault>
  state: "edit" | "preview"
  context: {
    value: string
    previousValue: string
  }
  computed: {
    isInteractive: boolean
    submitOnEnter: boolean
    submitOnBlur: boolean
  }
  action: string
  effect: string
  event: EventObject
  guard: string
}

export type EditableService = Service<EditableSchema>

export type EditableMachine = Machine<EditableSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface EditableApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the editable is in edit mode
   */
  editing: boolean
  /**
   * Whether the editable value is empty
   */
  empty: boolean
  /**
   * The current value of the editable
   */
  value: string
  /**
   * The current value of the editable, or the placeholder if the value is empty
   */
  valueText: string
  /**
   * Function to set the value of the editable
   */
  setValue(value: string): void
  /**
   * Function to clear the value of the editable
   */
  clearValue(): void
  /**
   * Function to enter edit mode
   */
  edit(): void
  /**
   * Function to exit edit mode, and discard any changes
   */
  cancel(): void
  /**
   * Function to exit edit mode, and submit any changes
   */
  submit(): void

  getRootProps(): T["element"]
  getAreaProps(): T["element"]
  getLabelProps(): T["label"]
  getInputProps(): T["input"]
  getPreviewProps(): T["element"]
  getEditTriggerProps(): T["button"]
  getControlProps(): T["element"]
  getSubmitTriggerProps(): T["button"]
  getCancelTriggerProps(): T["button"]
}
