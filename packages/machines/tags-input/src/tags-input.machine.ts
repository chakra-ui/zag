import { autoResizeInput } from "@zag-js/auto-resize"
import { createGuards, createMachine } from "@zag-js/core"
import { contains, isCaretAtStart, raf, setElementValue, trackFormControl } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { createLiveRegion } from "@zag-js/live-region"
import { isEqual, removeAt, uniq, warn } from "@zag-js/utils"
import * as dom from "./tags-input.dom"
import type { TagsInputSchema } from "./tags-input.types"

const { and, not, or } = createGuards<TagsInputSchema>()

export const machine = createMachine<TagsInputSchema>({
  props({ props }) {
    return {
      dir: "ltr",
      addOnPaste: false,
      editable: true,
      validate: () => true,
      delimiter: ",",
      defaultValue: [],
      defaultInputValue: "",
      max: Infinity,
      ...props,
      translations: {
        clearTriggerLabel: "Clear all tags",
        deleteTagTriggerLabel: (value) => `Delete tag ${value}`,
        tagAdded: (value) => `Added tag ${value}`,
        tagsPasted: (values) => `Pasted ${values.length} tags`,
        tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,
        tagUpdated: (value) => `Tag update to ${value}`,
        tagDeleted: (value) => `Tag ${value} deleted`,
        tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`,
        ...props.translations,
      },
    }
  },

  initialState({ prop }) {
    return prop("autoFocus") ? "focused:input" : "idle"
  },

  refs() {
    return {
      liveRegion: null,
      log: { current: null, prev: null },
    }
  },

  context({ bindable, prop }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        hash(value) {
          return value.join(", ")
        },
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      inputValue: bindable(() => ({
        sync: true,
        defaultValue: prop("defaultInputValue"),
        value: prop("inputValue"),
        onChange(value) {
          prop("onInputValueChange")?.({ inputValue: value })
        },
      })),
      fieldsetDisabled: bindable(() => ({ defaultValue: false })),
      editedTagValue: bindable(() => ({ defaultValue: "" })),
      editedTagId: bindable<string | null>(() => ({ defaultValue: null })),
      editedTagIndex: bindable<number | null>(() => ({
        defaultValue: null,
        sync: true,
      })),
      highlightedTagId: bindable<string | null>(() => ({
        defaultValue: null,
        sync: true,
        onChange(value) {
          prop("onHighlightChange")?.({ highlightedValue: value })
        },
      })),
    }
  },

  computed: {
    count: ({ context }) => context.get("value").length,
    valueAsString: ({ context }) => context.hash("value"),
    trimmedInputValue: ({ context }) => context.get("inputValue").trim(),
    isDisabled: ({ prop }) => !!prop("disabled"),
    isInteractive: ({ prop }) => !(prop("readOnly") || !!prop("disabled")),
    isAtMax: ({ context, prop }) => context.get("value").length === prop("max"),
    isOverflowing: ({ context, prop }) => context.get("value").length > prop("max"),
  },

  watch({ track, context, action, computed, refs }) {
    track([() => context.get("editedTagValue")], () => {
      action(["syncEditedTagInputValue"])
    })
    track([() => context.get("inputValue")], () => {
      action(["syncInputValue"])
    })
    track([() => context.get("highlightedTagId")], () => {
      action(["logHighlightedTag"])
    })
    track([() => computed("isOverflowing")], () => {
      action(["invokeOnInvalid"])
    })
    track([() => JSON.stringify(refs.get("log"))], () => {
      action(["announceLog"])
    })
  },

  effects: ["trackLiveRegion", "trackFormControlState"],

  exit: ["clearLog"],

  on: {
    DOUBLE_CLICK_TAG: {
      // internal: true,
      guard: "isTagEditable",
      target: "editing:tag",
      actions: ["setEditedId"],
    },
    POINTER_DOWN_TAG: {
      // internal: true,
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
      actions: ["addTag"],
    },
    INSERT_TAG: {
      // (!isAtMax || allowOverflow) && !inputValueIsEmpty
      guard: and(or(not("isAtMax"), "allowOverflow"), not("isInputValueEmpty")),
      actions: ["addTag", "clearInputValue"],
    },
    EXTERNAL_BLUR: [
      { guard: "addOnBlur", actions: ["raiseInsertTagEvent"] },
      { guard: "clearOnBlur", actions: ["clearInputValue"] },
    ],
  },

  states: {
    idle: {
      on: {
        FOCUS: {
          target: "focused:input",
        },
        POINTER_DOWN: {
          guard: not("hasHighlightedTag"),
          target: "focused:input",
        },
      },
    },

    "focused:input": {
      tags: ["focused"],
      entry: ["focusInput", "clearHighlightedId"],
      effects: ["trackInteractOutside"],
      on: {
        TYPE: {
          actions: ["setInputValue"],
        },
        BLUR: [
          {
            guard: "addOnBlur",
            target: "idle",
            actions: ["raiseInsertTagEvent"],
          },
          {
            guard: "clearOnBlur",
            target: "idle",
            actions: ["clearInputValue"],
          },
          { target: "idle" },
        ],
        ENTER: {
          actions: ["raiseInsertTagEvent"],
        },
        DELIMITER_KEY: {
          actions: ["raiseInsertTagEvent"],
        },
        ARROW_LEFT: {
          guard: and("hasTags", "isCaretAtStart"),
          target: "navigating:tag",
          actions: ["highlightLastTag"],
        },
        BACKSPACE: {
          target: "navigating:tag",
          guard: and("hasTags", "isCaretAtStart"),
          actions: ["highlightLastTag"],
        },
        DELETE: {
          guard: "hasHighlightedTag",
          actions: ["deleteHighlightedTag", "highlightTagAtIndex"],
        },
        PASTE: [
          {
            guard: "addOnPaste",
            actions: ["setInputValue", "addTagFromPaste"],
          },
          {
            actions: ["setInputValue"],
          },
        ],
      },
    },

    "navigating:tag": {
      tags: ["focused"],
      effects: ["trackInteractOutside"],
      on: {
        ARROW_RIGHT: [
          {
            guard: and("hasTags", "isCaretAtStart", not("isLastTagHighlighted")),
            actions: ["highlightNextTag"],
          },
          { target: "focused:input" },
        ],
        ARROW_LEFT: [
          {
            guard: not("isCaretAtStart"),
            target: "focused:input",
          },
          {
            actions: ["highlightPrevTag"],
          },
        ],
        BLUR: {
          target: "idle",
          actions: ["clearHighlightedId"],
        },
        ENTER: {
          guard: and("isTagEditable", "hasHighlightedTag"),
          target: "editing:tag",
          actions: ["setEditedId", "focusEditedTagInput"],
        },
        ARROW_DOWN: {
          target: "focused:input",
        },
        ESCAPE: {
          target: "focused:input",
        },
        TYPE: {
          target: "focused:input",
          actions: ["setInputValue"],
        },
        BACKSPACE: [
          {
            guard: not("isCaretAtStart"),
            target: "focused:input",
          },
          {
            guard: "isFirstTagHighlighted",
            actions: ["deleteHighlightedTag", "highlightFirstTag"],
          },
          {
            guard: "hasHighlightedTag",
            actions: ["deleteHighlightedTag", "highlightPrevTag"],
          },
          {
            actions: ["highlightLastTag"],
          },
        ],
        DELETE: [
          {
            guard: not("isCaretAtStart"),
            target: "focused:input",
          },
          {
            target: "focused:input",
            actions: ["deleteHighlightedTag", "highlightTagAtIndex"],
          },
        ],
        PASTE: [
          {
            guard: "addOnPaste",
            target: "focused:input",
            actions: ["setInputValue", "addTagFromPaste"],
          },
          {
            target: "focused:input",
            actions: ["setInputValue"],
          },
        ],
      },
    },

    "editing:tag": {
      tags: ["editing", "focused"],
      entry: ["focusEditedTagInput"],
      effects: ["autoResize"],
      on: {
        TAG_INPUT_TYPE: {
          actions: ["setEditedTagValue"],
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

  implementations: {
    guards: {
      isInputRelatedTarget: ({ scope, event }) => event.relatedTarget === dom.getInputEl(scope),
      isAtMax: ({ computed }) => computed("isAtMax"),
      hasHighlightedTag: ({ context }) => context.get("highlightedTagId") != null,
      isFirstTagHighlighted: ({ context, scope }) => {
        const value = context.get("value")
        const firstItemId = dom.getItemId(scope, { value: value[0], index: 0 })
        return firstItemId === context.get("highlightedTagId")
      },
      isEditedTagEmpty: ({ context }) => context.get("editedTagValue").trim() === "",
      isLastTagHighlighted: ({ context, scope }) => {
        const value = context.get("value")
        const lastIndex = value.length - 1
        const lastItemId = dom.getItemId(scope, { value: value[lastIndex], index: lastIndex })
        return lastItemId === context.get("highlightedTagId")
      },
      isInputValueEmpty: ({ context }) => context.get("inputValue").trim().length === 0,
      hasTags: ({ context }) => context.get("value").length > 0,
      allowOverflow: ({ prop }) => !!prop("allowOverflow"),
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      addOnBlur: ({ prop }) => prop("blurBehavior") === "add",
      clearOnBlur: ({ prop }) => prop("blurBehavior") === "clear",
      addOnPaste: ({ prop }) => !!prop("addOnPaste"),
      isTagEditable: ({ prop }) => !!prop("editable"),
      isCaretAtStart: ({ scope }) => isCaretAtStart(dom.getInputEl(scope)),
    },

    effects: {
      trackInteractOutside({ scope, prop, send }) {
        return trackInteractOutside(dom.getInputEl(scope), {
          exclude(target) {
            const itemEls = dom.getItemEls(scope)
            return itemEls.some((el) => contains(el, target))
          },
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            send({ type: "BLUR", src: "interact-outside" })
          },
        })
      },
      trackFormControlState({ context, send, scope }) {
        return trackFormControl(dom.getHiddenInputEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            const value = context.initial("value")
            send({ type: "SET_VALUE", value, src: "form-reset" })
          },
        })
      },
      autoResize({ context, prop, scope }) {
        let fn_cleanup: VoidFunction | undefined

        queueMicrotask(() => {
          const editedTagValue = context.get("editedTagValue")
          const editedTagIndex = context.get("editedTagIndex")
          if (!editedTagValue || editedTagIndex == null || !prop("editable")) return
          const inputEl = dom.getTagInputEl(scope, {
            value: editedTagValue,
            index: editedTagIndex,
          })
          fn_cleanup = autoResizeInput(inputEl)
        })

        return () => {
          fn_cleanup?.()
        }
      },
      trackLiveRegion({ scope, refs }) {
        const liveRegion = createLiveRegion({
          level: "assertive",
          document: scope.getDoc(),
        })
        refs.set("liveRegion", liveRegion)
        return () => liveRegion.destroy()
      },
    },

    actions: {
      raiseInsertTagEvent({ send }) {
        send({ type: "INSERT_TAG" })
      },
      raiseExternalBlurEvent({ send, event }) {
        send({ type: "EXTERNAL_BLUR", id: event.id })
      },
      dispatchChangeEvent({ scope, computed }) {
        dom.dispatchInputEvent(scope, computed("valueAsString"))
      },
      highlightNextTag({ context, scope }) {
        const highlightedTagId = context.get("highlightedTagId")
        if (highlightedTagId == null) return
        const next = dom.getNextEl(scope, highlightedTagId)
        context.set("highlightedTagId", next?.id ?? null)
      },
      highlightFirstTag({ context, scope }) {
        raf(() => {
          const first = dom.getFirstEl(scope)
          context.set("highlightedTagId", first?.id ?? null)
        })
      },
      highlightLastTag({ context, scope }) {
        const last = dom.getLastEl(scope)
        context.set("highlightedTagId", last?.id ?? null)
      },
      highlightPrevTag({ context, scope }) {
        const highlightedTagId = context.get("highlightedTagId")
        if (highlightedTagId == null) return
        const prev = dom.getPrevEl(scope, highlightedTagId)
        context.set("highlightedTagId", prev?.id ?? null)
      },
      highlightTag({ context, event }) {
        context.set("highlightedTagId", event.id)
      },
      highlightTagAtIndex({ context, scope }) {
        raf(() => {
          const idx = context.get("editedTagIndex")
          if (idx == null) return

          const tagEl = dom.getTagElAtIndex(scope, idx)
          if (tagEl == null) return

          context.set("highlightedTagId", tagEl.id)
          context.set("editedTagIndex", null)
        })
      },
      deleteTag({ context, scope, event, refs }) {
        const index = dom.getIndexOfId(scope, event.id)
        const value = context.get("value")[index]

        // log
        const prevLog = refs.get("log")
        refs.set("log", {
          prev: prevLog.current,
          current: { type: "delete", value },
        })

        context.set("value", (prev) => removeAt(prev, index))
      },

      deleteHighlightedTag({ context, scope, refs }) {
        const highlightedTagId = context.get("highlightedTagId")
        if (highlightedTagId == null) return

        const index = dom.getIndexOfId(scope, highlightedTagId)
        context.set("editedTagIndex", index)

        const value = context.get("value")
        // log
        const prevLog = refs.get("log")
        refs.set("log", {
          prev: prevLog.current,
          current: { type: "delete", value: value[index] },
        })

        context.set("value", (prev) => removeAt(prev, index))
      },

      setEditedId({ context, event, scope }) {
        const highlightedTagId = context.get("highlightedTagId")
        const editedTagId = event.id ?? highlightedTagId
        context.set("editedTagId", editedTagId)

        const index = dom.getIndexOfId(scope, editedTagId)
        const valueAtIndex = context.get("value")[index]

        context.set("editedTagIndex", index)
        context.set("editedTagValue", valueAtIndex)
      },
      clearEditedId({ context }) {
        context.set("editedTagId", null)
      },
      clearEditedTagValue({ context }) {
        context.set("editedTagValue", "")
      },
      setEditedTagValue({ context, event }) {
        context.set("editedTagValue", event.value)
      },
      submitEditedTagValue({ context, scope, refs }) {
        const editedTagId = context.get("editedTagId")
        if (!editedTagId) return

        const index = dom.getIndexOfId(scope, editedTagId)
        context.set("value", (prev) => {
          const value = prev.slice()
          value[index] = context.get("editedTagValue")
          return value
        })

        // log
        const prevLog = refs.get("log")
        refs.set("log", {
          prev: prevLog.current,
          current: { type: "update", value: context.get("editedTagValue") },
        })
      },

      setValueAtIndex({ context, event, refs }) {
        if (event.value) {
          context.set("value", (prev) => {
            const value = prev.slice()
            value[event.index] = event.value
            return value
          })
          // log
          const prevLog = refs.get("log")
          refs.set("log", {
            prev: prevLog.current,
            current: { type: "update", value: event.value },
          })
        } else {
          warn("You need to provide a value for the tag")
        }
      },

      focusEditedTagInput({ context, scope }) {
        raf(() => {
          const editedTagId = context.get("editedTagId")
          if (!editedTagId) return
          const editTagInputEl = dom.getEditInputEl(scope, editedTagId)
          editTagInputEl?.select()
        })
      },

      setInputValue({ context, event }) {
        context.set("inputValue", event.value)
      },

      clearHighlightedId({ context }) {
        context.set("highlightedTagId", null)
      },

      focusInput({ scope }) {
        raf(() => {
          dom.getInputEl(scope)?.focus()
        })
      },

      clearInputValue({ context }) {
        raf(() => {
          context.set("inputValue", "")
        })
      },

      syncInputValue({ context, scope }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl) return
        setElementValue(inputEl, context.get("inputValue"))
      },

      syncEditedTagInputValue({ context, event, scope }) {
        const id = context.get("editedTagId") || context.get("highlightedTagId") || event.id
        if (id == null) return
        const editTagInputEl = dom.getEditInputEl(scope, id)
        if (!editTagInputEl) return
        setElementValue(editTagInputEl, context.get("editedTagValue"))
      },

      addTag({ context, event, computed, prop, refs }) {
        const inputValue = event.value ?? computed("trimmedInputValue")
        const value = context.get("value")
        const guard = prop("validate")?.({ inputValue: inputValue, value: Array.from(value) })
        if (guard) {
          const nextValue = uniq(value.concat(inputValue))
          context.set("value", nextValue)
          // log
          const prevLog = refs.get("log")
          refs.set("log", {
            prev: prevLog.current,
            current: { type: "add", value: inputValue },
          })
        } else {
          prop("onValueInvalid")?.({ reason: "invalidTag" })
        }
      },

      addTagFromPaste({ context, computed, prop, refs }) {
        raf(() => {
          const inputValue = computed("trimmedInputValue")
          const value = context.get("value")

          const guard = prop("validate")?.({
            inputValue: inputValue,
            value: Array.from(value),
          })

          if (guard) {
            const delimiter = prop("delimiter")
            const trimmedValue = delimiter ? inputValue.split(delimiter).map((v) => v.trim()) : [inputValue]

            const nextValue = uniq(value.concat(...trimmedValue))
            context.set("value", nextValue)
            // log
            const prevLog = refs.get("log")
            refs.set("log", {
              prev: prevLog.current,
              current: { type: "paste", values: trimmedValue },
            })
            //
          } else {
            prop("onValueInvalid")?.({ reason: "invalidTag" })
          }

          context.set("inputValue", "")
        })
      },

      clearTags({ context, refs }) {
        context.set("value", [])
        const prevLog = refs.get("log")
        refs.set("log", {
          prev: prevLog.current,
          current: { type: "clear" },
        })
      },

      setValue({ context, event }) {
        context.set("value", event.value)
      },

      invokeOnInvalid({ prop, computed }) {
        if (computed("isOverflowing")) {
          prop("onValueInvalid")?.({ reason: "rangeOverflow" })
        }
      },

      clearLog({ refs }) {
        const log = refs.get("log")
        log.prev = log.current = null
      },

      logHighlightedTag({ refs, context, scope }) {
        const highlightedTagId = context.get("highlightedTagId")
        const log = refs.get("log")

        if (highlightedTagId == null || !log.current) return
        const index = dom.getIndexOfId(scope, highlightedTagId)
        const value = context.get("value")[index]

        // log
        const prevLog = refs.get("log")
        refs.set("log", {
          prev: prevLog.current,
          current: { type: "select", value },
        })
      },

      // queue logs with screen reader and get it announced
      announceLog({ refs, prop }) {
        const liveRegion = refs.get("liveRegion")
        const translations = prop("translations")

        const log = refs.get("log")
        if (!log.current || liveRegion == null) return

        const region = liveRegion
        const { current, prev } = log
        let msg: string | undefined

        switch (current.type) {
          case "add":
            msg = translations.tagAdded(current.value)
            break
          case "delete":
            msg = translations.tagDeleted(current.value)
            break
          case "update":
            msg = translations.tagUpdated(current.value)
            break
          case "paste":
            msg = translations.tagsPasted(current.values)
            break
          case "select":
            msg = translations.tagSelected(current.value)
            if (prev?.type === "delete") {
              msg = `${translations.tagDeleted(prev.value)}. ${msg}`
            } else if (prev?.type === "update") {
              msg = `${translations.tagUpdated(prev.value)}. ${msg}`
            }
            break
          default:
            break
        }

        if (msg) region.announce(msg)
      },
    },
  },
})
