import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "@ui-machines/utils"

export type ActivationMode = "focus" | "dblclick" | "none"

export type SubmitMode = "enter" | "blur" | "both" | "none"

export type EditableMachineContext = Context<{
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
   * Whether to select the text in the input when it is focused.
   */
  selectOnFocus?: boolean
  /**
   * The value of the editable in both edit and preview mode
   */
  value: string
  /**
   * @internal The previous value of the editable. Used to revert in case of cancel/escape
   */
  previousValue: string
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
  readonly?: boolean
  /**
   * The callback that is called when the editable's value is changed
   */
  onChange?: (value: string) => void
  /**
   * The callback that is called when the esc key is pressed or the cancel button is clicked
   */
  onCancel?: (value: string) => void
  /**
   * The callback that is called when the editable's value is submitted.
   */
  onSubmit?: (value: string) => void
  /**
   * The callback that is called when in the edit mode.
   */
  onEdit?: () => void
  /**
   * The placeholder value to show when the `value` is empty
   */
  placeholder?: string

  // -------- Computed properties ---------- //

  /**
   * @computed Whether the editable can be interacted with
   */
  readonly isInteractive: boolean
  /**
   * @computed Whether value is empty
   */
  readonly isValueEmpty: boolean
  /**
   * @computed Whether the preview element is focusable
   */
  readonly isPreviewFocusable: boolean
  /**
   * @computed Whether to submit on enter press
   */
  readonly submitOnEnter: boolean
  /**
   * @computed Whether to submit on blur
   */
  readonly submitOnBlur: boolean
}>

export type EditableMachineState = {
  value: "unknown" | "preview" | "edit"
}

export type EditableState = S.State<EditableMachineContext, EditableMachineState>

export type EditableSend = S.Send<S.AnyEventObject>
