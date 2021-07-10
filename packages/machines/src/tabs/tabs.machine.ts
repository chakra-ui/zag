import { createMachine, guards, preserve } from "@ui-machines/core"
import { nextTick } from "@ui-machines/utils"
import { WithDOM } from "../type-utils"
import { dom } from "./tabs.dom"

const { not } = guards

export type TabsMachineContext = WithDOM<{
  focusedTabId?: string
  activeTabId: string
  orientation?: "horizontal" | "vertical"
  activationMode?: "manual" | "automatic"
  indicatorRect?: Partial<DOMRect>
  measuredRect?: boolean
}>

export type TabsMachineState = {
  value: "idle" | "focused"
}

export const tabsMachine = createMachine<TabsMachineContext, TabsMachineState>(
  {
    initial: "idle",
    context: {
      direction: "ltr",
      orientation: "horizontal",
      activationMode: "automatic",
      activeTabId: "",
      focusedTabId: "",
      uid: "",
      indicatorRect: { left: 0, right: 0, width: 0, height: 0 },
      measuredRect: false,
    },
    states: {
      idle: {
        entry: "setActiveTabRect",
        on: {
          MOUNT: {
            actions: ["setId", "setOwnerDocument"],
          },
          TAB_FOCUS: { target: "focused", actions: "setFocusedId" },
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedId", "setActiveId", "setActiveTabRect"],
          },
        },
      },
      focused: {
        on: {
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedId", "setActiveId", "setActiveTabRect"],
          },
          TABLIST_ARROW_LEFT: { actions: "focusPrevTab" },
          TABLIST_ARROW_RIGHT: { actions: "focusNextTab" },
          TABLIST_HOME: { actions: "focusFirstTab" },
          TABLIST_END: { actions: "focusLastTab" },
          TABLIST_ENTER: {
            cond: not("shouldSelectOnFocus"),
            actions: ["setActiveId", "setActiveTabRect"],
          },
          TAB_FOCUS: [
            {
              cond: "shouldSelectOnFocus",
              actions: ["setFocusedId", "setActiveId", "setActiveTabRect"],
            },
            { actions: "setFocusedId" },
          ],
          TAB_BLUR: {
            target: "idle",
            actions: "resetFocusedId",
          },
        },
      },
    },
  },
  {
    guards: {
      shouldSelectOnFocus: (ctx) => ctx.activationMode === "automatic",
    },
    actions: {
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setFocusedId(ctx, evt) {
        ctx.focusedTabId = evt.uid
      },
      resetFocusedId(ctx) {
        ctx.focusedTabId = ""
      },
      setActiveId(ctx, evt) {
        ctx.activeTabId = evt.uid
      },
      focusFirstTab(ctx) {
        const tabs = dom(ctx)
        nextTick(() => tabs.first.focus())
      },
      focusLastTab(ctx) {
        const tabs = dom(ctx)
        nextTick(() => tabs.last.focus())
      },
      focusNextTab(ctx) {
        if (!ctx.focusedTabId) return
        const tabs = dom(ctx)
        const next = tabs.next(ctx.focusedTabId)
        nextTick(() => next.focus())
      },
      focusPrevTab(ctx) {
        if (!ctx.focusedTabId) return
        const tabs = dom(ctx)
        const prev = tabs.prev(ctx.focusedTabId)
        nextTick(() => prev.focus())
      },
      setActiveTabRect(ctx) {
        const tabs = dom(ctx)
        ctx.indicatorRect = tabs.rectById(ctx.activeTabId)
        if (ctx.measuredRect) return
        setTimeout(() => {
          ctx.measuredRect = true
        })
      },
    },
  },
)
