import type { StateMachine as S } from "@zag-js/core"
import type { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from "@zag-js/interact-outside"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type ActivationMode = "focus" | "dblclick" | "none"

export type SubmitMode = "enter" | "blur" | "both" | "none"

type IntlTranslations = {
  edit: string
  submit: string
  cancel: string
  input: string
}

type ElementIds = Partial<{
  root: string
  area: string
  label: string
  preview: string
  input: string
  controls: string
  submitTrigger: string
  cancelTrigger: string
  editTrigger: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the editable. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Whether the input's value is invalid.
     */
    invalid?: boolean
    /**
     * The name attribute of the editable component. Used for form submission.
     */
    name?: string
    /**
     * The associate form of the underlying input.
     */
    form?: string
    /**
     * Whether the editable should auto-resize to fit the content.
     */
    autoResize?: boolean
    /**
     * The activation mode for the preview element.
     *
     * - "focus" - Enter edit mode when the preview element is focused
     * - "dblclick" - Enter edit mode when the preview element is double-clicked
     * - "none" - No interaction with the preview element will trigger edit mode.
     *
     * @default "focus"
     */
    activationMode: ActivationMode
    /**
     * The action that triggers submit in the edit mode:
     *
     * - "enter" - Trigger submit when the enter key is pressed
     * - "blur" - Trigger submit when the editable is blurred
     * - "none" - No action will trigger submit. You need to use the submit button
     * - "both" - Pressing `Enter` and blurring the input will trigger submit
     *
     * @default "enter"
     */
    submitMode: SubmitMode
    /**
     * Whether to start with the edit mode active.
     */
    startWithEditView?: boolean
    /**
     * Whether to select the text in the input when it is focused.
     */
    selectOnFocus?: boolean
    /**
     * The value of the editable in both edit and preview mode
     */
    value: string
    /**
     * The maximum number of characters allowed in the editable
     */
    maxLength?: number
    /**
     * Whether the editable is disabled
     */
    disabled?: boolean
    /**
     * Whether the editable is readonly
     */
    readOnly?: boolean
    /**
     * The callback that is called when the editable's value is changed
     */
    onChange?: (details: { value: string }) => void
    /**
     * The callback that is called when the esc key is pressed or the cancel button is clicked
     */
    onCancel?: (details: { value: string }) => void
    /**
     * The callback that is called when the editable's value is submitted.
     */
    onSubmit?: (details: { value: string }) => void
    /**
     * The callback that is called when in the edit mode.
     */
    onEdit?: () => void
    /**
     * The placeholder value to show when the `value` is empty
     */
    placeholder?: string | { edit: string; preview: string }
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
    /**
     * The element that should receive focus when the editable is closed.
     * By default, it will focus on the trigger element.
     */
    finalFocusEl?: () => HTMLElement | null

    onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
    onFocusOutside?: (event: FocusOutsideEvent) => void
    onInteractOutside?: (event: InteractOutsideEvent) => void
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the editable can be interacted with
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether value is empty
   */
  isValueEmpty: boolean
  /**
   * @computed
   * Whether the preview element is focusable
   */
  isPreviewFocusable: boolean
  /**
   * @computed
   * Whether to submit on enter press
   */
  submitOnEnter: boolean
  /**
   * @computed
   * Whether to submit on blur
   */
  submitOnBlur: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The previous value of the editable. Used to revert in case of cancel/escape
   */
  previousValue: string
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "preview" | "edit"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type { InteractOutsideEvent }

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the editable is in edit mode
   */
  isEditing: boolean
  /**
   * Whether the editable value is empty
   */
  isValueEmpty: boolean
  /**
   * The current value of the editable
   */
  value: string
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
  rootProps: T["element"]
  areaProps: T["element"]
  labelProps: T["label"]
  inputProps: T["input"]
  previewProps: T["element"]
  editTriggerProps: T["button"]
  controlProps: T["element"]
  submitTriggerProps: T["button"]
  cancelTriggerProps: T["button"]
}
