import {
  createSelectedItemMap,
  deriveSelectionState,
  resolveSelectedItems,
  type CollectionItem,
  toggleSelectAll,
} from "@zag-js/collection"
import { setup, type Params, type Transition } from "@zag-js/core"
import { trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  clickIfLink,
  createSharedMutationObserver,
  getModifierKeys,
  isApple,
  nextTick,
  raf,
  setCaretToEnd,
} from "@zag-js/dom-query"
import { scrollIntoView, scrollToNearest } from "@zag-js/dom-query/scroll"
import { getInteractionModality, setInteractionModality, trackFocusVisible } from "@zag-js/focus-visible"
import { createLiveRegion, type LiveRegion } from "@zag-js/live-region"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, remove } from "@zag-js/utils/array"
import { isEqual, mergeWithDefault } from "@zag-js/utils/object"
import { match } from "@zag-js/utils/functions"
import { isBoolean, isPromiseLike } from "@zag-js/utils/guard"
import { collection } from "./combobox.collection"
import * as dom from "./combobox.dom"
import { defaultTranslations } from "./combobox.translations"
import type {
  ComboboxSchema,
  InputValueChangeReason,
  OpenChangeReason,
  Placement,
  ValueChangeReason,
} from "./combobox.types"
import { CREATE_VALUE, isItemLabel, isPinnedValue } from "./utils/pinned"
import { SELECT_ALL_VALUE } from "./utils/select-all"

const { guards, createMachine, choose } = setup<ComboboxSchema>()

const { and, not } = guards

function escapeWith(closeActions: string[]): Transition<ComboboxSchema, never>[] {
  const revertsText = and("isCustomValue", not("allowCustomValue"))
  return [
    { guard: and("isOpenControlled", "hasClearedValue"), actions: ["restoreClearedValue", "invokeOnClose"] },
    { guard: and("isOpenControlled", revertsText), actions: ["revertInputValue", "invokeOnClose"] },
    { guard: "isOpenControlled", actions: ["invokeOnClose"] },
    { guard: "hasClearedValue", target: "closed.focused", actions: ["restoreClearedValue", ...closeActions] },
    { guard: revertsText, target: "closed.focused", actions: ["revertInputValue", ...closeActions] },
    { target: "closed.focused", actions: closeActions },
  ]
}

/**
 * How long the input and results must stay unchanged before the result count is announced
 */
const RESULTS_ANNOUNCEMENT_DELAY = 1000

const activeDescendantObserver = /* @__PURE__ */ createSharedMutationObserver({
  subtree: true,
  attributeFilter: ["aria-activedescendant"],
})

