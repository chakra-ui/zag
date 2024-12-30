import { createMachine, guards } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import type { MachineContext, MachineState, UserDefinedContext } from "./cascader.types"
import { getInitialFocus, observeAttributes, query, raf, scrollIntoView } from "@zag-js/dom-query"
import { dom } from "./cascader.dom"
import { getPlacement } from "@zag-js/popper"
import { collection } from "./cascader.collection"
import * as utils from "./cascader.utils"
const { and, or } = guards

export function machine<V>(userContext: UserDefinedContext<V>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext<V>, MachineState>(
    {
      id: "cascader",
      context: {
        disabled: false,
        readOnly: false,
        loopFocus: false,
        expandTrigger: "hover",
        closeOnSelect: !ctx.multiple,
        multiple: false,
        value: [],
        highlightedValue: null,
        ...ctx,
        highlightedItem: null,
        selectedItems: [],
        highlightedIndexPath: [],
        valueIndexPaths: [],
        fieldsetDisabled: false,
        collection: ctx.collection ?? collection.empty(),
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
      },

      initial: ctx.open ? "open" : "idle",

      entry: ["syncSelectedItems", "syncHighlightedItem"],

      watch: {
        open: ["toggleVisibility"],
        value: ["syncSelectedItems"],
        highlightedValue: ["syncHighlightedItem"],
      },

      on: {
        "HIGHLIGHTED_VALUE.SET": {
          actions: ["setHighlightedItem"],
        },
        "ITEM.SELECT": {
          actions: ["selectItem"],
        },
        "ITEM.CLEAR": {
          actions: ["clearItem"],
        },
        "VALUE.SET": {
          actions: ["setSelectedItems"],
        },
        "VALUE.CLEAR": {
          actions: ["clearSelectedItems"],
        },
      },

      states: {
        idle: {
          tags: ["closed"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isTriggerClickEvent",
                target: "open",
                actions: ["setInitialFocus", "highlightFirstSelectedItem"],
              },
              {
                target: "open",
                actions: ["setInitialFocus"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "setInitialFocus", "highlightFirstSelectedItem"],
              },
            ],
            "TRIGGER.FOCUS": {
              target: "focused",
            },
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen"],
              },
            ],
          },
        },

        focused: {
          tags: ["closed"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isTriggerClickEvent",
                target: "open",
                actions: ["setInitialFocus", "highlightFirstSelectedItem"],
              },
              {
                guard: "isTriggerArrowUpEvent",
                target: "open",
                actions: ["setInitialFocus", "highlightComputedLastItem"],
              },
              {
                guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
                target: "open",
                actions: ["setInitialFocus", "highlightComputedFirstItem"],
              },
              {
                target: "open",
                actions: ["setInitialFocus"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen"],
              },
            ],
            "TRIGGER.BLUR": {
              target: "idle",
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen", "highlightFirstSelectedItem"],
              },
            ],
            "TRIGGER.ENTER": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"],
              },
            ],
            "TRIGGER.ARROW_UP": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedLastItem"],
              },
            ],
            "TRIGGER.ARROW_DOWN": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"],
              },
            ],
          },
        },

        open: {
          tags: ["open"],
          exit: ["scrollListsToTop"],
          activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItems"],
          on: {
            "CONTROLLED.CLOSE": {
              target: "focused",
              actions: ["focusTriggerEl", "clearHighlightedItem"],
            },
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "focusTriggerEl", "clearHighlightedItem"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "clearHighlightedItem"],
              },
            ],
            "ITEM.CLICK": [
              // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
              {
                guard: and("isLeafNode", "closeOnSelect", "isOpenControlled"),
                actions: ["selectItemAtIndexPath", "invokeOnClose"],
              },
              {
                guard: and("isLeafNode", "closeOnSelect"),
                target: "focused",
                actions: ["selectItemAtIndexPath", "invokeOnClose", "focusTriggerEl", "clearHighlightedItem"],
              },
              {
                guard: "isLeafNode",
                actions: ["highlightItem", "selectItemAtIndexPath"],
              },
              // ===
              {
                guard: "isClickTrigger",
                actions: ["highlightItem"],
              },
            ],

            "CONTENT.HOME": [
              {
                guard: "hasHighlightedItem",
                actions: ["highlightFirstItem"],
              },
              {
                actions: ["highlightFirstItemInRoot"],
              },
            ],
            "CONTENT.END": [
              {
                guard: "hasHighlightedItem",
                actions: ["highlightLastItem"],
              },
              {
                actions: ["highlightLastItemInRoot"],
              },
            ],
            "CONTENT.ARROW_DOWN": [
              {
                guard: and("hasHighlightedItem", "loop", "isLastItemHighlighted"),
                actions: ["highlightFirstItem"],
              },
              {
                guard: "hasHighlightedItem",
                actions: ["highlightNextItem"],
              },
              {
                actions: ["highlightFirstItemInRoot"],
              },
            ],
            "CONTENT.ARROW_UP": [
              {
                guard: and("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
                actions: ["highlightLastItem"],
              },
              {
                guard: "hasHighlightedItem",
                actions: ["highlightPreviousItem"],
              },
              {
                actions: ["highlightLastItemInRoot"],
              },
            ],
            "CONTENT.ARROW_LEFT": [
              {
                guard: "isHighlightedItemInSubLevel",
                actions: ["highlightItemParent"],
              },
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "focusTriggerEl", "clearHighlightedItem"],
              },
            ],
            "CONTENT.ARROW_RIGHT": {
              guard: "hasHighlightedItem",
              actions: ["highlightItemFirstChild"],
            },
            "ITEM.POINTER_MOVE": {
              guard: "isHoverTrigger",
              actions: ["highlightItem"],
            },
            "POSITIONING.SET": {
              actions: ["reposition"],
            },
          },
        },
      },
    },
    {
      guards: {
        // context assertions
        loop: (ctx) => !!ctx.loopFocus,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
        hasHighlightedItem: (ctx) => ctx.highlightedIndexPath.length > 0,
        hasSelectedItems: (ctx) => ctx.value.length > 0,
        isHoverTrigger: (ctx) => ctx.expandTrigger === "hover",
        isClickTrigger: (ctx) => ctx.expandTrigger === "click",
        closeOnSelect: (ctx, evt) => !!(evt.closeOnSelect ?? ctx.closeOnSelect),
        // state assertions
        isFirstItemHighlighted: (ctx) => ctx.highlightedIndexPath.at(-1) === 0,
        isLastItemHighlighted: (ctx) => {
          const itemIndex = ctx.highlightedIndexPath.at(-1)
          if (!itemIndex && itemIndex !== 0) return false

          const parentIndexPath = ctx.highlightedIndexPath.slice(0, -1)
          const nextSibling = ctx.collection.at([...parentIndexPath, itemIndex + 1])

          return !nextSibling
        },
        isHighlightedItemInSubLevel: (ctx) => ctx.highlightedIndexPath.length > 1,
        isLeafNode: (ctx, evt) => !ctx.collection.isBranchNode(ctx.collection.at(evt.indexPath)),
        // guard assertions (for controlled mode)
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        isTriggerClickEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.CLICK",
        isTriggerEnterEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ENTER",
        isTriggerArrowUpEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ARROW_UP",
        isTriggerArrowDownEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ARROW_DOWN",
      },
      activities: {
        trackFormControlState(ctx, _evt, { initialContext }) {
          // return trackFormControl(dom.getHiddenSelectEl(ctx), {
          //   onFieldsetDisabledChange(disabled) {
          //     ctx.fieldsetDisabled = disabled
          //   },
          //   onFormReset() {
          //     set.selectedItems(ctx, initialContext.value)
          //   },
          // })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const contentEl = () => dom.getContentEl(ctx)
          let restoreFocus = true
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
            },
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside", restoreFocus })
            },
          })
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const triggerEl = () => dom.getTriggerEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(triggerEl, positionerEl, {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        scrollToHighlightedItems(ctx, _evt, { getState }) {
          const exec = () => {
            if (!ctx.highlightedIndexPath.length) return
            const state = getState()

            // don't scroll into view if we're using the pointer
            if (state.event.type.includes("POINTER")) return

            // scroll to highlighted items in each list
            dom.getListEls(ctx).forEach((listEl) => {
              const itemEl = query(listEl, "[data-part=item][data-highlighted]")
              if (!itemEl) return
              scrollIntoView(itemEl, { rootEl: listEl, block: "nearest" })
            })
          }

          raf(() => exec())

          const contentEl = () => dom.getContentEl(ctx)
          return observeAttributes(contentEl, {
            defer: true,
            attributes: ["data-activedescendant"],
            callback() {
              exec()
            },
          })
        },
      },
      actions: {
        reposition(ctx, evt) {
          const positionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), positionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        setInitialFocus(ctx) {
          raf(() => {
            const element = getInitialFocus({
              root: dom.getContentEl(ctx),
            })
            element?.focus({ preventScroll: true })
          })
        },
        focusTriggerEl(ctx, evt) {
          const restoreFocus = evt.restoreFocus ?? evt.previousEvent?.restoreFocus
          if (restoreFocus != null && !restoreFocus) return
          raf(() => {
            const element = dom.getTriggerEl(ctx)
            element?.focus({ preventScroll: true })
          })
        },
        scrollListsToTop(ctx) {
          dom.getListEls(ctx).forEach((listEl) => {
            listEl.scrollTo(0, 0)
          })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        clearHighlightedItem(ctx) {
          set.highlightedItem(ctx, [])
        },
        highlightItem(ctx, evt) {
          set.highlightedItem(ctx, evt.indexPath)
        },
        highlightItemFirstChild(ctx) {
          const item = ctx.collection.at(ctx.highlightedIndexPath)
          if (!ctx.collection.isBranchNode(item)) return
          ctx.highlightedIndexPath.push(0)
        },
        highlightItemParent(ctx) {
          ctx.highlightedIndexPath.pop()
        },
        highlightFirstItem(ctx) {
          ctx.highlightedIndexPath[ctx.highlightedIndexPath.length - 1] = 0
        },
        highlightLastItem(ctx) {
          const siblings = utils.getSiblings(ctx)
          if (!siblings) return

          ctx.highlightedIndexPath[ctx.highlightedIndexPath.length - 1] = siblings.length - 1
        },
        highlightFirstItemInRoot(ctx) {
          set.highlightedItem(ctx, [0])
        },
        highlightLastItemInRoot(ctx) {
          const rootNodes = ctx.collection.getNodeChildren(ctx.collection.rootNode)
          set.highlightedItem(ctx, [rootNodes.length - 1])
        },
        highlightNextItem(ctx) {
          const nextSibling = utils.getNextSibling(ctx)
          set.highlightedItem(ctx, nextSibling)
        },
        highlightPreviousItem(ctx) {
          const previousSibling = utils.getPreviousSibling(ctx)
          set.highlightedItem(ctx, previousSibling)
        },
        highlightFirstSelectedItem(ctx) {
          const firstSelected = ctx.valueIndexPaths[0]
          if (!firstSelected) return
          set.highlightedItem(ctx, firstSelected)
        },
        highlightComputedFirstItem(ctx) {
          const firstItem = ctx.valueIndexPaths.length > 0 ? ctx.valueIndexPaths[0] : [0]
          set.highlightedItem(ctx, firstItem)
        },
        highlightComputedLastItem(ctx) {
          const lastItem = ctx.valueIndexPaths.length > 0 ? ctx.valueIndexPaths.at(-1) : [0]
          set.highlightedItem(ctx, lastItem)
        },
        selectItemAtIndexPath(ctx, evt) {
          set.selectedItem(ctx, evt.indexPath)
        },
        setHighlightedItem(ctx, evt) {
          const item = ctx.collection.getIndexPath(evt.value)
          set.highlightedItem(ctx, item)
        },
        selectItem(ctx, evt) {
          const item = ctx.collection.getIndexPath(evt.value)
          set.selectedItem(ctx, item)
        },
        clearItem(ctx, evt) {
          const value = ctx.value.filter((v) => v !== evt.value)
          set.selectedItems(ctx, value)
        },
        setSelectedItems(ctx, evt) {
          set.selectedItems(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        syncSelectedItems(ctx) {
          sync.valueChange(ctx)
        },
        syncHighlightedItem(ctx) {
          sync.highlightChange(ctx)
        },
      },
    },
  )
}

const sync = {
  valueChange: (ctx: MachineContext) => {
    ctx.valueIndexPaths = ctx.value.map((value) => ctx.collection.getIndexPath(value)!)
    ctx.selectedItems = ctx.valueIndexPaths.map((path) => ctx.collection.at(path))
  },
  highlightChange: (ctx: MachineContext) => {
    if (!ctx.highlightedValue) {
      ctx.highlightedIndexPath = []
      return
    }
    const indexPath = ctx.collection.getIndexPath(ctx.highlightedValue)
    ctx.highlightedIndexPath = indexPath ?? []
    const item = ctx.collection.at(ctx.highlightedIndexPath)
    if (item) ctx.highlightedItem = item
  },
}

const invoke = {
  valueChange: (ctx: MachineContext) => {
    sync.valueChange(ctx)
    ctx.onValueChange?.({
      indexPaths: Array.from(ctx.valueIndexPaths),
      value: ctx.valueIndexPaths.map((path) => ctx.collection.getNodeValue(ctx.collection.at(path))),
    })
  },
  highlightChange: (ctx: MachineContext) => {
    sync.highlightChange(ctx)
    ctx.onHighlightChange?.({
      indexPath: ctx.highlightedIndexPath,
      value: ctx.collection.getNodeValue(ctx.collection.at(ctx.highlightedIndexPath)),
    })
  },
}

const set = {
  selectedItem(ctx: MachineContext, indexPath: number[] | undefined) {
    if (!indexPath) return

    const item = ctx.collection.at(indexPath)
    const value = ctx.collection.getNodeValue(item)

    if (ctx.value.includes(value)) return

    if (ctx.multiple) {
      ctx.valueIndexPaths.push(indexPath)
      ctx.value.push(value)
    } else {
      ctx.valueIndexPaths = [indexPath]
      ctx.value = [value]
    }

    invoke.valueChange(ctx)
  },
  selectedItems: (ctx: MachineContext, value: string[]) => {
    if (isEqual(ctx.value, value)) return

    ctx.value = value
    invoke.valueChange(ctx)
  },
  highlightedItem(ctx: MachineContext, indexPath: number[] | undefined) {
    if (!indexPath) return
    ctx.highlightedIndexPath = indexPath

    const item = ctx.collection.at(indexPath)
    ctx.highlightedValue = ctx.collection.getNodeValue(item)
    invoke.highlightChange(ctx)
  },
}
