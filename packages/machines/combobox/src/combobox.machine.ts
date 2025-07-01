import { ariaHidden } from "@zag-js/aria-hidden"
import { setup, type Params } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { clickIfLink, observeAttributes, observeChildren, raf, scrollIntoView, setCaretToEnd } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, isBoolean, isEqual, match, remove } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import * as dom from "./combobox.dom"
import type { ComboboxSchema, Placement } from "./combobox.types"

const { guards, createMachine, choose } = setup<ComboboxSchema>()

const { and, not } = guards

export const machine = createMachine({
  props({ props }) {
    return {
      loopFocus: true,
      openOnClick: false,
      defaultValue: [],
      closeOnSelect: !props.multiple,
      allowCustomValue: false,
      inputBehavior: "none",
      selectionBehavior: props.multiple ? "clear" : "replace",
      openOnKeyPress: true,
      openOnChange: true,
      composite: true,
      navigate({ node }) {
        clickIfLink(node)
      },
      collection: collection.empty(),
      ...props,
      positioning: {
        placement: "bottom",
        sameWidth: true,
        ...props.positioning,
      },
      translations: {
        triggerLabel: "Toggle suggestions",
        clearTriggerLabel: "Clear value",
        ...props.translations,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "suggesting" : "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        hash(value) {
          return value.join(",")
        },
        onChange(value) {
          const context = getContext()
          const prevSelectedItems = context.get("selectedItems")
          const collection = prop("collection")

          const nextItems = value.map((v) => {
            const item = prevSelectedItems.find((item) => collection.getItemValue(item) === v)
            return item || collection.find(v)
          })

          context.set("selectedItems", nextItems)

          prop("onValueChange")?.({ value, items: nextItems })
        },
      })),
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          const item = prop("collection").find(value)
          prop("onHighlightChange")?.({ highlightedValue: value, highlightedItem: item })
        },
      })),
      inputValue: bindable<string>(() => {
        let inputValue = prop("inputValue") || prop("defaultInputValue") || ""
        const value = prop("defaultValue") || prop("value") || []

        if (!inputValue.trim() && !prop("multiple")) {
          const valueAsString = prop("collection").stringifyMany(value)
          inputValue = match(prop("selectionBehavior"), {
            preserve: inputValue || valueAsString,
            replace: valueAsString,
            clear: "",
          })
        }

        return {
          defaultValue: inputValue,
          value: prop("inputValue"),
          onChange(value) {
            prop("onInputValueChange")?.({ inputValue: value })
          },
        }
      }),
      highlightedItem: bindable<string | null>(() => {
        const highlightedValue = prop("highlightedValue")
        const highlightedItem = prop("collection").find(highlightedValue)
        return { defaultValue: highlightedItem }
      }),
      selectedItems: bindable<string[]>(() => {
        const value = prop("value") || prop("defaultValue") || []
        const selectedItems = prop("collection").findMany(value)
        return { defaultValue: selectedItems }
      }),
    }
  },

  computed: {
    isInputValueEmpty: ({ context }) => context.get("inputValue").length === 0,
    isInteractive: ({ prop }) => !(prop("readOnly") || prop("disabled")),
    autoComplete: ({ prop }) => prop("inputBehavior") === "autocomplete",
    autoHighlight: ({ prop }) => prop("inputBehavior") === "autohighlight",
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    valueAsString: ({ context, prop }) => prop("collection").stringifyItems(context.get("selectedItems")),
    isCustomValue: ({ context, computed }) => context.get("inputValue") !== computed("valueAsString"),
  },

  watch({ context, prop, track, action }) {
    track([() => context.hash("value")], () => {
      action(["syncSelectedItems"])
    })
    track([() => context.get("inputValue")], () => {
      action(["syncInputValue"])
    })
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem", "autofillInputValue"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: ["syncSelectedItems"],
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedItem"],
    },
    "HIGHLIGHTED_VALUE.CLEAR": {
      actions: ["clearHighlightedItem"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"],
    },
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "INPUT_VALUE.SET": {
      actions: ["setInputValue"],
    },
    "POSITIONING.SET": {
      actions: ["reposition"],
    },
  },

  entry: choose([
    {
      guard: "autoFocus",
      actions: ["setInitialFocus"],
    },
  ]),

  states: {
    idle: {
      tags: ["idle", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedItem"],
      on: {
        "CONTROLLED.OPEN": {
          target: "interacting",
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
          },
        ],
        "INPUT.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
          },
        ],
        "INPUT.FOCUS": {
          target: "focused",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["invokeOnOpen"],
          },
        ],
        "VALUE.CLEAR": {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems", "setInitialFocus"],
        },
      },
    },

    focused: {
      tags: ["focused", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedItem"],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isChangeEvent",
            target: "suggesting",
          },
          {
            target: "interacting",
          },
        ],
        "INPUT.CHANGE": [
          {
            guard: and("isOpenControlled", "openOnChange"),
            actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"],
          },
          {
            guard: "openOnChange",
            target: "suggesting",
            actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"],
          },
          {
            actions: ["setInputValue"],
          },
        ],
        "LAYER.INTERACT_OUTSIDE": {
          target: "idle",
        },
        "INPUT.ESCAPE": {
          guard: and("isCustomValue", not("allowCustomValue")),
          actions: ["revertInputValue"],
        },
        "INPUT.BLUR": {
          target: "idle",
        },
        "INPUT.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
          },
        ],
        "INPUT.ARROW_DOWN": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "autoComplete"),
            actions: ["invokeOnOpen"],
          },
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"],
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
          },
        ],
        "INPUT.ARROW_UP": [
          // == group 1 ==
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"],
          },
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"],
          },
          // == group 2 ==
          {
            target: "interacting",
            actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "interacting",
            actions: ["invokeOnOpen"],
          },
        ],
        "VALUE.CLEAR": {
          actions: ["clearInputValue", "clearSelectedItems"],
        },
      },
    },

    interacting: {
      tags: ["open", "focused"],
      entry: ["setInitialFocus"],
      effects: ["scrollToHighlightedItem", "trackDismissableLayer", "trackPlacement", "hideOtherElements"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["setFinalFocus"],
          },
          {
            target: "idle",
          },
        ],
        "INPUT.HOME": {
          actions: ["highlightFirstItem"],
        },
        "INPUT.END": {
          actions: ["highlightLastItem"],
        },
        "INPUT.ARROW_DOWN": [
          {
            guard: and("autoComplete", "isLastItemHighlighted"),
            actions: ["clearHighlightedItem", "scrollContentToTop"],
          },
          {
            actions: ["highlightNextItem"],
          },
        ],
        "INPUT.ARROW_UP": [
          {
            guard: and("autoComplete", "isFirstItemHighlighted"),
            actions: ["clearHighlightedItem"],
          },
          {
            actions: ["highlightPrevItem"],
          },
        ],
        "INPUT.ENTER": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"],
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "focused",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectHighlightedItem"],
          },
        ],
        "INPUT.CHANGE": [
          {
            guard: "autoComplete",
            target: "suggesting",
            actions: ["setInputValue"],
          },
          {
            target: "suggesting",
            actions: ["clearHighlightedItem", "setInputValue"],
          },
        ],
        "ITEM.POINTER_MOVE": {
          actions: ["setHighlightedItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"],
        },
        "ITEM.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectItem"],
          },
        ],
        "LAYER.ESCAPE": [
          {
            guard: and("isOpenControlled", "autoComplete"),
            actions: ["syncInputValue", "invokeOnClose"],
          },
          {
            guard: "autoComplete",
            target: "focused",
            actions: ["syncInputValue", "invokeOnClose"],
          },
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        ],
        "LAYER.INTERACT_OUTSIDE": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"],
          },
          {
            guard: and("isCustomValue", not("allowCustomValue")),
            target: "idle",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"],
          },
        ],
      },
    },

    suggesting: {
      tags: ["open", "focused"],
      effects: [
        "trackDismissableLayer",
        "scrollToHighlightedItem",
        "trackPlacement",
        "trackChildNodes",
        "hideOtherElements",
      ],
      entry: ["setInitialFocus"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["setFinalFocus"],
          },
          {
            target: "idle",
          },
        ],
        CHILDREN_CHANGE: {
          guard: "autoHighlight",
          actions: ["highlightFirstItem"],
        },
        "INPUT.ARROW_DOWN": {
          target: "interacting",
          actions: ["highlightNextItem"],
        },
        "INPUT.ARROW_UP": {
          target: "interacting",
          actions: ["highlightPrevItem"],
        },
        "INPUT.HOME": {
          target: "interacting",
          actions: ["highlightFirstItem"],
        },
        "INPUT.END": {
          target: "interacting",
          actions: ["highlightLastItem"],
        },
        "INPUT.ENTER": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"],
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "focused",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectHighlightedItem"],
          },
        ],
        "INPUT.CHANGE": {
          actions: ["setInputValue"],
        },
        "LAYER.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        ],
        "ITEM.POINTER_MOVE": {
          target: "interacting",
          actions: ["setHighlightedItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"],
        },
        "LAYER.INTERACT_OUTSIDE": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"],
          },
          {
            guard: and("isCustomValue", not("allowCustomValue")),
            target: "idle",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        ],
        "ITEM.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectItem"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isInputValueEmpty: ({ computed }) => computed("isInputValueEmpty"),
      autoComplete: ({ computed, prop }) => computed("autoComplete") && !prop("multiple"),
      autoHighlight: ({ computed }) => computed("autoHighlight"),
      isFirstItemHighlighted: ({ prop, context }) => prop("collection").firstValue === context.get("highlightedValue"),
      isLastItemHighlighted: ({ prop, context }) => prop("collection").lastValue === context.get("highlightedValue"),
      isCustomValue: ({ computed }) => computed("isCustomValue"),
      allowCustomValue: ({ prop }) => !!prop("allowCustomValue"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      openOnChange: ({ prop, context }) => {
        const openOnChange = prop("openOnChange")
        if (isBoolean(openOnChange)) return openOnChange
        return !!openOnChange?.({ inputValue: context.get("inputValue") })
      },
      restoreFocus: ({ event }) => (event.restoreFocus == null ? true : !!event.restoreFocus),
      isChangeEvent: ({ event }) => event.previousEvent?.type === "INPUT.CHANGE",
      autoFocus: ({ prop }) => !!prop("autoFocus"),
    },

    effects: {
      trackDismissableLayer({ send, prop, scope }) {
        if (prop("disableLayer")) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(contentEl, {
          defer: true,
          exclude: () => [dom.getInputEl(scope), dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside: prop("onInteractOutside"),
          onEscapeKeyDown(event) {
            event.preventDefault()
            event.stopPropagation()
            send({ type: "LAYER.ESCAPE" })
          },
          onDismiss() {
            send({ type: "LAYER.INTERACT_OUTSIDE", restoreFocus: false })
          },
        })
      },
      hideOtherElements({ scope }) {
        return ariaHidden([
          dom.getInputEl(scope),
          dom.getContentEl(scope),
          dom.getTriggerEl(scope),
          dom.getClearTriggerEl(scope),
        ])
      },
      trackPlacement({ context, prop, scope }) {
        const anchorEl = () => dom.getControlEl(scope) || dom.getTriggerEl(scope)
        const positionerEl = () => dom.getPositionerEl(scope)

        context.set("currentPlacement", prop("positioning").placement)
        return getPlacement(anchorEl, positionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      // in event the options are fetched (async), we still want to auto-highlight the first option
      trackChildNodes({ scope, computed, send }) {
        if (!computed("autoHighlight")) return
        const exec = () => send({ type: "CHILDREN_CHANGE" })
        const contentEl = () => dom.getContentEl(scope)
        return observeChildren(contentEl, {
          callback: exec,
          defer: true,
        })
      },
      scrollToHighlightedItem({ context, prop, scope, event }) {
        const inputEl = dom.getInputEl(scope)

        let cleanups: VoidFunction[] = []

        const exec = (immediate: boolean) => {
          const pointer = event.current().type.includes("POINTER")
          const highlightedValue = context.get("highlightedValue")
          if (pointer || !highlightedValue) return

          const itemEl = dom.getItemEl(scope, highlightedValue)
          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn({ index: highlightedIndex, immediate })
            return
          }

          const raf_cleanup = raf(() => {
            scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
          })
          cleanups.push(raf_cleanup)
        }

        const rafCleanup = raf(() => exec(true))
        cleanups.push(rafCleanup)

        const observerCleanup = observeAttributes(inputEl, {
          attributes: ["aria-activedescendant"],
          callback: () => exec(false),
        })
        cleanups.push(observerCleanup)

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },
    },

    actions: {
      reposition({ context, prop, scope, event }) {
        const controlEl = () => dom.getControlEl(scope)
        const positionerEl = () => dom.getPositionerEl(scope)
        getPlacement(controlEl, positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      setHighlightedItem(params) {
        const { context, event } = params
        if (event.value == null) return
        context.set("highlightedValue", event.value)
      },
      clearHighlightedItem(params) {
        const { context } = params
        context.set("highlightedValue", null)
      },
      selectHighlightedItem(params) {
        const { context, prop } = params

        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue || !collection.has(highlightedValue)) return

        const nextValue = prop("multiple") ? addOrRemove(context.get("value"), highlightedValue) : [highlightedValue]

        prop("onSelect")?.({ value: nextValue, itemValue: highlightedValue })
        context.set("value", nextValue)
        context.set("inputValue", getInputValue(params))
      },
      selectItem(params) {
        const { context, event, flush, prop } = params
        if (event.value == null) return
        flush(() => {
          const nextValue = prop("multiple") ? addOrRemove(context.get("value"), event.value) : [event.value]
          prop("onSelect")?.({ value: nextValue, itemValue: event.value })
          context.set("value", nextValue)
          context.set("inputValue", getInputValue(params))
        })
      },
      clearItem(params) {
        const { context, event, flush } = params
        if (event.value == null) return
        flush(() => {
          const nextValue = remove(context.get("value"), event.value)
          context.set("value", nextValue)
          context.set("inputValue", getInputValue(params))
        })
      },
      setInitialFocus({ scope }) {
        raf(() => {
          dom.focusInputEl(scope)
        })
      },
      setFinalFocus({ scope }) {
        raf(() => {
          const triggerEl = dom.getTriggerEl(scope)
          if (triggerEl?.dataset.focusable == null) {
            dom.focusInputEl(scope)
          } else {
            dom.focusTriggerEl(scope)
          }
        })
      },
      syncInputValue({ context, scope, event }) {
        const inputEl = dom.getInputEl(scope)

        if (!inputEl) return
        inputEl.value = context.get("inputValue")

        queueMicrotask(() => {
          if (event.current().type === "INPUT.CHANGE") return
          setCaretToEnd(inputEl)
        })
      },
      setInputValue({ context, event }) {
        context.set("inputValue", event.value)
      },
      clearInputValue({ context }) {
        context.set("inputValue", "")
      },
      revertInputValue({ context, prop, computed }) {
        const selectionBehavior = prop("selectionBehavior")
        const inputValue = match(selectionBehavior, {
          replace: computed("hasSelectedItems") ? computed("valueAsString") : "",
          preserve: context.get("inputValue"),
          clear: "",
        })
        context.set("inputValue", inputValue)
      },
      setValue(params) {
        const { context, flush, event } = params
        flush(() => {
          context.set("value", event.value)
          context.set("inputValue", getInputValue(params))
        })
      },
      clearSelectedItems(params) {
        const { context, flush } = params
        flush(() => {
          context.set("value", [])
          context.set("inputValue", getInputValue(params))
        })
      },
      scrollContentToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn")
        if (scrollToIndexFn) {
          scrollToIndexFn({ index: 0, immediate: true })
        } else {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return
          contentEl.scrollTop = 0
        }
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      highlightFirstItem({ context, prop, scope }) {
        const exec = dom.getContentEl(scope) ? queueMicrotask : raf
        exec(() => {
          const value = prop("collection").firstValue
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightFirstItemIfNeeded({ computed, action }) {
        if (!computed("autoHighlight")) return
        action(["highlightFirstItem"])
      },
      highlightLastItem({ context, prop, scope }) {
        const exec = dom.getContentEl(scope) ? queueMicrotask : raf
        exec(() => {
          const value = prop("collection").lastValue
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightNextItem({ context, prop }) {
        let value: string | null = null
        const highlightedValue = context.get("highlightedValue")
        const collection = prop("collection")
        if (highlightedValue) {
          value = collection.getNextValue(highlightedValue)
          if (!value && prop("loopFocus")) value = collection.firstValue
        } else {
          value = collection.firstValue
        }
        if (value) context.set("highlightedValue", value)
      },
      highlightPrevItem({ context, prop }) {
        let value: string | null = null
        const highlightedValue = context.get("highlightedValue")
        const collection = prop("collection")
        if (highlightedValue) {
          value = collection.getPreviousValue(highlightedValue)
          if (!value && prop("loopFocus")) value = collection.lastValue
        } else {
          value = collection.lastValue
        }
        if (value) context.set("highlightedValue", value)
      },
      highlightFirstSelectedItem({ context, prop }) {
        raf(() => {
          const [value] = prop("collection").sort(context.get("value"))
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightFirstOrSelectedItem({ context, prop, computed }) {
        raf(() => {
          let value: string | null = null
          if (computed("hasSelectedItems")) {
            value = prop("collection").sort(context.get("value"))[0]
          } else {
            value = prop("collection").firstValue
          }
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightLastOrSelectedItem({ context, prop, computed }) {
        raf(() => {
          const collection = prop("collection")
          let value: string | null = null
          if (computed("hasSelectedItems")) {
            value = collection.sort(context.get("value"))[0]
          } else {
            value = collection.lastValue
          }
          if (value) context.set("highlightedValue", value)
        })
      },
      autofillInputValue({ context, computed, prop, event, scope }) {
        const inputEl = dom.getInputEl(scope)
        const collection = prop("collection")
        if (!computed("autoComplete") || !inputEl || !event.keypress) return
        const valueText = collection.stringify(context.get("highlightedValue"))
        raf(() => {
          inputEl.value = valueText || context.get("inputValue")
        })
      },
      syncSelectedItems(params) {
        queueMicrotask(() => {
          const { context, prop } = params
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(context.get("value")),
            clear: "",
          })
          context.set("selectedItems", getSelectedItems(params))
          context.set("inputValue", inputValue)
        })
      },
      syncHighlightedItem({ context, prop }) {
        const item = prop("collection").find(context.get("highlightedValue"))
        context.set("highlightedItem", item)
      },
      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})

function getInputValue({ context, prop, computed }: Params<ComboboxSchema>) {
  return match(prop("selectionBehavior"), {
    preserve: context.get("inputValue"),
    replace: computed("valueAsString"),
    clear: "",
  })
}

function getSelectedItems({ context, prop }: Params<ComboboxSchema>) {
  const collection = prop("collection")
  return context.get("value").map((v) => {
    const foundItem = context.get("selectedItems").find((item) => collection.getItemValue(item) === v)
    if (foundItem) return foundItem
    return collection.find(v)
  })
}