export const machine = createMachine({
  props({ props }) {
    return {
      loopFocus: true,
      pageSize: 10,
      openOnClick: false,
      defaultValue: [],
      defaultInputValue: "",
      closeOnSelect: !props.multiple,
      allowCustomValue: false,
      selectionBehavior: props.multiple ? "clear" : "replace",
      openOnKeyPress: true,
      openOnChange: true,
      popupType: "listbox",
      navigate(details) {
        clickIfLink(details.node, details.modifiers)
      },
      collection: collection.empty(),
      ...props,
      positioning: {
        placement: "bottom",
        sameWidth: true,
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("inline") || prop("open") || prop("defaultOpen")
    return open ? "open.suggesting" : "closed.idle"
  },

  refs() {
    return {
      liveRegion: null,
      resultsRegion: null,
      chipRegion: null,
      finalFocusFrame: AnimationFrame.create(),
      highlightFrame: AnimationFrame.create(),
      initialFocusFrame: AnimationFrame.create(),
      reconcileFrame: AnimationFrame.create(),
      chipFocusFrame: AnimationFrame.create(),
      autoHighlightPending: false,
      createController: null,
      clearedValue: null,
    }
  },

  exit: ["cancelFinalFocus", "cancelHighlightFrame", "cancelAutoHighlight", "cancelFrames", "cancelCreate"],

  effects: ["trackChipRegion"],

  context({ prop, bindable, getContext, getEvent }) {
    const initialValue = prop("value") ?? prop("defaultValue") ?? []
    const initialSelectedItems = prop("collection").findMany(initialValue)

    return {
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
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
          const collection = prop("collection")
          const selectedItemMap = context.get("selectedItemMap")

          const proposed = deriveSelectionState({
            values: value,
            collection,
            selectedItemMap,
          })

          // When controlled, use prop value so cache stays in sync when controller ignores selection
          const effectiveValue = prop("value") ?? value
          const effective =
            effectiveValue === value
              ? proposed
              : deriveSelectionState({
                  values: effectiveValue,
                  collection,
                  selectedItemMap: proposed.nextSelectedItemMap,
                })

          context.set("selectedItemMap", effective.nextSelectedItemMap)

          const event = getEvent()
          const reason = (event.previousEvent || event).src as ValueChangeReason | undefined
          prop("onValueChange")?.({
            value,
            items: proposed.selectedItems,
            reason,
          })
        },
      })),
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          const item = prop("collection").find(value)
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: item,
          })
        },
      })),
      inputValue: bindable<string>(() => {
        let inputValue = prop("inputValue") || prop("defaultInputValue")
        const value = prop("value") || prop("defaultValue")

        if (!inputValue.trim() && !prop("multiple")) {
          const valueAsString = prop("collection").stringifyMany(value)
          inputValue = match(prop("selectionBehavior"), {
            replace: valueAsString,
            clear: "",
            preserve: inputValue || valueAsString,
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
      createPending: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      createError: bindable<Error | undefined>(() => ({
        defaultValue: undefined,
      })),
      selectedItemMap: bindable<Map<string, CollectionItem>>(() => {
        return {
          defaultValue: createSelectedItemMap({
            selectedItems: initialSelectedItems,
            collection: prop("collection"),
          }),
        }
      }),
    }
  },

  computed: {
    isInputValueEmpty: ({ context }) => context.get("inputValue").length === 0,
    isInteractive: ({ prop }) => !(prop("readOnly") || prop("disabled")),
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    selectedItems: ({ context, prop }) =>
      resolveSelectedItems({
        values: context.get("value"),
        collection: prop("collection"),
        selectedItemMap: context.get("selectedItemMap"),
      }),
    valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems")),
    isCustomValue: ({ context, computed }) => context.get("inputValue") !== computed("valueAsString"),
    hiddenInputValue: ({ context, computed, prop }) =>
      prop("allowCustomValue") && computed("isCustomValue")
        ? context.get("inputValue")
        : (context.get("value")[0] ?? ""),
    // Typed text that no item is labelled with
    createVisible: ({ context, computed, prop }) => {
      if (!prop("onCreate") || !computed("isInteractive")) return false
      if (context.get("createPending")) return true
      const text = context.get("inputValue").trim()
      if (!text || text === computed("valueAsString")) return false
      return !isItemLabel(prop("collection"), text)
    },
  },

  watch({ context, prop, track, action, send }) {
    track([() => context.hash("value")], () => {
      action(["syncSelectedItems", "syncHiddenInput"])
    })
    track([() => context.get("inputValue")], () => {
      action(["syncInputValue", "syncHiddenInput", "announceResults", "cancelCreate"])
    })
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem", "announceHighlightedItem"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => prop("collection").toString()], () => {
      send({ type: "CHILDREN_CHANGE" })
      action(["resolveSelectedItems", "announceResults"])
    })
    track([() => prop("loading")], () => {
      action(["announceResults"])
    })
  },

  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: ["syncSelectedItems"],
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["cancelAutoHighlight", "setHighlightedValue"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"],
    },
    "CHIP.DELETE": {
      actions: ["deleteChip", "focusChip"],
    },
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "INPUT_VALUE.SET": {
      actions: ["setInputValue"],
    },
    "INPUT.EMPTY": {
      actions: ["clearValueFromInput"],
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
    closed: {
      tags: ["closed"],
      initial: "idle",
      states: {
        idle: {
          tags: ["idle"],
          entry: ["scrollToTop", "clearHighlightedValue", "forgetClearedValue"],
          on: {
            "CONTROLLED.OPEN": {
              target: "open.interacting",
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open.interacting",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open.interacting",
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
                target: "open.interacting",
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
          tags: ["focused"],
          entry: ["scrollToTop", "clearHighlightedValue", "forgetClearedValue"],
          exit: ["cancelFinalFocus"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isChangeEvent",
                target: "open.suggesting",
              },
              {
                target: "open.interacting",
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: and("isOpenControlled", "openOnChange"),
                actions: [
                  "setInputValue",
                  "reconcileInputValue",
                  "checkEmptyInput",
                  "invokeOnOpen",
                  "highlightFirstItemIfNeeded",
                ],
              },
              {
                guard: "openOnChange",
                target: "open.suggesting",
                actions: [
                  "setInputValue",
                  "reconcileInputValue",
                  "checkEmptyInput",
                  "invokeOnOpen",
                  "highlightFirstItemIfNeeded",
                ],
              },
              {
                actions: ["setInputValue", "reconcileInputValue", "checkEmptyInput"],
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
                target: "open.interacting",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open.interacting",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.ARROW_DOWN": [
              {
                guard: "isOpenControlled",
                actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open.interacting",
                actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.ARROW_UP": [
              {
                guard: "isOpenControlled",
                actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open.interacting",
                actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open.interacting",
                actions: ["invokeOnOpen"],
              },
            ],
            "VALUE.CLEAR": {
              actions: ["clearInputValue", "clearSelectedItems"],
            },
          },
        },
      },
    },

    open: {
      tags: ["open", "focused"],
      entry: ["setInitialFocus"],
      exit: ["cancelHighlightFrame", "cancelCreate"],
      effects: [
        "trackFocusVisible",
        "scrollToHighlightedItem",
        "trackDismissableLayer",
        "trackPlacement",
        "trackLiveRegion",
      ],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "closed.focused",
            actions: ["setFinalFocus"],
          },
          {
            target: "closed.idle",
          },
        ],
        "INPUT.ENTER": [
          {
            guard: "isCreateHighlighted",
            actions: ["createItem"],
          },
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"],
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "closed.focused",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "closed.focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectHighlightedItem"],
          },
        ],
        "ITEM.CLICK": [
          {
            guard: "isCreateEvent",
            actions: ["createItem"],
          },
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "closed.focused",
            actions: ["selectItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["selectItem"],
          },
        ],
        "CREATE.SUCCESS": [
          {
            guard: not("isCurrentCreate"),
          },
          {
            guard: not("hasCreatedValue"),
            actions: ["endCreate"],
          },
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["endCreate", "selectCreatedItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "closed.focused",
            actions: ["endCreate", "selectCreatedItem", "invokeOnClose", "setFinalFocus"],
          },
          {
            actions: ["endCreate", "selectCreatedItem"],
          },
        ],
        "CREATE.ERROR": {
          guard: "isCurrentCreate",
          actions: ["failCreate"],
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed.focused",
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
            target: "closed.idle",
            actions: ["revertInputValue", "invokeOnClose"],
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed.idle",
            actions: ["invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed.focused",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "scrollToTop"],
          },
          {
            target: "closed.focused",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"],
          },
        ],
      },
      initial: "interacting",
      states: {
        interacting: {
          on: {
            CHILDREN_CHANGE: [
              {
                guard: and("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
                actions: ["clearHighlightedValue", "autoHighlightFirstItem"],
              },
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
            "INPUT.PAGE_DOWN": {
              actions: ["highlightNextPage"],
            },
            "INPUT.PAGE_UP": {
              actions: ["highlightPrevPage"],
            },
            "INPUT.ARROW_DOWN": {
              actions: ["highlightNextItem"],
            },
            "INPUT.ARROW_UP": {
              actions: ["highlightPrevItem"],
            },
            "INPUT.CHANGE": {
              target: "suggesting",
              actions: [
                "clearHighlightedValue",
                "setInputValue",
                "reconcileInputValue",
                "checkEmptyInput",
                "scrollToTop",
              ],
            },
            "ITEM.POINTER_MOVE": {
              actions: ["setHighlightedValue"],
            },
            "ITEM.POINTER_LEAVE": {
              actions: ["clearHighlightedValue"],
            },
            "LAYER.ESCAPE": escapeWith(["invokeOnClose", "setFinalFocus"]),
          },
        },

        suggesting: {
          exit: ["cancelResultsAnnouncement"],
          on: {
            CHILDREN_CHANGE: [
              {
                guard: and("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
                actions: ["clearHighlightedValue", "autoHighlightFirstItem"],
              },
              {
                guard: "isHighlightedItemRemoved",
                actions: ["clearHighlightedValue"],
              },
              {
                guard: "autoHighlight",
                actions: ["autoHighlightFirstItem"],
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
            "INPUT.PAGE_DOWN": {
              target: "interacting",
              actions: ["highlightNextPage"],
            },
            "INPUT.PAGE_UP": {
              target: "interacting",
              actions: ["highlightPrevPage"],
            },
            "INPUT.CHANGE": {
              actions: ["setInputValue", "reconcileInputValue", "checkEmptyInput", "scrollToTop"],
            },
            "LAYER.ESCAPE": escapeWith(["invokeOnClose"]),
            "ITEM.POINTER_MOVE": {
              target: "interacting",
              actions: ["setHighlightedValue"],
            },
            "ITEM.POINTER_LEAVE": {
              actions: ["clearHighlightedValue"],
            },
          },
        },
      },
    },
  },

  implementations: {
    guards: {
      isInputValueEmpty: ({ computed }) => computed("isInputValueEmpty"),
      autoHighlight: ({ prop }) => !!prop("autoHighlight"),
      isCustomValue: ({ computed }) => computed("isCustomValue"),
      hasClearedValue: ({ refs }) => refs.get("clearedValue") != null,
      allowCustomValue: ({ prop }) => !!prop("allowCustomValue"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null || !!prop("inline"),
      openOnChange: ({ prop, context }) => {
        const openOnChange = prop("openOnChange")
        if (isBoolean(openOnChange)) return openOnChange
        return !!openOnChange?.({ inputValue: context.get("inputValue") })
      },
      restoreFocus: ({ event }) => {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        return restoreFocus == null ? true : !!restoreFocus
      },
      isChangeEvent: ({ event }) => event.previousEvent?.type === "INPUT.CHANGE",
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      isHighlightedItemRemoved: (params) => !navigate(params).has(params.context.get("highlightedValue")),
      hasCollectionItems: ({ prop }) => prop("collection").size > 0,
      isCreateHighlighted: ({ context }) => context.get("highlightedValue") === CREATE_VALUE,
      isCreateEvent: ({ event }) => event.value === CREATE_VALUE,
      // A cancelled create's result is dropped
      isCurrentCreate: ({ refs, event }) => event.controller === refs.get("createController"),
      hasCreatedValue: ({ event }) => event.value != null,
    },

    effects: {
      trackFocusVisible({ scope }) {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },
      trackDismissableLayer({ send, prop, scope, context }) {
        if (prop("inline")) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(contentEl, {
          type: "listbox",
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          defer: true,
          getRootNode: scope.getRootNode,
          // Moving into the chips isn't leaving the combobox
          exclude: () => [
            dom.getInputEl(scope),
            dom.getTriggerEl(scope),
            dom.getClearTriggerEl(scope),
            dom.getChipGroupEl(scope),
          ],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside: prop("onInteractOutside"),
          onEscapeKeyDown(event) {
            event.preventDefault()
            event.stopPropagation()
            send({ type: "LAYER.ESCAPE", src: "escape-key" })
          },
          onDismiss() {
            send({
              type: "LAYER.INTERACT_OUTSIDE",
              src: "interact-outside",
              restoreFocus: false,
            })
          },
        })
      },
      // Chips can be deleted while the list is closed, so their region lives as long as the combobox
      trackChipRegion({ refs, scope }) {
        const chipRegion = createLiveRegion({ level: "polite", document: scope.getDoc() })
        refs.set("chipRegion", chipRegion)
        return () => {
          chipRegion.destroy()
          refs.set("chipRegion", null)
        }
      },
      trackLiveRegion({ refs, scope }) {
        const root = () => dom.getRootEl(scope)
        const liveRegion = createLiveRegion({
          level: "assertive",
          document: scope.getDoc(),
          root,
        })
        const resultsRegion = createLiveRegion({
          level: "polite",
          document: scope.getDoc(),
          root,
        })
        refs.set("liveRegion", liveRegion)
        refs.set("resultsRegion", resultsRegion)
        return () => {
          liveRegion.destroy()
          resultsRegion.destroy()
          refs.set("liveRegion", null)
          refs.set("resultsRegion", null)
        }
      },
      trackPlacement({ context, prop, scope }) {
        if (prop("inline")) return
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
      scrollToHighlightedItem({ context, prop, scope }) {
        let cleanups: VoidFunction[] = []

        const exec = (immediate: boolean) => {
          // don't scroll into view if we're using the pointer (or null when focus-trap autofocuses)
          const modality = getInteractionModality()
          if (modality === "pointer") return

          const highlightedValue = context.get("highlightedValue")
          if (!highlightedValue) return

          const listEl = dom.getListEl(scope)

          // Pinned options aren't virtualized rows, so they scroll like any element
          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn && !isPinnedValue(highlightedValue)) {
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
            if (immediate) scrollIntoView(itemEl, { rootEl: listEl, block: "center" })
            else scrollToNearest(itemEl, { rootEl: listEl })
          })
          cleanups.push(raf_cleanup)
        }

        const rafCleanup = raf(() => {
          setInteractionModality("virtual")
          exec(true)
        })
        cleanups.push(rafCleanup)

        // the input may mount after the machine starts (inline combobox in a dialog)
        cleanups.push(
          activeDescendantObserver.observe(scope.getRootNode(), (records) => {
            const inputEl = dom.getInputEl(scope)
            if (records.some((record) => record.target === inputEl)) exec(false)
          }),
        )

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
        context.set("highlightedValue", event.value ?? null)
      },
      clearHighlightedValue({ context }) {
        context.set("highlightedValue", null)
      },
      selectHighlightedItem(params) {
        const { context, event, prop } = params
        const collection = prop("collection")

        const highlightedValue = context.get("highlightedValue")
        if (isPinnedValue(highlightedValue)) {
          choosePinned(params, highlightedValue!)
          return
        }

        // check if item is valid
        if (!highlightedValue || !collection.has(highlightedValue)) return

        // select item
        const nextValue = prop("multiple") ? addOrRemove(context.get("value"), highlightedValue) : [highlightedValue]
        prop("onSelect")?.({
          value: nextValue,
          itemValue: highlightedValue,
          modifiers: getModifierKeys(event.modifiers),
        })
        context.set("value", nextValue)

        // set input value
        const inputValue = match(prop("selectionBehavior"), {
          replace: collection.stringifyMany(nextValue),
          clear: "",
          preserve: context.get("inputValue"),
        })
        context.set("inputValue", inputValue)
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        nextTick(() => {
          const highlightedValue = context.get("highlightedValue")
          if (highlightedValue == null) return

          const itemEl = dom.getItemEl(scope, highlightedValue)
          const listEl = dom.getListEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn && !isPinnedValue(highlightedValue)) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn({
              index: highlightedIndex,
              immediate: true,
              getElement: () => dom.getItemEl(scope, highlightedValue),
            })
            return
          }

          scrollToNearest(itemEl, { rootEl: listEl })
        })
      },
      selectItem(params) {
        const { context, event, flush, prop } = params
        if (event.value == null) return
        if (isPinnedValue(event.value)) {
          flush(() => choosePinned(params, event.value))
          return
        }
        flush(() => {
          const nextValue = prop("multiple") ? addOrRemove(context.get("value"), event.value) : [event.value]
          prop("onSelect")?.({
            value: nextValue,
            itemValue: event.value,
            modifiers: getModifierKeys(event.modifiers),
          })
          context.set("value", nextValue)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            replace: prop("collection").stringifyMany(nextValue),
            clear: "",
            preserve: context.get("inputValue"),
          })
          context.set("inputValue", inputValue)
        })
      },
      deleteChip({ context, prop, refs, event }) {
        const item = context.get("selectedItemMap").get(event.value)
        const label = (item && prop("collection").stringifyItem(item)) || event.value
        context.set("value", remove(context.get("value"), event.value))
        const translations = mergeWithDefault(defaultTranslations, prop("translations"))
        announce(refs.get("chipRegion"), translations.chipDeleted(label))
      },
      // After the chip is gone, focus the one beside it, or the input
      focusChip({ refs, scope, event }) {
        refs.get("chipFocusFrame").request(() => {
          const chipEl = event.focusValue != null ? scope.getById(dom.getChipId(scope, event.focusValue)) : null
          ;(chipEl ?? dom.getInputEl(scope))?.focus({ preventScroll: true })
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
            replace: prop("collection").stringifyMany(nextValue),
            clear: "",
            preserve: context.get("inputValue"),
          })
          context.set("inputValue", inputValue)
        })
      },
      setInitialFocus({ scope, refs }) {
        refs.get("initialFocusFrame").request(() => {
          dom.focusInputEl(scope)
        })
      },
      setFinalFocus({ scope, refs }) {
        refs.get("finalFocusFrame").request(() => {
          const triggerEl = dom.getTriggerEl(scope)
          if (triggerEl?.dataset.focusable == null) {
            dom.focusInputEl(scope)
          } else {
            dom.focusTriggerEl(scope)
          }
        })
      },
      cancelFinalFocus({ refs }) {
        refs.get("finalFocusFrame").cancel()
      },
      cancelFrames({ refs }) {
        refs.get("initialFocusFrame").cancel()
        refs.get("reconcileFrame").cancel()
        refs.get("chipFocusFrame").cancel()
      },
      cancelHighlightFrame({ refs }) {
        refs.get("highlightFrame").cancel()
      },
      // Written to the DOM so a form submitted by the same Enter key sees the new value
      syncHiddenInput({ scope, computed }) {
        dom.setHiddenInputValue(scope, computed("hiddenInputValue"))
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
        if (event.composing) return
        context.set("inputValue", event.value)
      },
      reconcileInputValue({ context, scope, refs, event }) {
        if (event.composing) return
        refs.get("reconcileFrame").request(() => {
          const value = context.get("inputValue")
          if (value === event.value) return
          const inputEl = dom.getInputEl(scope)
          const caretMoved = inputEl?.value === value && inputEl.selectionStart !== value.length
          if (caretMoved) return
          dom.syncInputValue(scope, value, event.selection)
        })
      },
      clearInputValue({ context }) {
        context.set("inputValue", "")
      },
      checkEmptyInput({ context, prop, event, send }) {
        if (event.composing || event.value !== "") return
        if (prop("multiple") || prop("selectionBehavior") !== "replace") return
        if (!context.get("value").length) return
        send({ type: "INPUT.EMPTY", src: "input-clear" })
      },
      clearValueFromInput({ context, refs, computed }) {
        const value = context.get("value")
        const map = context.get("selectedItemMap")
        const items = value.flatMap((v) => (map.has(v) ? [[v, map.get(v)!] as const] : []))
        refs.set("clearedValue", { value, label: computed("valueAsString"), items })
        context.set("value", [])
      },
      restoreClearedValue({ context, refs }) {
        const cleared = refs.get("clearedValue")
        if (!cleared) return
        refs.set("clearedValue", null)
        context.set("selectedItemMap", new Map([...context.get("selectedItemMap"), ...cleared.items]))
        context.set("value", cleared.value)
        context.set("inputValue", cleared.label)
      },
      forgetClearedValue({ refs }) {
        refs.set("clearedValue", null)
      },
      revertInputValue({ context, prop, computed }) {
        const inputValue = match(prop("selectionBehavior"), {
          replace: computed("hasSelectedItems") ? computed("valueAsString") : "",
          clear: "",
          preserve: context.get("inputValue"),
        })
        context.set("inputValue", inputValue)
      },
      setValue(params) {
        const { context, flush, event, prop } = params
        flush(() => {
          context.set("value", event.value)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            replace: prop("collection").stringifyMany(event.value),
            clear: "",
            preserve: context.get("inputValue"),
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
            replace: prop("collection").stringifyMany([]),
            clear: "",
            preserve: context.get("inputValue"),
          })
          context.set("inputValue", inputValue)
        })
      },
      scrollToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn")
        if (scrollToIndexFn) {
          const firstValue = prop("collection").firstValue
          scrollToIndexFn({
            index: 0,
            immediate: true,
            getElement: () => dom.getItemEl(scope, firstValue),
          })
        } else {
          const listEl = dom.getListEl(scope)
          if (!listEl) return
          listEl.scrollTop = 0
        }
      },
      invokeOnOpen({ prop, event, context }) {
        if (prop("inline")) return
        const reason = getOpenChangeReason(event)
        prop("onOpenChange")?.({
          open: true,
          reason,
          value: context.get("value"),
        })
      },
      invokeOnClose({ prop, event, context }) {
        if (prop("inline")) return
        const reason = getOpenChangeReason(event)
        prop("onOpenChange")?.({
          open: false,
          reason,
          value: context.get("value"),
        })
      },
      highlightFirstItem(params) {
        const { context, scope, refs } = params
        const fn = () => {
          const value = navigate(params).first
          if (value) context.set("highlightedValue", value)
        }
        // wait a frame if the content is not mounted yet
        if (dom.getContentEl(scope) || dom.getListEl(scope)) queueMicrotask(fn)
        else refs.get("highlightFrame").request(fn)
      },
      // runs after the collection changes; an explicit highlight before it runs cancels it
      autoHighlightFirstItem(params) {
        const { context, scope, refs } = params
        refs.set("autoHighlightPending", true)
        const fn = () => {
          if (!refs.get("autoHighlightPending")) return
          refs.set("autoHighlightPending", false)
          // the first match, or create when nothing matches; never select-all
          const value = navigate(params, { selectAll: false }).first
          if (value) context.set("highlightedValue", value)
        }
        if (dom.getContentEl(scope) || dom.getListEl(scope)) queueMicrotask(fn)
        else refs.get("highlightFrame").request(fn)
      },
      cancelAutoHighlight({ refs }) {
        refs.set("autoHighlightPending", false)
      },
      highlightFirstItemIfNeeded({ prop, action }) {
        if (!prop("autoHighlight")) return
        action(["autoHighlightFirstItem"])
      },
      highlightLastItem(params) {
        const { context, scope, refs } = params
        const fn = () => {
          const value = navigate(params).last
          if (value) context.set("highlightedValue", value)
        }
        // wait a frame if the content is not mounted yet
        if (dom.getContentEl(scope) || dom.getListEl(scope)) queueMicrotask(fn)
        else refs.get("highlightFrame").request(fn)
      },
      highlightNextItem(params) {
        const { context, prop } = params
        const value = navigate(params).next(context.get("highlightedValue"), !!prop("loopFocus"))
        if (value) context.set("highlightedValue", value)
      },
      highlightPrevItem(params) {
        const { context, prop } = params
        const value = navigate(params).prev(context.get("highlightedValue"), !!prop("loopFocus"))
        if (value) context.set("highlightedValue", value)
      },
      highlightNextPage({ context, prop }) {
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        const value = collection.has(highlightedValue)
          ? (collection.getNextValue(highlightedValue, prop("pageSize"), true) ?? collection.lastValue)
          : collection.firstValue
        if (value) context.set("highlightedValue", value)
      },
      highlightPrevPage({ context, prop }) {
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        const value = collection.has(highlightedValue)
          ? (collection.getPreviousValue(highlightedValue, prop("pageSize"), true) ?? collection.firstValue)
          : collection.lastValue
        if (value) context.set("highlightedValue", value)
      },
      highlightFirstSelectedItem({ context, prop, refs }) {
        refs.get("highlightFrame").request(() => {
          const [value] = prop("collection").sort(context.get("value"))
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightFirstOrSelectedItem(params) {
        const { context, prop, computed, refs } = params
        refs.get("highlightFrame").request(() => {
          let value: string | null = null
          if (computed("hasSelectedItems")) {
            value = prop("collection").sort(context.get("value"))[0]
          } else {
            value = navigate(params).first
          }
          if (value) context.set("highlightedValue", value)
        })
      },
      highlightLastOrSelectedItem(params) {
        const { context, prop, computed, refs } = params
        refs.get("highlightFrame").request(() => {
          let value: string | null = null
          if (computed("hasSelectedItems")) {
            value = prop("collection").sort(context.get("value"))[0]
          } else {
            value = navigate(params).last
          }
          if (value) context.set("highlightedValue", value)
        })
      },
      syncSelectedItems(params) {
        queueMicrotask(() => {
          const { context, prop } = params
          const collection = prop("collection")
          const value = context.get("value")
          const selectedItemMap = context.get("selectedItemMap")

          // sync selected item cache based on value
          const next = deriveSelectionState({
            values: value,
            collection,
            selectedItemMap,
          })
          context.set("selectedItemMap", next.nextSelectedItemMap)

          // set input value
          const inputValue = match(prop("selectionBehavior"), {
            replace: collection.stringifyMany(value),
            clear: "",
            preserve: context.get("inputValue"),
          })
          context.set("inputValue", inputValue)
        })
      },
      createItem({ context, prop, refs, send, event }) {
        if (context.get("createPending")) return
        const inputValue = context.get("inputValue").trim()
        const controller = new AbortController()
        refs.set("createController", controller)
        context.set("createError", undefined)

        const result = prop("onCreate")?.({
          inputValue,
          signal: controller.signal,
        })
        const modifiers = getModifierKeys(event.modifiers)
        const resolve = (value: string | void) =>
          send({
            type: "CREATE.SUCCESS",
            value,
            inputValue,
            controller,
            modifiers,
            src: "item-select",
          })
        if (!isPromiseLike(result)) return resolve(result)

        context.set("createPending", true)
        const translations = mergeWithDefault(defaultTranslations, prop("translations"))
        announce(refs.get("resultsRegion"), translations.creatingItem(inputValue))
        result.then(resolve, (reason: unknown) => {
          const error = reason instanceof Error ? reason : new Error(String(reason))
          send({ type: "CREATE.ERROR", error, inputValue, controller })
        })
      },
      cancelCreate({ context, refs }) {
        refs.get("createController")?.abort()
        refs.set("createController", null)
        context.set("createPending", false)
        context.set("createError", undefined)
      },
      endCreate({ context, refs }) {
        refs.set("createController", null)
        context.set("createPending", false)
      },
      failCreate({ context, prop, refs, event }) {
        refs.set("createController", null)
        context.set("createPending", false)
        context.set("createError", event.error)
        const translations = mergeWithDefault(defaultTranslations, prop("translations"))
        announce(
          refs.get("liveRegion"),
          translations.createItemFailed({
            inputValue: event.inputValue,
            error: event.error,
          }),
        )
      },
      selectCreatedItem({ context, prop, event }) {
        const created = event.value as string | undefined
        if (created == null) return
        const collection = prop("collection")
        const value = context.get("value")
        const multiple = prop("multiple")
        const nextValue = multiple ? (value.includes(created) ? value : [...value, created]) : [created]
        prop("onSelect")?.({
          value: nextValue,
          itemValue: created,
          modifiers: event.modifiers,
        })
        context.set("value", nextValue)
        // The created item may not be in the collection yet
        const text = event.inputValue as string
        const replace = multiple ? [collection.stringifyMany(value), text].filter(Boolean).join(", ") : text
        context.set("inputValue", match(prop("selectionBehavior"), { replace, clear: "", preserve: text }))
      },
      // Resolves values selected before their item reached the collection
      resolveSelectedItems({ context, prop, action }) {
        const collection = prop("collection")
        const selectedItemMap = context.get("selectedItemMap")
        const resolved = context.get("value").some((value) => !selectedItemMap.has(value) && collection.has(value))
        if (resolved) action(["syncSelectedItems"])
      },
      syncHighlightedItem({ context, prop }) {
        const item = prop("collection").find(context.get("highlightedValue"))
        context.set("highlightedItem", item)
      },
      announceHighlightedItem({ context, prop, refs, scope }) {
        if (!isApple()) return
        const value = context.get("highlightedValue")
        const optionText = isPinnedValue(value)
          ? dom.getItemEl(scope, value)?.textContent?.trim()
          : value
            ? prop("collection").stringifyItem(prop("collection").find(value))
            : null
        // nothing is highlighted anymore (the results emptied, say), so drop the
        // last announcement rather than leave it describing an item that is gone
        if (!optionText) {
          refs.get("liveRegion")?.clear()
          return
        }
        const isSelected = value ? context.get("value").includes(value) : false
        const translations = mergeWithDefault(defaultTranslations, prop("translations"))
        const message = translations.highlightedItem({
          label: optionText,
          selected: isSelected,
        })
        if (message) refs.get("liveRegion")?.announce(message)
      },
      announceResults({ refs, prop }) {
        refs.get("resultsRegion")?.announce(getResultsMessage(prop), RESULTS_ANNOUNCEMENT_DELAY)
      },
      cancelResultsAnnouncement({ refs }) {
        refs.get("resultsRegion")?.cancel()
      },
      toggleVisibility({ event, send, prop }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event,
        })
      },
    },
  },
})

