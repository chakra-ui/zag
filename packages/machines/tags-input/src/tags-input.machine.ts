import { autoResizeInput } from "@zag-js/auto-resize"
import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { trackFormControl } from "@zag-js/form-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { createLiveRegion } from "@zag-js/live-region"
import { compact, isEqual, removeAt, uniq, warn } from "@zag-js/utils"
import { dom } from "./tags-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tags-input.types"

const { and, not, or } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tags-input",
      initial: ctx.autoFocus ? "focused:input" : "idle",
      context: {
        inputValue: "",
        editedTagValue: "",
        editedTagId: null,
        highlightedTagId: null,
        value: [],
        dir: "ltr",
        max: Infinity,
        blurBehavior: undefined,
        addOnPaste: false,
        editable: true,
        validate: () => true,
        delimiter: ",",
        disabled: false,
        readOnly: false,
        ...ctx,
        liveRegion: null,
        log: { current: null, prev: null },
        fieldsetDisabled: false,
        translations: {
          clearTriggerLabel: "Clear all tags",
          deleteTagTriggerLabel: (value) => `Delete tag ${value}`,
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
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.isDisabled),
        isAtMax: (ctx) => ctx.count === ctx.max,
        isOverflowing: (ctx) => ctx.count > ctx.max,
      },
      watch: {
        highlightedTagId: "logHighlightedTag",
        isOverflowing: "invokeOnInvalid",
        log: "announceLog",
        inputValue: "syncInputValue",
        editedTagValue: "syncEditedTagInputValue",
      },

      activities: ["trackLiveRegion", "trackFormControlState"],

      exit: ["clearLog"],

      on: {
        DOUBLE_CLICK_TAG: {
          internal: true,
          guard: "isTagEditable",
          target: "editing:tag",
          actions: ["setEditedId", "initializeEditedTagValue"],
        },
        POINTER_DOWN_TAG: {
          internal: true,
          target: "navigating:tag",
          actions: ["highlightTag", "focusInput"],
        },
        CLICK_DELETE_TAG: {
          target: "focused:input",
          actions: ["deleteTag"],
        },
        SET_INPUT_VALUE: {
          actions: ["setInputValue"],
        },
        SET_VALUE: {
          actions: ["setValue"],
        },
        CLEAR_TAG: {
          actions: ["deleteTag"],
        },
        SET_VALUE_AT_INDEX: {
          actions: ["setValueAtIndex"],
        },
        CLEAR_VALUE: {
          actions: ["clearTags", "clearInputValue", "focusInput"],
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
        idle: {
          on: {
            FOCUS: "focused:input",
            POINTER_DOWN: {
              guard: not("hasHighlightedTag"),
              target: "focused:input",
            },
          },
        },

        "focused:input": {
          tags: ["focused"],
          entry: ["focusInput", "clearHighlightedId"],
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
              actions: "highlightLastTag",
            },
            BACKSPACE: {
              target: "navigating:tag",
              guard: and("hasTags", "isInputCaretAtStart"),
              actions: "highlightLastTag",
            },
            PASTE: [
              {
                guard: "addOnPaste",
                actions: ["setInputValue", "addTagFromPaste"],
              },
              {
                actions: "setInputValue",
              },
            ],
          },
        },

        "navigating:tag": {
          tags: ["focused"],
          activities: ["trackInteractOutside"],
          on: {
            ARROW_RIGHT: [
              {
                guard: and("hasTags", "isInputCaretAtStart", not("isLastTagHighlighted")),
                actions: "highlightNextTag",
              },
              { target: "focused:input" },
            ],
            ARROW_LEFT: {
              actions: "highlightPrevTag",
            },
            BLUR: {
              target: "idle",
              actions: "clearHighlightedId",
            },
            ENTER: {
              guard: and("isTagEditable", "hasHighlightedTag"),
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
                guard: "isFirstTagHighlighted",
                actions: ["deleteHighlightedTag", "highlightFirstTag"],
              },
              {
                actions: ["deleteHighlightedTag", "highlightPrevTag"],
              },
            ],
            DELETE: {
              actions: ["deleteHighlightedTag", "highlightTagAtIndex"],
            },
            PASTE: [
              {
                guard: "addOnPaste",
                target: "focused:input",
                actions: ["setInputValue", "addTagFromPaste"],
              },
              {
                target: "focused:input",
                actions: "setInputValue",
              },
            ],
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
              actions: ["clearEditedTagValue", "focusInput", "clearEditedId", "highlightTagAtIndex"],
            },
            TAG_INPUT_BLUR: [
              {
                guard: "isInputRelatedTarget",
                target: "navigating:tag",
                actions: ["clearEditedTagValue", "clearHighlightedId", "clearEditedId"],
              },
              {
                target: "idle",
                actions: ["clearEditedTagValue", "clearHighlightedId", "clearEditedId", "raiseExternalBlurEvent"],
              },
            ],
            TAG_INPUT_ENTER: [
              {
                guard: "isEditedTagEmpty",
                target: "navigating:tag",
                actions: ["deleteHighlightedTag", "focusInput", "clearEditedId", "highlightTagAtIndex"],
              },
              {
                target: "navigating:tag",
                actions: ["submitEditedTagValue", "focusInput", "clearEditedId", "highlightTagAtIndex"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        isInputRelatedTarget: (ctx, evt) => evt.relatedTarget === dom.getInputEl(ctx),
        isAtMax: (ctx) => ctx.isAtMax,
        hasHighlightedTag: (ctx) => ctx.highlightedTagId !== null,
        isFirstTagHighlighted: (ctx) => {
          const firstItemId = dom.getItemId(ctx, { value: ctx.value[0], index: 0 })
          return firstItemId === ctx.highlightedTagId
        },
        isEditedTagEmpty: (ctx) => ctx.editedTagValue.trim() === "",
        isLastTagHighlighted: (ctx) => {
          const lastIndex = ctx.value.length - 1
          const lastItemId = dom.getItemId(ctx, { value: ctx.value[lastIndex], index: lastIndex })
          return lastItemId === ctx.highlightedTagId
        },
        isInputValueEmpty: (ctx) => ctx.trimmedInputValue.length === 0,
        hasTags: (ctx) => ctx.value.length > 0,
        allowOverflow: (ctx) => !!ctx.allowOverflow,
        autoFocus: (ctx) => !!ctx.autoFocus,
        addOnBlur: (ctx) => ctx.blurBehavior === "add",
        clearOnBlur: (ctx) => ctx.blurBehavior === "clear",
        addOnPaste: (ctx) => !!ctx.addOnPaste,
        isTagEditable: (ctx) => !!ctx.editable,
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
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              send({ type: "BLUR", src: "interact-outside" })
            },
          })
        },
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              send({ type: "SET_VALUE", value: initialContext.value, src: "form-reset" })
            },
          })
        },
        autoResize(ctx) {
          if (!ctx.editedTagValue || ctx.idx == null || !ctx.editable) return
          const input = dom.getTagInputEl(ctx, { value: ctx.editedTagValue, index: ctx.idx })
          return autoResizeInput(input)
        },
        trackLiveRegion(ctx) {
          ctx.liveRegion = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
          return () => ctx.liveRegion?.destroy()
        },
      },

      actions: {
        raiseAddTagEvent(_, __, { self }) {
          self.send("ADD_TAG")
        },
        raiseExternalBlurEvent(_, evt, { self }) {
          self.send({ type: "EXTERNAL_BLUR", id: evt.id })
        },
        dispatchChangeEvent(ctx) {
          dom.dispatchInputEvent(ctx)
        },
        highlightNextTag(ctx) {
          if (ctx.highlightedTagId == null) return
          const next = dom.getNextEl(ctx, ctx.highlightedTagId)
          set.highlightedId(ctx, next?.id ?? null)
        },
        highlightFirstTag(ctx) {
          raf(() => {
            const first = dom.getFirstEl(ctx)
            set.highlightedId(ctx, first?.id ?? null)
          })
        },
        highlightLastTag(ctx) {
          const last = dom.getLastEl(ctx)
          set.highlightedId(ctx, last?.id ?? null)
        },
        highlightPrevTag(ctx) {
          if (ctx.highlightedTagId == null) return
          const prev = dom.getPrevEl(ctx, ctx.highlightedTagId)
          set.highlightedId(ctx, prev?.id ?? null)
        },
        highlightTag(ctx, evt) {
          set.highlightedId(ctx, evt.id)
        },
        highlightTagAtIndex(ctx) {
          raf(() => {
            if (ctx.idx == null) return

            const tagEl = dom.getTagElAtIndex(ctx, ctx.idx)
            if (tagEl == null) return

            set.highlightedId(ctx, tagEl.id)
            ctx.idx = undefined
          })
        },
        deleteTag(ctx, evt) {
          const index = dom.getIndexOfId(ctx, evt.id)
          const value = ctx.value[index]

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "delete", value }

          set.value(ctx, removeAt(ctx.value, index))
        },
        deleteHighlightedTag(ctx) {
          if (ctx.highlightedTagId == null) return
          const index = dom.getIndexOfId(ctx, ctx.highlightedTagId)
          ctx.idx = index
          const value = ctx.value[index]

          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "delete", value }

          set.value(ctx, removeAt(ctx.value, index))
        },
        setEditedId(ctx, evt) {
          ctx.editedTagId = evt.id ?? ctx.highlightedTagId
          ctx.idx = dom.getIndexOfId(ctx, ctx.editedTagId!)
        },
        clearEditedId(ctx) {
          ctx.editedTagId = null
        },
        clearEditedTagValue(ctx) {
          ctx.editedTagValue = ""
        },
        setEditedTagValue(ctx, evt) {
          ctx.editedTagValue = evt.value
        },
        submitEditedTagValue(ctx) {
          if (!ctx.editedTagId) return

          const index = dom.getIndexOfId(ctx, ctx.editedTagId)
          set.valueAtIndex(ctx, index, ctx.editedTagValue ?? "")

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
          if (!ctx.editedTagId) return
          const index = dom.getIndexOfId(ctx, ctx.editedTagId)
          ctx.editedTagValue = ctx.value[index]
        },
        focusEditedTagInput(ctx) {
          raf(() => {
            dom.getEditInputEl(ctx)?.select()
          })
        },
        setInputValue(ctx, evt) {
          set.inputValue(ctx, evt.value)
        },
        clearHighlightedId(ctx) {
          ctx.highlightedTagId = null
        },
        focusInput(ctx) {
          raf(() => {
            dom.getInputEl(ctx)?.focus()
          })
        },
        clearInputValue(ctx) {
          raf(() => {
            set.inputValue(ctx, "")
          })
        },
        syncInputValue(ctx) {
          const inputEl = dom.getInputEl(ctx)
          dom.setValue(inputEl, ctx.inputValue)
        },
        syncEditedTagInputValue(ctx, evt) {
          const id = ctx.editedTagId || ctx.highlightedTagId || evt.id
          if (id == null) return
          const editTagInputEl = dom.getById<HTMLInputElement>(ctx, `${id}:input`)
          dom.setValue(editTagInputEl, ctx.editedTagValue)
        },
        addTag(ctx, evt) {
          const value = evt.value ?? ctx.trimmedInputValue
          const guard = ctx.validate?.({ inputValue: value, value: Array.from(ctx.value) })
          if (guard) {
            const nextValue = uniq(ctx.value.concat(value))
            set.value(ctx, nextValue)
            // log
            ctx.log.prev = ctx.log.current
            ctx.log.current = { type: "add", value }
          } else {
            ctx.onValueInvalid?.({ reason: "invalidTag" })
          }
        },
        addTagFromPaste(ctx) {
          raf(() => {
            const value = ctx.trimmedInputValue
            const guard = ctx.validate?.({ inputValue: value, value: Array.from(ctx.value) })
            if (guard) {
              const trimmedValue = ctx.delimiter ? value.split(ctx.delimiter).map((v) => v.trim()) : [value]
              const nextValue = uniq(ctx.value.concat(...trimmedValue))
              set.value(ctx, nextValue)
              // log
              ctx.log.prev = ctx.log.current
              ctx.log.current = { type: "paste", values: trimmedValue }
            } else {
              ctx.onValueInvalid?.({ reason: "invalidTag" })
            }
            set.inputValue(ctx, "")
          })
        },
        clearTags(ctx) {
          set.value(ctx, [])
          // log
          ctx.log.prev = ctx.log.current
          ctx.log.current = { type: "clear" }
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        invokeOnInvalid(ctx) {
          if (ctx.isOverflowing) {
            ctx.onValueInvalid?.({ reason: "rangeOverflow" })
          }
        },
        clearLog(ctx) {
          ctx.log = { prev: null, current: null }
        },
        logHighlightedTag(ctx) {
          if (ctx.highlightedTagId == null) return
          const index = dom.getIndexOfId(ctx, ctx.highlightedTagId)

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
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onValueChange?.({ value: Array.from(ctx.value) })
    dom.dispatchInputEvent(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    const highlightedValue = dom.getHighlightedTagValue(ctx)
    ctx.onHighlightChange?.({ highlightedValue })
  },
  valueChange: (ctx: MachineContext) => {
    ctx.onInputValueChange?.({ inputValue: ctx.inputValue })
  },
}

const set = {
  value: (ctx: MachineContext, value: string[]) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
  valueAtIndex: (ctx: MachineContext, index: number, value: string) => {
    if (isEqual(ctx.value[index], value)) return
    ctx.value[index] = value
    invoke.change(ctx)
  },
  highlightedId: (ctx: MachineContext, id: string | null) => {
    if (isEqual(ctx.highlightedTagId, id)) return
    ctx.highlightedTagId = id
    invoke.highlightChange(ctx)
  },
  inputValue: (ctx: MachineContext, value: string) => {
    if (isEqual(ctx.inputValue, value)) return
    ctx.inputValue = value
    invoke.valueChange(ctx)
  },
}
