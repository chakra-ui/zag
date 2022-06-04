import { createMachine, guards, ref } from "@zag-js/core"
import { autoResizeInput, createLiveRegion, nextTick, raf, trackFormReset } from "@zag-js/dom-utils"
import { dom } from "./tags-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tags-input.types"

const { and, not, or } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "tags-input",
      initial: "unknown",

      context: {
        log: { current: null, prev: null },
        uid: "",
        inputValue: "",
        editedTagValue: "",
        focusedId: null,
        editedId: null,
        initialValue: [],
        value: [],
        dir: "ltr",
        max: Infinity,
        liveRegion: null,
        blurBehavior: undefined,
        addOnPaste: false,
        allowEditTag: true,
        validate: () => true,
        delimiter: ",",
        ...ctx,
        messages: {
          clearButtonLabel: "Clear all tags",
          deleteTagButtonLabel: (value) => `Delete tag ${value}`,
          tagAdded: (value) => `Added tag ${value}`,
          tagsPasted: (values) => `Pasted ${values.length} tags`,
          tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,
          tagUpdated: (value) => `Tag update to ${value}`,
          tagDeleted: (value) => `Tag ${value} deleted`,
          tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`,
          ...ctx.messages,
        },
      },

      computed: {
        count: (ctx) => ctx.value.length,
        valueAsString: (ctx) => JSON.stringify(ctx.value),
        trimmedInputValue: (ctx) => ctx.inputValue.trim(),
        isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
        isAtMax: (ctx) => ctx.count === ctx.max,
        isOverflowing: (ctx) => ctx.count > ctx.max,
      },

      watch: {
        focusedId: ["invokeOnHighlight", "logFocused"],
        isOverflowing: "invokeOnInvalid",
        value: ["invokeOnChange", "dispatchChangeEvent"],
        log: "announceLog",
      },

      activities: ["trackFormReset"],

      exit: ["removeLiveRegion", "clearLog"],

      on: {
        DOUBLE_CLICK_TAG: {
          internal: true,
          guard: "allowEditTag",
          target: "editing:tag",
          actions: ["setEditedId", "initializeEditedTagValue"],
        },
        POINTER_DOWN_TAG: {
          internal: true,
          guard: not("isTagFocused"),
          target: "navigating:tag",
          actions: ["focusTag", "focusInput"],
        },
        SET_INPUT_VALUE: {
          actions: ["setInputValue"],
        },
        SET_VALUE: {
          actions: ["setValue"],
        },
        DELETE_TAG: {
          actions: ["deleteTag"],
        },
        EDIT_TAG: {
          actions: ["editTag"],
        },
        CLEAR_ALL: {
          actions: ["clearTags", "focusInput"],
        },
        ADD_TAG: {
          // (!isAtMax || allowOverflow) && !inputValueIsEmpty
          guard: and(or(not("isAtMax"), "allowOverflow"), not("isInputValueEmpty")),
          actions: ["addTag", "clearInputValue"],
        },
        EXT_BLUR: [
          { guard: "addOnBlur", actions: "raiseAddTagEvent" },
          { guard: "clearOnBlur", actions: "clearInputValue" },
        ],
      },

      states: {
        unknown: {
          on: {
            SETUP: [
              {
                guard: "autoFocus",
                target: "focused:input",
                actions: ["setupDocument", "checkValue"],
              },
              { target: "idle", actions: ["setupDocument", "checkValue"] },
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
          tags: ["focused"],
          entry: ["focusInput", "clearFocusedId"],
          on: {
            TYPE: {
              actions: "setInputValue",
            },
            BLUR: [
              {
                guard: "addOnBlur",
                target: "idle",
                actions: "raiseAddTagEvent",
              },
              {
                guard: "clearOnBlur",
                target: "idle",
                actions: "clearInputValue",
              },
              { target: "idle" },
            ],
            ENTER: {
              actions: ["raiseAddTagEvent"],
            },
            DELIMITER_KEY: {
              actions: ["raiseAddTagEvent"],
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
          tags: ["focused"],
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
              guard: "allowEditTag",
              target: "editing:tag",
              actions: ["setEditedId", "initializeEditedTagValue", "focusEditedTagInput"],
            },
            ARROW_DOWN: "focused:input",
            ESCAPE: "focused:input",
            TYPE: {
              target: "focused:input",
              actions: "setInputValue",
            },
            BACKSPACE: [
              {
                guard: "isFirstTagFocused",
                actions: ["deleteFocusedTag", "focusFirstTag"],
              },
              {
                actions: ["deleteFocusedTag", "focusPrevTag"],
              },
            ],
            DELETE: {
              actions: ["deleteFocusedTag", "focusTagAtIndex"],
            },
          },
        },

        "editing:tag": {
          tags: ["editing", "focused"],
          entry: "focusEditedTagInput",
          activities: ["autoResizeTagInput"],
          on: {
            TAG_INPUT_TYPE: {
              actions: "setEditedTagValue",
            },
            TAG_INPUT_ESCAPE: {
              target: "navigating:tag",
              actions: ["clearEditedTagValue", "focusInput", "clearEditedId", "focusTagAtIndex"],
            },
            TAG_INPUT_BLUR: [
              {
                guard: "isInputRelatedTarget",
                target: "navigating:tag",
                actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId"],
              },
              {
                target: "idle",
                actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId", "raiseExtBlurEvent"],
              },
            ],
            TAG_INPUT_ENTER: {
              target: "navigating:tag",
              actions: ["submitEditedTagValue", "focusInput", "clearEditedId", "focusTagAtIndex", "invokeOnTagUpdate"],
            },
          },
        },
      },
    },
    {
      guards: {
        isInputRelatedTarget: (ctx, evt) => evt.relatedTarget === dom.getInputEl(ctx),
        isAtMax: (ctx) => ctx.isAtMax,
        hasFocusedId: (ctx) => ctx.focusedId !== null,
        isTagFocused: (ctx, evt) => ctx.focusedId === evt.id,
        isFirstTagFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.focusedId,
        isLastTagFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.focusedId,
        isInputValueEmpty: (ctx) => ctx.trimmedInputValue.length === 0,
        hasTags: (ctx) => ctx.value.length > 0,
        allowOverflow: (ctx) => !!ctx.allowOverflow,
        autoFocus: (ctx) => !!ctx.autoFocus,
        addOnBlur: (ctx) => ctx.blurBehavior === "add",
        clearOnBlur: (ctx) => ctx.blurBehavior === "clear",
        addOnPaste: (ctx) => !!ctx.addOnPaste,
        allowEditTag: (ctx) => !!ctx.allowEditTag,
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

      activities: {
        trackFormReset(ctx) {
          let cleanup: VoidFunction | undefined
          raf(() => {
            cleanup = trackFormReset(dom.getHiddenInputEl(ctx), () => {
              ctx.value = ctx.initialValue
            })
          })
          return cleanup
        },
        autoResizeTagInput(ctx) {
          if (!ctx.editedTagValue || ctx.__index == null || !ctx.allowEditTag) return
          const input = dom.getTagInputEl(ctx, { value: ctx.editedTagValue, index: ctx.__index })
          return autoResizeInput(input)
        },
      },

      actions: {
        raiseAddTagEvent(_, __, { self }) {
          self.send("ADD_TAG")
        },
        raiseExtBlurEvent(_, __, { self }) {
          self.send("EXT_BLUR")
        },
        invokeOnHighlight(ctx) {
          const value = dom.getFocusedTagValue(ctx)
          ctx.onHighlight?.({ value })
        },
        invokeOnTagUpdate(ctx) {
          if (!ctx.__index) return
          const value = ctx.value[ctx.__index]
          ctx.onTagUpdate?.({ value, index: ctx.__index })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ values: ctx.value })
        },
        dispatchChangeEvent(ctx) {
          dom.dispatchInputEvent(ctx)
        },
        setupDocument(ctx, evt) {
          ctx.uid = evt.id
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
          nextTick(() => {
            ctx.liveRegion = createLiveRegion({
              level: "assertive",
              document: ctx.doc,
            })
          })
        },
        focusNextTag(ctx) {
          if (!ctx.focusedId) return
          const next = dom.getNextEl(ctx, ctx.focusedId)
          if (next) ctx.focusedId = next.id
        },
        focusFirstTag(ctx) {
          raf(() => {
            const first = dom.getFirstEl(ctx)?.id
            if (first) ctx.focusedId = first
          })
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
        focusTagAtIndex(ctx) {
          raf(() => {
            if (ctx.__index == null) return
            const el = dom.getElAtIndex(ctx, ctx.__index)
            if (el) {
              ctx.focusedId = el.id
              ctx.__index = undefined
            }
          })
        },
        deleteTag(ctx, evt) {
          const index = dom.getIndexOfId(ctx, evt.id)
          const value = ctx.value[index]

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "delete", value }

          ctx.value.splice(index, 1)
        },
        deleteFocusedTag(ctx) {
          if (!ctx.focusedId) return
          const index = dom.getIndexOfId(ctx, ctx.focusedId)
          ctx.__index = index
          const value = ctx.value[index]

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "delete", value }

          ctx.value.splice(index, 1)
        },
        setEditedId(ctx, evt) {
          ctx.editedId = evt.id ?? ctx.focusedId
          ctx.__index = dom.getIndexOfId(ctx, ctx.editedId!)
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
          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "update", value: ctx.editedTagValue! }
        },
        editTag(ctx, evt) {
          ctx.value[evt.index] = evt.value ?? ""
          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "update", value: evt.value! }
        },
        initializeEditedTagValue(ctx) {
          if (!ctx.editedId) return
          const index = dom.getIndexOfId(ctx, ctx.editedId)
          ctx.editedTagValue = ctx.value[index]
        },
        focusEditedTagInput(ctx) {
          raf(() => {
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
          raf(() => {
            dom.getInputEl(ctx)?.focus()
          })
        },
        clearInputValue(ctx) {
          ctx.inputValue = ""
        },
        addTag(ctx, evt) {
          const value = evt.value ?? ctx.trimmedInputValue
          const guard = ctx.validate?.({ inputValue: value, values: ctx.value })
          if (guard) {
            ctx.value.push(value)
            // log
            ctx.log.prev = ctx.log.current
            ctx.log.current = { type: "add", value }
          } else {
            ctx.onInvalid?.({ reason: "invalidTag" })
          }
        },
        addTagFromPaste(ctx) {
          raf(() => {
            const value = ctx.trimmedInputValue
            const guard = ctx.validate?.({ inputValue: value, values: ctx.value })
            if (guard) {
              const trimmedValue = ctx.delimiter ? value.split(ctx.delimiter).map((v) => v.trim()) : [value]
              ctx.value.push(...trimmedValue)
              // log
              ctx.log.prev = ctx.log.current
              ctx.log.current = { type: "paste", values: trimmedValue }
            } else {
              ctx.onInvalid?.({ reason: "invalidTag" })
            }
            ctx.inputValue = ""
          })
        },
        clearTags(ctx) {
          ctx.value = []
          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "clear" }
        },
        checkValue(ctx) {
          ctx.initialValue = ctx.value.slice()
        },
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
        removeLiveRegion(ctx) {
          ctx.liveRegion?.destroy()
        },
        invokeOnInvalid(ctx) {
          if (ctx.isOverflowing) {
            ctx.onInvalid?.({ reason: "rangeOverflow" })
          }
        },
        clearLog(ctx) {
          ctx.log = { prev: null, current: null }
        },
        logFocused(ctx) {
          if (!ctx.focusedId) return
          const index = dom.getIndexOfId(ctx, ctx.focusedId)

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "select", value: ctx.value[index] }
        },
        // queue logs with screen reader and get it announced
        announceLog(ctx) {
          if (!ctx.log.current || ctx.liveRegion == null) return

          const region = ctx.liveRegion
          const { current, prev } = ctx.log
          let msg: string | undefined

          switch (current.type) {
            case "add":
              msg = ctx.messages.tagAdded(current.value)
              break
            case "delete":
              msg = ctx.messages.tagDeleted(current.value)
              break
            case "update":
              msg = ctx.messages.tagUpdated(current.value)
              break
            case "paste":
              msg = ctx.messages.tagsPasted(current.values)
              break
            case "select":
              msg = ctx.messages.tagSelected(current.value)
              if (prev?.type === "delete") {
                msg = `${ctx.messages.tagDeleted(prev.value)}. ${msg}`
              } else if (prev?.type === "update") {
                msg = `${ctx.messages.tagUpdated(prev.value)}. ${msg}`
              }
              break
            default:
              break
          }

          if (msg) region.announce(msg)
        },
      },

      hookSync: true,
    },
  )
}
