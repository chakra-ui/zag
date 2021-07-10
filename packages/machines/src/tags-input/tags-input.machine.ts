import { createMachine, guards, preserve } from "@ui-machines/core"
import { nextTick } from "@ui-machines/utils"
import { WithDOM } from "../type-utils"
import { dom, getElements } from "./tags-input.dom"

const { and, not } = guards

export type TagsInputMachineContext = WithDOM<{
  autofocus?: boolean
  disabled?: boolean
  readonly?: boolean
  focusedId: string | null
  editedId: string | null
  editedTagValue?: string
  inputValue: string
  value: string[]
  onChange?(value: string[]): void
  onHighlight?(value: string): void
  validate?(value: string, values: string[]): void
  addOnBlur?: boolean
  addOnPaste?: boolean
  /**
   * The max number of tags
   */
  max?: number
  /**
   * Whether to allow tags to exceed max. In this case,
   * we'll attach `data-invalid` to the root
   */
  allowOutOfRange?: boolean
  /**
   * Whether to allow duplicate tags
   */
  allowDuplicate?: boolean
  /**
   * The name attribute for the input. Useful for form submissions
   */
  name?: string
}>

export type TagsInputMachineState = {
  value: "idle" | "navigating:tag" | "focused:input" | "editing:tag"
}

export const tagsInputMachine = createMachine<
  TagsInputMachineContext,
  TagsInputMachineState
