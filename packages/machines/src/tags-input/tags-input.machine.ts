import { createMachine, guards, ref, StateMachine as S } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import type { DOM } from "../utils"
import { dom } from "./tags-input.dom"

const { and, not, or } = guards

export type TagsInputMachineContext = S.Computed<{
  valueAsString: string
  trimmedInputValue: string
  isInteractive: boolean
  isAtMax: boolean
}> &
  DOM.Context<{
    /**
     * Whether the input should be auto-focused
     */
    autoFocus?: boolean
    /**
     * Whether the tags input should be disabled
     */
    disabled?: boolean
    /**
     * Whether the tags input should be read-only
     */
    readonly?: boolean
    /**
     * The `id` of the currently focused tag
     */
    focusedId: string | null
    /**
     * The `id` of the currently edited tag
     */
    editedId: string | null
    /**
     * The value of the currently edited tag
     */
    editedTagValue?: string
    /**
     * The tag input's value
     */
    inputValue: string
    /**
     * The tag values
     */
    value: string[]
    /**
     * Callback fired when the tag values is updated
     */
    onChange?(values: string[]): void
    /**
     * Callback fired when a tag is focused by pointer or keyboard navigation
     */
    onHighlight?(value: string | null): void
    /**
     * Returns a boolean that determines whether a tag can be added.
     * Useful for preventing duplicates or invalid tag values.
     */
    validateTag?(opt: { inputValue: string; values: string[] }): boolean
    /**
     * Whether to add a tag when the tag input is blurred
     */
    addOnBlur?: boolean
    /**
     * Whether to add a tag when you paste values into the tag input
     */
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
     * The name attribute for the input. Useful for form submissions
     */
    name?: string
  }>

export type TagsInputMachineState = {
  value: "unknown" | "idle" | "navigating:tag" | "focused:input" | "editing:tag"
}

// (!isAtMax || allowOutOfRange) && !inputValueIsEmpty
const allowAddTag = and(or(not("isAtMax"), "allowOutOfRange"), not("isInputValueEmpty"))

export const tagsInputMachine = createMachine<TagsInputMachineContext, TagsInputMachineState>(
  {
    id: "tags-input",
    initial: "unknown",
    on: {
      DOUBLE_CLICK_TAG: {
        target: "editing:tag",
        actions: ["setEditedId", "initEditedTagValue"],
      },
      POINTER_DOWN_TAG: {
        cond: not("isTagFocused"),
        target: "navigating:tag",
        actions: ["focusTag", "focusInput"],
      },
      DELETE_TAG: {
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
      dir: "ltr",
      max: Infinity,
    },
    computed: {
      valueAsString: (ctx) => ctx.value.join(", "),
      trimmedInputValue: (ctx) => ctx.inputValue.trim(),
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
      isAtMax: (ctx) => ctx.max != null && ctx.value.length === ctx.max,
    },
    watch: {
      focusedId: "invokeOnHighlight",
    },
    states: {
      unknown: {
        on: {
          SETUP: [
            {
              cond: "autoFocus",
              target: "focused:input",
              actions: ["setId", "setDocument"],
            },
            {
              target: "idle",
              actions: ["setId", "setOwnerDocument"],
            },
          ],
        },
      },

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
              cond: and("hasTags", "isInputCaretAtStart", not("isLastTagFocused")),
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
            actions: ["setEditedId", "initEditedTagValue", "focusEditedTagInput"],
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
              cond: and("addOnBlur", allowAddTag),
              actions: ["addTag", "clearInputValue"],
            },
            { target: "idle" },
          ],
          ENTER: {
            cond: allowAddTag,
            actions: ["addTag", "clearInputValue"],
          },
          COMMA: {
            cond: allowAddTag,
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
            cond: "addOnPaste",
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
      isAtMax: (ctx) => ctx.isAtMax,
      hasFocusedId: (ctx) => ctx.focusedId !== null,
      isInputFocused: (ctx) => dom.isInputFocused(ctx),
      isTagFocused: (ctx, evt) => ctx.focusedId === evt.id,
      isLastTagFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.focusedId,
      isInputValueEmpty: (ctx) => ctx.trimmedInputValue.length === 0,
      hasTags: (ctx) => ctx.value.length > 0,
      allowOutOfRange: (ctx) => !!ctx.allowOutOfRange,
      autoFocus: (ctx) => !!ctx.autoFocus,
      addOnBlur: (ctx) => !!ctx.addOnBlur,
      addOnPaste: (ctx) => !!ctx.addOnPaste,
      isInputCaretAtStart(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input) return false
        try {
          return input.selectionStart === 0 && input.selectionEnd === 0
        } catch (e) {
          return input.value === ""
        }
      },
    },
    actions: {
      invokeOnHighlight(ctx) {
        const value = dom.getFocusedTagValue(ctx)
        ctx.onHighlight?.(value)
      },
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      focusNextTag(ctx) {
        if (!ctx.focusedId) return
        const next = dom.getNextEl(ctx, ctx.focusedId)
        if (next) ctx.focusedId = next.id
      },
      focusLastTag(ctx) {
        const last = dom.getLastEl(ctx)
        if (last) ctx.focusedId = last.id
      },
      focusPrevTag(ctx) {
        if (!ctx.focusedId) return
        const prev = dom.getPrevEl(ctx, ctx.focusedId)
        if (prev) ctx.focusedId = prev.id
      },
      focusTag(ctx, evt) {
        ctx.focusedId = evt.id
      },
      deleteTag(ctx, evt) {
        const index = dom.getIndexOfId(ctx, evt.id)
        ctx.value.splice(index, 1)
      },
      deleteFocusedTag(ctx) {
        if (!ctx.focusedId) return
        const index = dom.getIndexOfId(ctx, ctx.focusedId)
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
        if (!ctx.editedId) return
        const index = dom.getIndexOfId(ctx, ctx.editedId)
        ctx.value[index] = ctx.editedTagValue ?? ""
      },
      initEditedTagValue(ctx) {
        if (!ctx.editedId) return
        const index = dom.getIndexOfId(ctx, ctx.editedId)
        ctx.editedTagValue = ctx.value[index]
      },
      focusEditedTagInput(ctx) {
        nextTick(() => {
          dom.getEditInputEl(ctx)?.select()
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
          dom.getInputEl(ctx)?.focus()
        })
      },
      clearInputValue(ctx) {
        ctx.inputValue = ""
      },
      addTag(ctx) {
        const cond = ctx.validateTag?.({ inputValue: ctx.trimmedInputValue, values: ctx.value }) ?? true
        if (cond) ctx.value.push(ctx.trimmedInputValue)
      },
      addTagFromPaste(ctx) {
        nextTick(() => {
          const cond = ctx.validateTag?.({ inputValue: ctx.trimmedInputValue, values: ctx.value }) ?? true
          if (cond) ctx.value.push(ctx.trimmedInputValue)
          ctx.inputValue = ""
        })
      },
      resetValue(ctx) {
        ctx.value = []
      },
    },
  },
)
