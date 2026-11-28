import { setup, type Params, type Transition } from "@zag-js/core"
import { trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  clickIfLink,
  getModifierKeys,
  type ModifierKeys,
  isApple,
  isTypingAtEnd,
  raf,
} from "@zag-js/dom-query"
import { createSharedMutationObserver } from "@zag-js/dom-query/observe"
import { scrollIntoView, scrollToNearest } from "@zag-js/dom-query/scroll"
import { getInteractionModality, setInteractionModality, trackFocusVisible } from "@zag-js/focus-visible"
import { createLiveRegion } from "@zag-js/dom-query/live-region"
import { getPlacement } from "@zag-js/popper"
import { isBoolean } from "@zag-js/utils/guard"
import { mergeWithDefault } from "@zag-js/utils/object"
import { collection } from "./autocomplete.collection"
import * as dom from "./autocomplete.dom"
import { findCompletion } from "./utils/completion"
import { defaultTranslations } from "./autocomplete.translations"
import type { AutocompleteSchema, OpenChangeReason, Placement, ValueChangeReason } from "./autocomplete.types"

const { guards, createMachine, choose } = setup<AutocompleteSchema>()

const { and, or } = guards

/** How long the text and results must stay unchanged before the count is announced */
const RESULTS_ANNOUNCEMENT_DELAY = 1000

const activeDescendantObserver = /* @__PURE__ */ createSharedMutationObserver({
  subtree: true,
  attributeFilter: ["aria-activedescendant"],
})

type Actions = string[]

/** Opens, or only notifies when `open` is controlled */
const openWith = (actions: Actions = []): Transition<AutocompleteSchema, never>[] => [
  { guard: "isOpenControlled", actions: [...actions, "invokeOnOpen"] },
  { target: "open", actions: [...actions, "invokeOnOpen"] },
]

/** Closes, or only notifies when `open` is controlled */
const closeWith = (
  target: "closed.focused" | "closed.idle",
  actions: Actions = [],
  finalFocus = target === "closed.focused",
): Transition<AutocompleteSchema, never>[] => [
  { guard: "isOpenControlled", actions: [...actions, "invokeOnClose"] },
  { target, actions: [...actions, "invokeOnClose", ...(finalFocus ? ["setFinalFocus"] : [])] },
]

