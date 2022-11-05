import { autoResizeInput } from "@zag-js/auto-resize"
import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-utils"
import { trackFieldsetDisabled, trackFormReset } from "@zag-js/form-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { createLiveRegion } from "@zag-js/live-region"
import { compact, warn } from "@zag-js/utils"
import { dom } from "./tags-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tags-input.types"

const { and, not, or } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tags-input",
      initial: "unknown",

      context: {
        log: { current: null, prev: null },
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
        translations: {
          clearButtonLabel: "Clear all tags",
          deleteTagButtonLabel: (value) => `Delete tag ${value}`,
          tagAdded: (value) => `Added tag ${value}`,
          tagsPasted: (values) => `Pasted ${values.length} tags`,
          tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,
          tagUpdated: (value) => `Tag update to ${value}`,
          tagDeleted: (value) => `Tag ${value} deleted`,
          tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`,
          ...ctx.translations,
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
        inputValue: "syncInputValue",
        editedTagValue: "syncEditedTagValue",
      },

      activities: ["trackFormReset", "trackFieldsetDisabled"],

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
        SET_VALUE_AT_INDEX: {
          actions: ["setValueAtIndex"],
        },
        CLEAR_ALL: {
          actions: ["clearTags", "focusInput"],
        },
        ADD_TAG: {
          // (!isAtMax || allowOverflow) && !inputValueIsEmpty
          guard: and(or(not("isAtMax"), "allowOverflow"), not("isInputValueEmpty")),
          actions: ["addTag", "clearInputValue"],
        },
        EXTERNAL_BLUR: [
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
          activities: ["trackInteractOutside"],
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
          activities: ["trackInteractOutside"],
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
              guard: and("allowEditTag", "hasFocusedId"),
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
          activities: ["autoResize"],
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
                actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId", "raiseExternalBlurEvent"],
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
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              return contains(dom.getRootEl(ctx), target)
            },
            onInteractOutside() {
              send({ type: "BLUR", src: "interact-outside" })
            },
          })
        },
        trackFieldsetDisabled(ctx) {
          return trackFieldsetDisabled(dom.getRootEl(ctx), (disabled) => {
            if (disabled) {
              ctx.disabled = disabled
            }
          })
        },
        trackFormReset(ctx) {
          return trackFormReset(dom.getHiddenInputEl(ctx), () => {
            ctx.value = ctx.initialValue
          })
        },
        autoResize(ctx) {
          if (!ctx.editedTagValue || ctx.idx == null || !ctx.allowEditTag) return
          const input = dom.getTagInputEl(ctx, { value: ctx.editedTagValue, index: ctx.idx })
          return autoResizeInput(input)
        },
      },

      actions: {
        raiseAddTagEvent(_, __, { self }) {
          self.send("ADD_TAG")
        },
        raiseExternalBlurEvent(_, evt, { self }) {
          self.send({ type: "EXTERNAL_BLUR", id: evt.id })
        },
        invokeOnHighlight(ctx) {
          const value = dom.getFocusedTagValue(ctx)
          ctx.onHighlight?.({ value })
        },
        invokeOnTagUpdate(ctx) {
          if (!ctx.idx) return
          const value = ctx.value[ctx.idx]
          ctx.onTagUpdate?.({ value, index: ctx.idx })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ values: ctx.value })
        },
        dispatchChangeEvent(ctx) {
          dom.dispatchInputEvent(ctx)
        },
        setupDocument(ctx) {
          ctx.liveRegion = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
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
          ctx.focusedId = prev?.id || null
        },
        focusTag(ctx, evt) {
          ctx.focusedId = evt.id
        },
        focusTagAtIndex(ctx) {
          raf(() => {
            if (ctx.idx == null) return
            const el = dom.getElAtIndex(ctx, ctx.idx)
            if (el) {
              ctx.focusedId = el.id
              ctx.idx = undefined
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
          ctx.idx = index
          const value = ctx.value[index]

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "delete", value }

          ctx.value.splice(index, 1)
        },
        setEditedId(ctx, evt) {
          ctx.editedId = evt.id ?? ctx.focusedId
          ctx.idx = dom.getIndexOfId(ctx, ctx.editedId!)
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
        setValueAtIndex(ctx, evt) {
          if (evt.value) {
            ctx.value[evt.index] = evt.value
            // log
            ctx.log.prev = ctx.log.current
            ctx.log.current = { type: "update", value: evt.value }
          } else {
            warn("You need to provide a value for the tag")
          }
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
        syncInputValue(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input) return
          input.value = ctx.inputValue
        },
        syncEditedTagValue(ctx, evt) {
          const id = ctx.editedId || ctx.focusedId || evt.id
          if (!id) return
          const el = dom.getById(ctx, `${id}:input`) as HTMLInputElement | null
          if (!el) return
          el.value = ctx.editedTagValue
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
              msg = ctx.translations.tagAdded(current.value)
              break
            case "delete":
              msg = ctx.translations.tagDeleted(current.value)
              break
            case "update":
              msg = ctx.translations.tagUpdated(current.value)
              break
            case "paste":
              msg = ctx.translations.tagsPasted(current.values)
              break
            case "select":
              msg = ctx.translations.tagSelected(current.value)
              if (prev?.type === "delete") {
                msg = `${ctx.translations.tagDeleted(prev.value)}. ${msg}`
              } else if (prev?.type === "update") {
                msg = `${ctx.translations.tagUpdated(prev.value)}. ${msg}`
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