type NavigateParams = Pick<Params<ComboboxSchema>, "prop" | "scope" | "computed">

/** Keyboard order: select-all (when rendered), the items, then create (when shown) */
function navigate({ prop, scope, computed }: NavigateParams, { selectAll = true } = {}) {
  const hasSelectAll = selectAll && prop("multiple") && dom.isShown(dom.getSelectAllEl(scope))
  return prop("collection").navigate({
    before: hasSelectAll ? [SELECT_ALL_VALUE] : [],
    after: computed("createVisible") ? [CREATE_VALUE] : [],
  })
}

/** Chooses the select-all option. The create option goes through `createItem`. */
function choosePinned({ context, prop }: Pick<Params<ComboboxSchema>, "context" | "prop">, pinned: string) {
  if (pinned !== SELECT_ALL_VALUE) return
  const collection = prop("collection")
  const nextValue = toggleSelectAll(collection, context.get("value"))
  context.set("value", nextValue)
  context.set(
    "inputValue",
    match(prop("selectionBehavior"), {
      replace: collection.stringifyMany(nextValue),
      clear: "",
      preserve: context.get("inputValue"),
    }),
  )
}

function getOpenChangeReason(event: ComboboxSchema["event"]): OpenChangeReason | undefined {
  return (event.previousEvent || event).src
}

function getResultsMessage(prop: Params<ComboboxSchema>["prop"]) {
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  if (prop("loading")) return translations.loading
  const count = prop("collection").size
  return count === 0 ? translations.noResults : translations.resultsCount(count)
}

function announce(region: LiveRegion | null, message: string) {
  if (message) region?.announce(message)
}
