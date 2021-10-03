import { createMachine, guards, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { DOM } from "../utils/types"
import { dom } from "./tabs.dom"

const { not } = guards

export type TabsMachineContext = DOM.Context<{
  focusedId?: string
  activeId: string
  orientation?: "horizontal" | "vertical"
  activationMode?: "manual" | "automatic"
  indicatorRect?: Partial<DOMRect>
  measuredRect?: boolean
}>

export type TabsMachineState = {
  value: "unknown" | "idle" | "focused"
}

export const tabsMachine = createMachine<TabsMachineContext, TabsMachineState>(
  {
    initial: "unknown",
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
      unknown: {
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
          ARROW_LEFT: { actions: "focusPrevTab" },
          ARROW_RIGHT: { actions: "focusNextTab" },
          HOME: { actions: "focusFirstTab" },
          END: { actions: "focusLastTab" },
          ENTER: {
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
        ctx.doc = ref(evt.doc)
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
        nextTick(() => dom.getFirstEl(ctx)?.focus())
      },
      focusLastTab(ctx) {
        nextTick(() => dom.getLastEl(ctx)?.focus())
      },
      focusNextTab(ctx) {
        if (!ctx.focusedId) return
        const next = dom.getNextEl(ctx, ctx.focusedId)
        nextTick(() => next?.focus())
      },
      focusPrevTab(ctx) {
        if (!ctx.focusedId) return
        const prev = dom.getPrevEl(ctx, ctx.focusedId)
        nextTick(() => prev?.focus())
      },
      setActiveTabRect(ctx) {
        nextTick(() => {
          ctx.indicatorRect = dom.getRectById(ctx, ctx.activeId)
          if (ctx.measuredRect) return
          nextTick(() => {
            ctx.measuredRect = true
          })
        })
      },
    },
  },
)
