import { createMachine, guards, ref } from "@ui-machines/core"
import { LiveRegion, nextTick } from "@ui-machines/dom-utils"
import { dom } from "./tags-input.dom"
import { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.types"

const { and, not, or } = guards

// (!isAtMax || allowOutOfRange) && !inputValueIsEmpty
const canAddTag = and(or(not("isAtMax"), "allowOutOfRange"), not("isInputValueEmpty"))

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
        guard: not("isTagFocused"),
        target: "navigating:tag",
        actions: ["focusTag", "focusInput"],
      },
      DELETE_TAG: {
        actions: "deleteTag",
      },
      CLEAR_ALL: {
        actions: "clearValue",
      },
      ADD_TAG: {
        actions: ["addTag", "clearInputValue"],
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
      liveRegion: null,
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

    exit: ["removeLiveRegion"],

    states: {
      unknown: {
        on: {
          SETUP: [
            { guard: "autoFocus", target: "focused:input", actions: "setup" },
            { target: "idle", actions: "setup" },
          ],
        },
      },

      idle: {
        on: {
          FOCUS: "focused:input",
          POINTER_DOWN: {
            guard: not("hasFocusedId"),
            target: "focused:input",
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
              guard: and("addOnBlur", canAddTag),
              actions: ["addTag", "clearInputValue"],
            },
            { target: "idle" },
          ],
          ENTER: {
            guard: canAddTag,
            actions: ["addTag", "clearInputValue"],
          },
          COMMA: {
            guard: canAddTag,
            actions: ["addTag", "clearInputValue"],
          },
          ARROW_LEFT: {
            guard: and("hasTags", "isInputCaretAtStart"),
            target: "navigating:tag",
            actions: "focusLastTag",
          },
          BACKSPACE: {
            target: "navigating:tag",
            guard: and("hasTags", "isInputCaretAtStart"),
            actions: "focusLastTag",
          },
          PASTE: {
            guard: "addOnPaste",
            actions: ["setInputValue", "addTagFromPaste"],
          },
        },
      },

      "navigating:tag": {
        on: {
          ARROW_RIGHT: [
            {
              guard: and("hasTags", "isInputCaretAtStart", not("isLastTagFocused")),
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
      setup(ctx, evt) {
        ctx.uid = evt.id
        ctx.doc = ref(evt.doc)
        const liveRegion = new LiveRegion({
          name: "tags-announcer",
          role: "alert",
          ariaLive: "assertive",
        })
        ctx.liveRegion = ref(liveRegion)
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
      addTag(ctx, evt) {
        const value = evt.value ?? ctx.trimmedInputValue
        const guard = ctx.validateTag?.({ inputValue: value, values: ctx.value }) ?? true
        if (guard) {
          ctx.value.push(value)
        }
      },
      addTagFromPaste(ctx) {
        nextTick(() => {
          const guard = ctx.validateTag?.({ inputValue: ctx.trimmedInputValue, values: ctx.value }) ?? true
          if (guard) ctx.value.push(...ctx.trimmedInputValue.split(",").map((v) => v.trim()))
          ctx.inputValue = ""
        })
      },
      clearValue(ctx) {
        ctx.value = []
      },
      removeLiveRegion(ctx) {
        ctx.liveRegion?.destroy()
      },
    },
  },
)