>(
  {
    id: "tags-input",
    initial: "idle",
    on: {
      MOUNT: {
        actions: ["setId", "setOwnerDocument"],
      },
      DOUBLE_CLICK_TAG: {
        target: "editing:tag",
        actions: ["setEditedId", "initEditedTagValue"],
      },
      POINTER_DOWN_TAG: {
        cond: not("isTagFocused"),
        target: "navigating:tag",
        actions: ["focusTag", "focusInput"],
      },
      CLICK_DELETE_BUTTON: {
        actions: "deleteTag",
      },
      CLEAR_ALL: {
        actions: "resetValue",
      },
    },
    context: {
      uid: "test",
      inputValue: "",
      editedTagValue: "",
      focusedId: null,
      editedId: null,
      value: [],
      direction: "ltr",
    },
    states: {
      idle: {
        on: {
          FOCUS: "focused:input",
          POINTER_DOWN: {
            cond: not("hasFocusedId"),
            target: "focused:input",
          },
        },
      },
      "navigating:tag": {
        on: {
          ARROW_RIGHT: [
            {
              cond: and(
                "hasTags",
                "isInputCaretAtStart",
                not("isLastTagFocused"),
              ),
              actions: "focusNextTag",
            },
            { target: "focused:input" },
          ],
          ARROW_LEFT: {
            actions: "focusPrevTag",
          },
          BLUR: {
            target: "idle",
            actions: "clearFocusedId",
          },
          ENTER: {
            target: "editing:tag",
            actions: [
              "setEditedId",
              "initEditedTagValue",
              "focusEditedTagInput",
            ],
          },
          ARROW_DOWN: "focused:input",
          ESCAPE: "focused:input",
          TYPE: {
            target: "focused:input",
            actions: "setInputValue",
          },
          BACKSPACE: {
            actions: ["deleteFocusedTag", "focusPrevTag"],
          },
          DELETE: {
            actions: "deleteFocusedTag",
          },
        },
      },
      "focused:input": {
        entry: ["focusInput", "clearFocusedId"],
        on: {
          TYPE: {
            actions: "setInputValue",
          },
          BLUR: [
            {
              target: "idle",
              cond: and("shouldCreateOnBlur", not("isInputValueEmpty")),
              actions: ["addTag", "clearInputValue"],
            },
            { target: "idle" },
          ],
          ENTER: {
            cond: not("isInputValueEmpty"),
            actions: ["addTag", "clearInputValue"],
          },
          COMMA: {
            cond: not("isInputValueEmpty"),
            actions: ["addTag", "clearInputValue"],
          },
          ARROW_LEFT: {
            cond: and("hasTags", "isInputCaretAtStart"),
            target: "navigating:tag",
            actions: "focusLastTag",
          },
          BACKSPACE: {
            target: "navigating:tag",
            cond: and("hasTags", "isInputCaretAtStart"),
            actions: "focusLastTag",
          },
          PASTE: {
            actions: "addTagFromPaste",
          },
        },
      },
      "editing:tag": {
        entry: "focusEditedTagInput",
        on: {
          TAG_INPUT_TYPE: {
            actions: "setEditedTagValue",
          },
          TAG_INPUT_ESCAPE: {
            target: "navigating:tag",
            actions: ["clearEditedTagValue", "focusInput", "clearEditedId"],
          },
          TAG_INPUT_BLUR: {
            target: "navigating:tag",
            actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId"],
          },
          TAG_INPUT_ENTER: {
            target: "navigating:tag",
            actions: ["submitEditedTagValue", "focusInput", "clearEditedId"],
          },
        },
      },
    },
  },
  {
    guards: {
      isAtMax: (ctx) => ctx.max != null && ctx.value.length === ctx.max,
      hasFocusedId: (ctx) => ctx.focusedId !== null,
      isInputFocused: (ctx) => {
        const { isInputFocused } = dom(ctx)
        return isInputFocused
      },
      isTagFocused(ctx, evt) {
        return ctx.focusedId === evt.id
      },
      isLastTagFocused(ctx) {
        const { last } = dom(ctx)
        return last?.id === ctx.focusedId
      },
      isInputValueEmpty: (ctx) => ctx.inputValue.trim().length === 0,
      hasTags: (ctx) => ctx.value.length > 0,
      isInputCaretAtStart(ctx) {
        const { input } = getElements(ctx)
        try {
          return input.selectionStart === 0 && input.selectionEnd === 0
        } catch (e) {
          return input.value === ""
        }
      },
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      focusNextTag(ctx) {
        const tags = dom(ctx)
        if (!ctx.focusedId) return
        const nextTag = tags.next(ctx.focusedId)
        if (nextTag) {
          ctx.focusedId = nextTag.id
        }
      },
      focusLastTag(ctx) {
        const tags = dom(ctx)
        ctx.focusedId = tags.last.id
      },
      focusPrevTag(ctx) {
        const tags = dom(ctx)
        if (!ctx.focusedId) return
        const tag = tags.prev(ctx.focusedId, false)
        if (tag) {
          ctx.focusedId = tag.id
        }
      },
      focusTag(ctx, evt) {
        ctx.focusedId = evt.id
      },
      deleteTag(ctx, evt) {
        const tags = dom(ctx)
        const index = tags.indexOfId(evt.id)
        ctx.value.splice(index, 1)
      },
      deleteFocusedTag(ctx) {
        const tags = dom(ctx)
        if (!ctx.focusedId) return
        const index = tags.indexOfId(ctx.focusedId)
        ctx.value.splice(index, 1)
      },
      setEditedId(ctx, evt) {
        ctx.editedId = evt.id ?? ctx.focusedId
      },
      clearEditedId(ctx) {
        ctx.editedId = null
      },
      clearEditedTagValue(ctx) {
        ctx.editedTagValue = ""
      },
      setEditedTagValue(ctx, evt) {
        ctx.editedTagValue = evt.value
      },
      submitEditedTagValue(ctx) {
        const tags = dom(ctx)
        if (!ctx.editedId) return
        const index = tags.indexOfId(ctx.editedId)
        ctx.value[index] = ctx.editedTagValue ?? ""
      },
      initEditedTagValue(ctx) {
        const tags = dom(ctx)
        if (!ctx.editedId) return
        const index = tags.indexOfId(ctx.editedId)
        ctx.editedTagValue = ctx.value[index]
      },
      focusEditedTagInput(ctx) {
        const inputId = `${ctx.editedId}-input`
        const doc = ctx.doc ?? document
        nextTick(() => {
          const input = doc.getElementById(inputId) as HTMLInputElement | null
          input?.select()
        })
      },
      setInputValue(ctx, evt) {
        ctx.inputValue = evt.value
      },
      clearFocusedId(ctx) {
        ctx.focusedId = null
      },
      focusInput(ctx) {
        nextTick(() => {
          const { input } = getElements(ctx)
          input?.focus()
        })
      },
      clearInputValue(ctx) {
        ctx.inputValue = ""
      },
      addTag(ctx) {
        ctx.value.push(ctx.inputValue.trim())
      },
      addTagFromPaste(ctx) {
        nextTick(() => {
          ctx.value.push(ctx.inputValue.trim())
          ctx.inputValue = ""
        })
      },
      resetValue(ctx) {
        ctx.value = []
      },
    },
  },
)
