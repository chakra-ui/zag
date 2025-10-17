import { ariaHidden } from "@zag-js/aria-hidden"
import { setup } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { clickIfLink, nextTick, observeAttributes, raf, scrollIntoView, setCaretToEnd } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, isBoolean, isEqual, match, remove } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import * as dom from "./combobox.dom"
import type { ComboboxSchema, InputValueChangeReason, OpenChangeReason, Placement } from "./combobox.types"

const { guards, createMachine, choose } = setup<ComboboxSchema>()

const { and, not } = guards

export const machine = createMachine({
  props({ props }) {
    return {
      loopFocus: true,
      openOnClick: false,
      defaultValue: [],
      defaultInputValue: "",
      closeOnSelect: !props.multiple,
      allowCustomValue: false,
      alwaysSubmitOnEnter: false,
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

  context({ prop, bindable, getContext, getEvent }) {
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
        let inputValue = prop("inputValue") || prop("defaultInputValue")
        const value = prop("value") || prop("defaultValue")

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
            const event = getEvent()
            const reason = (event.previousEvent || event).src as InputValueChangeReason | undefined
            prop("onInputValueChange")?.({ inputValue: value, reason })
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

  watch({ context, prop, track, action, send }) {
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
    track([() => prop("collection").toString()], () => {
      send({ type: "CHILDREN_CHANGE" })
    })
  },

  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: ["syncSelectedItems"],
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedValue"],
    },
    "HIGHLIGHTED_VALUE.CLEAR": {
      actions: ["clearHighlightedValue"],
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
      entry: ["scrollContentToTop", "clearHighlightedValue"],
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
      entry: ["scrollContentToTop", "clearHighlightedValue"],
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
        CHILDREN_CHANGE: [
          {
            guard: "isHighlightedItemRemoved",
            actions: ["clearHighlightedValue"],
          },
          {
            actions: ["scrollToHighlightedItem"],
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
            actions: ["clearHighlightedValue", "scrollContentToTop"],
          },
          {
            actions: ["highlightNextItem"],
          },
        ],
        "INPUT.ARROW_UP": [
          {
            guard: and("autoComplete", "isFirstItemHighlighted"),
            actions: ["clearHighlightedValue"],
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
            actions: ["clearHighlightedValue", "setInputValue"],
          },
        ],
        "ITEM.POINTER_MOVE": {
          actions: ["setHighlightedValue"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedValue"],
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
      effects: ["trackDismissableLayer", "scrollToHighlightedItem", "trackPlacement", "hideOtherElements"],
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
        CHILDREN_CHANGE: [
          {
            guard: "autoHighlight",
            actions: ["highlightFirstItem"],
          },
          {
            guard: "isHighlightedItemRemoved",
            actions: ["clearHighlightedValue"],
          },
        ],
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
          actions: ["setHighlightedValue"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedValue"],
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
      isHighlightedItemRemoved: ({ prop, context }) => !prop("collection").has(context.get("highlightedValue")),
    },

    effects: {
      trackDismissableLayer({ send, prop, scope }) {
        if (prop("disableLayer")) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(contentEl, {
          type: "listbox",
          defer: true,
          exclude: () => [dom.getInputEl(scope), dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside: prop("onInteractOutside"),
          onEscapeKeyDown(event) {
            event.preventDefault()
            event.stopPropagation()
            send({ type: "LAYER.ESCAPE", src: "escape-key" })
          },
          onDismiss() {
            send({ type: "LAYER.INTERACT_OUTSIDE", src: "interact-outside", restoreFocus: false })
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
      scrollToHighlightedItem({ context, prop, scope, event }) {
        const inputEl = dom.getInputEl(scope)

        let cleanups: VoidFunction[] = []

        const exec = (immediate: boolean) => {
          const pointer = event.current().type.includes("POINTER")
          const highlightedValue = context.get("highlightedValue")
          if (pointer || !highlightedValue) return

          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn({
              index: highlightedIndex,
              immediate,
              getElement: () => dom.getItemEl(scope, highlightedValue),
            })
            return
          }

          const itemEl = dom.getItemEl(scope, highlightedValue)
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
      setHighlightedValue({ context, event }) {
        if (event.value == null) return
        context.set("highlightedValue", event.value)
      },
      clearHighlightedValue({ context }) {
        context.set("highlightedValue", null)
      },
      selectHighlightedItem(params) {
        const { context, prop } = params
        const collection = prop("collection")

        // check if item is valid
        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue || !collection.has(highlightedValue)) return

        // select item
        const nextValue = prop("multiple") ? addOrRemove(context.get("value"), highlightedValue) : [highlightedValue]
        prop("onSelect")?.({ value: nextValue, itemValue: highlightedValue })
        context.set("value", nextValue)

        // set input value
        const inputValue = match(prop("selectionBehavior"), {
          preserve: context.get("inputValue"),
          replace: collection.stringifyMany(nextValue),
          clear: "",
        })
        context.set("inputValue", inputValue)
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        nextTick(() => {
          const highlightedValue = context.get("highlightedValue")
          if (highlightedValue == null) return

          const itemEl = dom.getItemEl(scope, highlightedValue)
          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn({
              index: highlightedIndex,
              immediate: true,
              getElement: () => dom.getItemEl(scope, highlightedValue),
            })
            return
          }

          scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
        })
      },
      selectItem(params) {
        const { context, event, flush, prop } = params
        if (event.value == null) return
        flush(() => {
          const nextValue = prop("multiple") ? addOrRemove(context.get("value"), event.value) : [event.value]
          prop("onSelect")?.({ value: nextValue, itemValue: event.value })
          context.set("value", nextValue)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: "",
          })
          context.set("inputValue", inputValue)
        })
      },
      clearItem(params) {
        const { context, event, flush, prop } = params
        if (event.value == null) return
        flush(() => {
          const nextValue = remove(context.get("value"), event.value)
          context.set("value", nextValue)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: "",
          })
          context.set("inputValue", inputValue)
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
        const { context, flush, event, prop } = params
        flush(() => {
          context.set("value", event.value)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(event.value),
            clear: "",
          })
          context.set("inputValue", inputValue)
        })
      },
      clearSelectedItems(params) {
        const { context, flush, prop } = params
        flush(() => {
          context.set("value", [])

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany([]),
            clear: "",
          })
          context.set("inputValue", inputValue)
        })
      },
      scrollContentToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn")
        if (scrollToIndexFn) {
          const firstValue = prop("collection").firstValue
          scrollToIndexFn({
            index: 0,
            immediate: true,
            getElement: () => dom.getItemEl(scope, firstValue),
          })
        } else {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return
          contentEl.scrollTop = 0
        }
      },
      invokeOnOpen({ prop, event }) {
        const reason = getOpenChangeReason(event)
        prop("onOpenChange")?.({ open: true, reason })
      },
      invokeOnClose({ prop, event }) {
        const reason = getOpenChangeReason(event)
        prop("onOpenChange")?.({ open: false, reason })
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
          const collection = prop("collection")
          const value = context.get("value")

          // set selected items (based on value)
          const selectedItems = value.map((v) => {
            const item = context.get("selectedItems").find((item) => collection.getItemValue(item) === v)
            return item || collection.find(v)
          })
          context.set("selectedItems", selectedItems)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: collection.stringifyMany(value),
            clear: "",
          })
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

function getOpenChangeReason(event: ComboboxSchema["event"]): OpenChangeReason | undefined {
  return (event.previousEvent || event).src
}