export const machine = createMachine({
  props({ props }) {
    return {
      mode: "list",
      loopFocus: true,
      pageSize: 10,
      openOnClick: false,
      openOnChange: true,
      openOnKeyPress: true,
      defaultValue: "",
      navigate(details) {
        clickIfLink(details.node, details.modifiers)
      },
      collection: collection.empty(),
      ...props,
      positioning: {
        placement: "bottom-start",
        sameWidth: true,
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    return prop("open") || prop("defaultOpen") ? "open" : "closed.idle"
  },

  refs() {
    return {
      liveRegion: null,
      resultsRegion: null,
      suggesting: false,
      completing: false,
      highlightFrame: AnimationFrame.create(),
      initialFocusFrame: AnimationFrame.create(),
      finalFocusFrame: AnimationFrame.create(),
      reconcileFrame: AnimationFrame.create(),
    }
  },

  exit: ["cancelFrames"],

  context({ prop, bindable, getEvent }) {
    return {
      layer: bindable<LayerSnapshot | null>(() => ({ defaultValue: null })),
      currentPlacement: bindable<Placement | undefined>(() => ({ defaultValue: undefined })),
      value: bindable<string>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          const event = getEvent()
          const reason = (event.previousEvent || event).src as ValueChangeReason | undefined
          prop("onValueChange")?.({ value, reason })
        },
      })),
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") ?? null,
        value: prop("highlightedValue"),
        onChange(value) {
          const highlightedItem = prop("collection").find(value)
          prop("onHighlightChange")?.({ highlightedValue: value, highlightedItem })
        },
      })),
      preview: bindable<string | null>(() => ({ defaultValue: null })),
      highlightedItem: bindable(() => ({
        defaultValue: prop("collection").find(prop("highlightedValue") ?? prop("defaultHighlightedValue")),
      })),
    }
  },

  computed: {
    isInteractive: ({ prop }) => !(prop("readOnly") || prop("disabled")),
    inlineCompletion: ({ prop }) => !prop("readOnly") && (prop("mode") === "both" || prop("mode") === "inline"),
  },

  watch({ context, prop, track, action, send }) {
    track([() => context.get("value")], () => {
      action(["syncInputText", "announceResults"])
    })
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem", "previewHighlightedItem", "announceHighlightedItem"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => prop("collection").toString()], () => {
      send({ type: "CHILDREN_CHANGE" })
      action(["announceResults"])
    })
    track([() => prop("loading")], () => {
      action(["announceResults"])
    })
  },

  on: {
    "VALUE.SET": { actions: ["setValue"] },
    "ITEM.SELECT": { actions: ["selectItem"] },
    "HIGHLIGHTED_VALUE.SET": { actions: ["stopSuggesting", "setHighlightedValue"] },
    "POSITIONING.SET": { actions: ["reposition"] },
  },

  entry: choose([{ guard: "autoFocus", actions: ["setInitialFocus"] }]),

  states: {
    closed: {
      tags: ["closed"],
      initial: "idle",
      // runs after the closing transition, so a preview it did not commit is undone
      entry: ["restoreInputText", "clearHighlightedValue", "stopSuggesting"],
      states: {
        idle: {
          on: {
            "CONTROLLED.OPEN": { target: "open" },
            "INPUT.FOCUS": { target: "focused" },
            "INPUT.CLICK": openWith(),
            "TRIGGER.CLICK": openWith(["setInitialFocus"]),
            OPEN: openWith(),
            "VALUE.CLEAR": { target: "focused", actions: ["clearValue", "setInitialFocus"] },
          },
        },
        focused: {
          tags: ["focused"],
          exit: ["cancelFinalFocus"],
          on: {
            "CONTROLLED.OPEN": { target: "open" },
            "INPUT.BLUR": { target: "idle" },
            "LAYER.INTERACT_OUTSIDE": { target: "idle" },
            "INPUT.CHANGE": [
              {
                guard: and("isOpenControlled", "openOnChange"),
                actions: [
                  "startSuggesting",
                  "setInputValue",
                  "reconcileInputValue",
                  "highlightSuggestion",
                  "invokeOnOpen",
                ],
              },
              {
                guard: "openOnChange",
                target: "open",
                actions: [
                  "startSuggesting",
                  "setInputValue",
                  "reconcileInputValue",
                  "highlightSuggestion",
                  "invokeOnOpen",
                ],
              },
              { actions: ["setInputValue", "reconcileInputValue"] },
            ],
            "INPUT.ARROW_DOWN": [
              { guard: and("inlineCompletion", "isOpenControlled"), actions: ["invokeOnOpen"] },
              { guard: "inlineCompletion", target: "open", actions: ["invokeOnOpen"] },
              ...openWith(["highlightFirstItem"]),
            ],
            "INPUT.ARROW_UP": [
              { guard: and("inlineCompletion", "isOpenControlled"), actions: ["invokeOnOpen"] },
              { guard: "inlineCompletion", target: "open", actions: ["invokeOnOpen"] },
              ...openWith(["highlightLastItem"]),
            ],
            "INPUT.CLICK": openWith(),
            "TRIGGER.CLICK": openWith(["setInitialFocus"]),
            OPEN: openWith(),
            "VALUE.CLEAR": { actions: ["clearValue"] },
          },
        },
      },
    },

    open: {
      tags: ["open", "focused"],
      entry: ["setInitialFocus"],
      exit: ["cancelHighlightFrame", "cancelResultsAnnouncement"],
      effects: [
        "trackFocusVisible",
        "trackDismissableLayer",
        "trackPlacement",
        "trackLiveRegion",
        "scrollToHighlightedItem",
      ],
      on: {
        "CONTROLLED.CLOSE": [
          { guard: "restoreFocus", target: "closed.focused", actions: ["setFinalFocus"] },
          { target: "closed.idle" },
        ],
        CHILDREN_CHANGE: [
          { guard: and("isSuggesting", or("autoHighlight", "isCompleting")), actions: ["highlightSuggestion"] },
          { guard: "isHighlightedItemRemoved", actions: ["clearHighlightedValue"] },
        ],
        "INPUT.CHANGE": [
          {
            guard: "autoHighlight",
            actions: ["clearPreview", "startSuggesting", "setInputValue", "reconcileInputValue", "highlightSuggestion"],
          },
          {
            actions: [
              "clearPreview",
              "startSuggesting",
              "setInputValue",
              "reconcileInputValue",
              "clearHighlightedValue",
              "highlightSuggestion",
              "scrollToTop",
            ],
          },
        ],
        "INPUT.ARROW_DOWN": [
          {
            guard: and("inlineCompletion", "isLastItemHighlighted"),
            actions: ["stopSuggesting", "clearHighlightedValue", "scrollToTop"],
          },
          { actions: ["stopSuggesting", "highlightNextItem"] },
        ],
        "INPUT.ARROW_UP": [
          {
            guard: and("inlineCompletion", "isFirstItemHighlighted"),
            actions: ["stopSuggesting", "clearHighlightedValue"],
          },
          { actions: ["stopSuggesting", "highlightPrevItem"] },
        ],
        "PREVIEW.COMMIT": { guard: "hasPreview", actions: ["commitPreview", "stopSuggesting"] },
        "INPUT.PAGE_DOWN": { actions: ["stopSuggesting", "highlightNextPage"] },
        "INPUT.PAGE_UP": { actions: ["stopSuggesting", "highlightPrevPage"] },
        "ITEM.POINTER_MOVE": { actions: ["stopSuggesting", "setHighlightedValue"] },
        "ITEM.POINTER_LEAVE": { actions: ["clearHighlightedValue"] },
        "INPUT.ENTER": [
          {
            guard: and("hasHighlightedItem", "isOpenControlled"),
            actions: ["selectHighlightedItem", "invokeOnClose", "submitOnSelect"],
          },
          {
            guard: "hasHighlightedItem",
            target: "closed.focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "submitOnSelect"],
          },
          // nothing highlighted: the text stands and Enter submits the form
          ...closeWith("closed.focused", [], false),
        ],
        "ITEM.CLICK": closeWith("closed.focused", ["selectItem", "submitOnSelect"]),
        "TRIGGER.CLICK": closeWith("closed.focused"),
        CLOSE: closeWith("closed.focused"),
        "LAYER.ESCAPE": closeWith("closed.focused"),
        "LAYER.INTERACT_OUTSIDE": closeWith("closed.idle", ["commitPreview"]),
        "VALUE.CLEAR": closeWith("closed.focused", ["clearValue"]),
      },
    },
  },

  implementations: {
    guards: {
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      autoHighlight: ({ prop }) => !!prop("autoHighlight"),
      inlineCompletion: ({ computed }) => computed("inlineCompletion"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      isSuggesting: ({ refs }) => refs.get("suggesting"),
      isCompleting: ({ refs }) => refs.get("completing"),
      hasPreview: ({ context }) => context.get("preview") != null,
      hasHighlightedItem: ({ context, prop }) => prop("collection").has(context.get("highlightedValue")),
      isHighlightedItemRemoved: ({ context, prop }) => !prop("collection").has(context.get("highlightedValue")),
      isFirstItemHighlighted: ({ context, prop }) => prop("collection").firstValue === context.get("highlightedValue"),
      isLastItemHighlighted: ({ context, prop }) => prop("collection").lastValue === context.get("highlightedValue"),
      openOnChange: ({ prop, event }) => {
        const openOnChange = prop("openOnChange")
        if (isBoolean(openOnChange)) return openOnChange
        return !!openOnChange?.({ value: event.value, reason: "input-change" })
      },
      restoreFocus: ({ event }) => {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        return restoreFocus == null ? true : !!restoreFocus
      },
    },

    effects: {
      trackFocusVisible({ scope }) {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },
      trackDismissableLayer({ send, prop, scope, context }) {
        return trackDismissableElement(() => dom.getContentEl(scope), {
          type: "listbox",
          defer: true,
          getRootNode: scope.getRootNode,
          onLayerChange(layer) {
            context.set("layer", layer)
          },
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
      trackPlacement({ context, prop, scope }) {
        const anchorEl = () => dom.getControlEl(scope) || dom.getInputEl(scope)
        context.set("currentPlacement", prop("positioning").placement)
        return getPlacement(anchorEl, () => dom.getPositionerEl(scope), {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      trackLiveRegion({ refs, scope }) {
        const root = () => dom.getRootEl(scope)
        const liveRegion = createLiveRegion({ level: "assertive", document: scope.getDoc(), root })
        const resultsRegion = createLiveRegion({ level: "polite", document: scope.getDoc(), root })
        refs.set("liveRegion", liveRegion)
        refs.set("resultsRegion", resultsRegion)
        return () => {
          liveRegion.destroy()
          resultsRegion.destroy()
          refs.set("liveRegion", null)
          refs.set("resultsRegion", null)
        }
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        const cleanups: VoidFunction[] = []
        const exec = (immediate: boolean) => {
          if (getInteractionModality() === "pointer") return
          const highlightedValue = context.get("highlightedValue")
          if (!highlightedValue) return
          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            scrollToIndexFn({
              index: prop("collection").indexOf(highlightedValue),
              immediate,
              getElement: () => dom.getItemEl(scope, highlightedValue),
            })
            return
          }
          const itemEl = dom.getItemEl(scope, highlightedValue)
          const listEl = dom.getListEl(scope)
          cleanups.push(
            raf(() => {
              if (immediate) scrollIntoView(itemEl, { rootEl: listEl, block: "center" })
              else scrollToNearest(itemEl, { rootEl: listEl })
            }),
          )
        }
        cleanups.push(
          raf(() => {
            setInteractionModality("virtual")
            exec(true)
          }),
        )
        cleanups.push(
          activeDescendantObserver.observe(scope.getRootNode(), (records) => {
            const inputEl = dom.getInputEl(scope)
            if (records.some((record) => record.target === inputEl)) exec(false)
          }),
        )
        return () => cleanups.forEach((fn) => fn())
      },
    },

    actions: {
      reposition({ context, prop, scope, event }) {
        getPlacement(
          () => dom.getControlEl(scope),
          () => dom.getPositionerEl(scope),
          {
            ...prop("positioning"),
            ...event.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              context.set("currentPlacement", data.placement)
            },
          },
        )
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      clearValue({ context }) {
        context.set("value", "")
      },
      setInputValue({ context, event }) {
        if (event.composing) return
        context.set("value", event.value)
      },
      // A controlled value that ignored the edit puts its own text back
      reconcileInputValue({ context, scope, refs, event }) {
        if (event.composing) return
        refs.get("reconcileFrame").request(() => {
          const value = context.get("value")
          if (value === event.value) return
          dom.setInputText(scope, value, event.selection)
        })
      },
      syncInputText({ context, scope, event }) {
        if (event.type === "INPUT.CHANGE") return
        dom.setInputText(scope, context.get("value"))
      },
      selectItem({ context, prop, scope, event }) {
        select({ context, prop, scope }, event.value, event.modifiers)
      },
      selectHighlightedItem({ context, prop, scope, event }) {
        select({ context, prop, scope }, context.get("highlightedValue"), event.modifiers)
      },
      previewHighlightedItem({ context, prop, scope, computed, event }) {
        if (!computed("inlineCompletion") || !event.keypress) return
        const highlightedValue = context.get("highlightedValue")
        const preview = highlightedValue ? prop("collection").stringify(highlightedValue) : null
        context.set("preview", preview)
        dom.setInputText(scope, preview ?? context.get("value"))
      },
      commitPreview({ context, prop }) {
        const preview = context.get("preview")
        if (preview == null) return
        context.set("preview", null)
        const label = prop("collection").stringify(context.get("highlightedValue"))
        const sameText = label?.toLocaleLowerCase() === preview.toLocaleLowerCase()
        context.set("value", label && sameText ? label : preview)
      },
      clearPreview({ context }) {
        context.set("preview", null)
      },
      restoreInputText({ context, scope }) {
        if (context.get("preview") == null) return
        context.set("preview", null)
        dom.setInputText(scope, context.get("value"))
      },
      setHighlightedValue({ context, event }) {
        context.set("highlightedValue", event.value ?? null)
      },
      clearHighlightedValue({ context }) {
        context.set("highlightedValue", null)
      },
      // runs before setInputValue, to compare with the previous text
      startSuggesting({ context, refs, computed, event }) {
        refs.set("suggesting", true)
        const typing = !event.composing && isTypingAtEnd(context.get("value"), event.selection)
        refs.set("completing", computed("inlineCompletion") && typing)
      },
      stopSuggesting({ refs }) {
        refs.set("suggesting", false)
        refs.set("completing", false)
        refs.get("highlightFrame").cancel()
      },
      // The list may not be rendered yet, or may change in the same tick as the text
      highlightFirstItem({ context, prop, refs }) {
        refs.get("highlightFrame").request(() => {
          context.set("highlightedValue", prop("collection").firstValue)
        })
      },
      highlightSuggestion({ context, prop, refs, scope }) {
        refs.get("highlightFrame").request(() => {
          const collection = prop("collection")
          const value = context.get("value")
          const completion = refs.get("completing") ? findCompletion(collection, value) : null
          if (completion) {
            const text = value + completion.label.slice(value.length)
            context.set("preview", text)
            dom.setInputCompletion(scope, text, value.length)
            context.set("highlightedValue", completion.value)
            return
          }
          if (context.get("preview") != null) {
            context.set("preview", null)
            dom.setInputText(scope, value)
          }
          context.set("highlightedValue", prop("autoHighlight") ? collection.firstValue : null)
        })
      },
      highlightLastItem({ context, prop, refs }) {
        refs.get("highlightFrame").request(() => {
          context.set("highlightedValue", prop("collection").lastValue)
        })
      },
      highlightNextItem({ context, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        let value = current ? collection.getNextValue(current) : collection.firstValue
        if (!value && prop("loopFocus")) value = collection.firstValue
        if (value) context.set("highlightedValue", value)
      },
      highlightPrevItem({ context, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        let value = current ? collection.getPreviousValue(current) : collection.lastValue
        if (!value && prop("loopFocus")) value = collection.lastValue
        if (value) context.set("highlightedValue", value)
      },
      highlightNextPage({ context, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        const value = collection.has(current)
          ? (collection.getNextValue(current, prop("pageSize"), true) ?? collection.lastValue)
          : collection.firstValue
        if (value) context.set("highlightedValue", value)
      },
      highlightPrevPage({ context, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        const value = collection.has(current)
          ? (collection.getPreviousValue(current, prop("pageSize"), true) ?? collection.firstValue)
          : collection.lastValue
        if (value) context.set("highlightedValue", value)
      },
      scrollToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn")
        if (scrollToIndexFn) {
          const firstValue = prop("collection").firstValue
          scrollToIndexFn({ index: 0, immediate: true, getElement: () => dom.getItemEl(scope, firstValue) })
          return
        }
        const listEl = dom.getListEl(scope)
        if (listEl) listEl.scrollTop = 0
      },
      syncHighlightedItem({ context, prop }) {
        context.set("highlightedItem", prop("collection").find(context.get("highlightedValue")))
      },
      setInitialFocus({ scope, refs }) {
        refs.get("initialFocusFrame").request(() => dom.focusInputEl(scope))
      },
      setFinalFocus({ scope, refs }) {
        refs.get("finalFocusFrame").request(() => dom.focusInputEl(scope))
      },
      submitOnSelect({ prop, scope }) {
        if (!prop("submitOnSelect")) return
        // after the frameworks commit the chosen text
        queueMicrotask(() => dom.getInputEl(scope)?.form?.requestSubmit())
      },
      cancelFinalFocus({ refs }) {
        refs.get("finalFocusFrame").cancel()
      },
      cancelHighlightFrame({ refs }) {
        refs.get("highlightFrame").cancel()
      },
      cancelFrames({ refs }) {
        refs.get("highlightFrame").cancel()
        refs.get("initialFocusFrame").cancel()
        refs.get("finalFocusFrame").cancel()
        refs.get("reconcileFrame").cancel()
      },
      invokeOnOpen({ prop, event }) {
        prop("onOpenChange")?.({ open: true, reason: getOpenChangeReason(event) })
      },
      invokeOnClose({ prop, event }) {
        prop("onOpenChange")?.({ open: false, reason: getOpenChangeReason(event) })
      },
      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
      announceHighlightedItem({ context, prop, refs }) {
        if (!isApple()) return
        const label = prop("collection").stringify(context.get("highlightedValue"))
        if (!label) {
          refs.get("liveRegion")?.clear()
          return
        }
        const translations = mergeWithDefault(defaultTranslations, prop("translations"))
        const message = translations.highlightedItem({ label })
        if (message) refs.get("liveRegion")?.announce(message)
      },
      announceResults({ refs, prop }) {
        refs.get("resultsRegion")?.announce(getResultsMessage(prop), RESULTS_ANNOUNCEMENT_DELAY)
      },
      cancelResultsAnnouncement({ refs }) {
        refs.get("resultsRegion")?.cancel()
      },
    },
  },
})

type SelectParams = Pick<Params<AutocompleteSchema>, "context" | "prop" | "scope">

function select({ context, prop, scope }: SelectParams, itemValue: string | null, modifiers?: Partial<ModifierKeys>) {
  const collection = prop("collection")
  if (itemValue == null || !collection.has(itemValue)) return
  const value = collection.stringify(itemValue) ?? ""
  prop("onSelect")?.({ itemValue, value, modifiers: getModifierKeys(modifiers) })
  context.set("preview", null)
  context.set("value", value)
  // the value may not change while the input shows another suggestion
  dom.setInputText(scope, context.get("value"))
}

function getOpenChangeReason(event: AutocompleteSchema["event"]): OpenChangeReason | undefined {
  return (event.previousEvent || event).src
}

function getResultsMessage(prop: Params<AutocompleteSchema>["prop"]) {
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  if (prop("loading")) return translations.loading
  const count = prop("collection").size
  return count === 0 ? translations.noResults : translations.resultsCount(count)
}
