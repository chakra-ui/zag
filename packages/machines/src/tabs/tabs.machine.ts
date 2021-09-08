import { createMachine, guards, preserve } from "@ui-machines/core"
import { nextTick } from "@core-foundation/utils"
import { WithDOM } from "../utils/types"
import { dom } from "./tabs.dom"

const { not } = guards

export type TabsMachineContext = WithDOM<{
  focusedId?: string
  activeId: string
  orientation?: "horizontal" | "vertical"
  activationMode?: "manual" | "automatic"
  indicatorRect?: Partial<DOMRect>
  measuredRect?: boolean
}>

export type TabsMachineState = {
  value: "mounted" | "idle" | "focused"
}

export const tabsMachine = createMachine<TabsMachineContext, TabsMachineState>(
  {
    initial: "mounted",
    context: {
      dir: "ltr",
      orientation: "horizontal",
      activationMode: "automatic",
      activeId: "",
      focusedId: "",
      uid: "",
      indicatorRect: { left: 0, right: 0, width: 0, height: 0 },
      measuredRect: false,
    },
    states: {
      mounted: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      idle: {
        entry: "setActiveTabRect",
        on: {
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
      isRtl: (ctx) => ctx.dir === "rtl",
    },
    actions: {
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setFocusedId(ctx, evt) {
        ctx.focusedId = evt.uid
      },
      resetFocusedId(ctx) {
        ctx.focusedId = ""
      },
      setActiveId(ctx, evt) {
        ctx.activeId = evt.uid
      },
      focusFirstTab(ctx) {
        const tabs = dom(ctx)
        nextTick(() => tabs.first?.focus())
      },
      focusLastTab(ctx) {
        const tabs = dom(ctx)
        nextTick(() => tabs.last?.focus())
      },
      focusNextTab(ctx) {
        if (!ctx.focusedId) return
        const tabs = dom(ctx)
        const next = tabs.next(ctx.focusedId)
        nextTick(() => next?.focus())
      },
      focusPrevTab(ctx) {
        if (!ctx.focusedId) return
        const tabs = dom(ctx)
        const prev = tabs.prev(ctx.focusedId)
        nextTick(() => prev?.focus())
      },
      setActiveTabRect(ctx) {
        nextTick(() => {
          const tabs = dom(ctx)
          ctx.indicatorRect = tabs.rectById(ctx.activeId)
          if (ctx.measuredRect) return
          nextTick(() => {
            ctx.measuredRect = true
          })
        })
      },
    },
  },
)
