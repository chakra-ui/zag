import { createMachine, guards, ref } from "@ui-machines/core"
import scrollIntoView from "scroll-into-view-if-needed"
import { nextTick } from "tiny-fn"
import { isApple, isFunction } from "tiny-guard"
import { LiveRegion, observeAttributes, trackPointerDown, uuid } from "../utils"
import { dom } from "./combobox.dom"
import { ComboboxMachineContext, ComboboxMachineState } from "./combobox.types"

const { and } = guards

export const comboboxMachine = createMachine<ComboboxMachineContext, ComboboxMachineState>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: uuid(),
      selectionMode: "autoselect",
      closeOnSelect: true,
      closeOnBlur: true,
      openOnClick: false,
      activeId: null,
      inputValue: "",
      selectedValue: "",
      navigationValue: "",
      eventSource: null,
      liveRegion: null,
      pointerdownNode: null,
    },
    on: {
      SET_VALUE: {
        actions: "setInputValue",
      },
      CLEAR_VALUE: [
        {
          cond: and("inputHasValue", "focusOnClear"),
          actions: ["clearInputValue", "focusInput"],
        },
        {
          cond: "inputHasValue",
          actions: "clearInputValue",
        },
      ],
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setId", "setOwnerDocument", "setLiveRegion"],
          },
        },
      },

      closed: {
        after: {
          0: { cond: "isInputFocused", target: "focused" },
        },
        entry: ["clearFocusedOption", "clearEventSource", "resetScrollPosition"],
        on: {
          INPUT_FOCUS: [
            {
              target: "focused",
              cond: "selectOnFocus",
              actions: "selectInput",
            },
            { target: "focused" },
          ],
          BUTTON_CLICK: [
            {
              cond: "autoSelect",
              target: "open",
              actions: ["focusInput", "focusFirstOption"],
            },
            {
              target: "open",
              actions: "focusInput",
            },
          ],
        },
      },

      focused: {
        on: {
          INPUT_BLUR: "closed",
          INPUT_CLICK: {
            cond: "openOnClick",
            target: "open",
          },
          ARROW_DOWN: {
            target: "open",
            actions: ["focusFirstOption", "setEventSourceToKeyboard"],
          },
          ARROW_UP: {
            target: "open",
            actions: ["focusLastOption", "setEventSourceToKeyboard"],
          },
          TYPE: [
            {
              target: "open",
              cond: "autoComplete",
              actions: "setInputValue",
            },
            {
              target: "open",
              cond: "autoSelect",
              actions: ["setInputValue", "focusFirstOption"],
            },
            {
              target: "open",
              actions: ["setInputValue", "announceOptionCount", "setEventSourceToKeyboard"],
            },
          ],
          BUTTON_CLICK: {
            target: "open",
            actions: "focusInput",
          },
        },
      },

      open: {
        entry: ["announceOptionCount"],
        activities: ["scrollOptionIntoView", "trackPointerDown"],
        on: {
          ARROW_DOWN: [
            {
              cond: and("autoComplete", "isLastOptionFocused"),
              actions: ["clearFocusedOption", "setEventSourceToKeyboard"],
            },
            {
              actions: ["focusNextOption", "setEventSourceToKeyboard"],
            },
          ],
          ARROW_UP: [
            {
              cond: and("autoComplete", "isFirstOptionFocused"),
              actions: ["clearFocusedOption", "setEventSourceToKeyboard"],
            },
            {
              actions: ["focusPrevOption", "setEventSourceToKeyboard"],
            },
          ],
          ESCAPE: [
            {
              target: "closed",
              cond: "closeOnEsc",
              actions: "clearInputValue",
            },
            {
              target: "closed",
            },
          ],
          ENTER: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["selectOption", "announceSelectedOption", "clearFocusedOption"],
            },
            {
              actions: ["selectOption", "announceSelectedOption"],
            },
          ],
          TYPE: [
            {
              cond: "autoComplete",
              actions: ["setInputValue", "announceOptionCount", "setEventSourceToKeyboard"],
            },
            {
              cond: "autoSelect",
              actions: ["setInputValue", "focusFirstOption", "announceOptionCount", "setEventSourceToKeyboard"],
            },
            {
              actions: ["setInputValue", "announceOptionCount", "setEventSourceToKeyboard"],
            },
          ],
          TAB: [
            {
              cond: "hasFocusedOption",
              target: "closed",
              actions: "selectOption",
            },
            { target: "closed" },
          ],
          DELETE: {
            actions: ["clearInputValue", "clearFocusedOption"],
          },
          OPTION_POINTEROVER: {
            actions: ["setActiveOption", "setEventSourceToPointer"],
          },
          OPTION_POINTEROUT: {
            actions: "clearFocusedOption",
          },
          OPTION_CLICK: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["selectOption", "announceSelectedOption", "focusInput"],
            },
            {
              actions: ["selectOption", "announceSelectedOption", "focusInput"],
            },
          ],
          INPUT_BLUR: {
            cond: "closeOnBlur",
            target: "closed",
          },
          BUTTON_CLICK: {
            target: "closed",
            actions: "focusInput",
          },
        },
      },
    },
  },
  {
    guards: {
      openOnClick: (ctx) => !!ctx.openOnClick,
      closeOnBlur: (ctx) => !!ctx.closeOnBlur,
      closeOnSelect: (ctx) => {
        if (isFunction(ctx.closeOnSelect)) {
          const el = dom.getFocusedOptionEl(ctx)
          return Boolean(el && ctx.closeOnSelect(dom.getOptionData(el)))
        }
        return !!ctx.closeOnSelect
      },
      isInputFocused: (ctx) => dom.isInputFocused(ctx),
      autoComplete: (ctx) => ctx.selectionMode === "autocomplete",
      autoSelect: (ctx) => ctx.selectionMode === "autoselect",
      isFirstOptionFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.activeId,
      isLastOptionFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.activeId,
      hasFocusedOption: (ctx) => !!ctx.activeId,
      selectOnFocus: (ctx) => !!ctx.selectOnFocus,
    },
    activities: {
      trackPointerDown,
      scrollOptionIntoView(ctx) {
        const input = dom.getInputEl(ctx)
        const listbox = dom.getListboxEl(ctx)
        return observeAttributes(input, "aria-activedescendant", () => {
          const opt = dom.getActiveOptionEl(ctx)
          if (!opt || ctx.eventSource !== "keyboard") return
          scrollIntoView(opt, {
            boundary: listbox,
            block: "nearest",
            scrollMode: "if-needed",
          })
        })
      },
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      setLiveRegion(ctx) {
        const region = new LiveRegion({ ariaLive: "assertive", doc: ctx.doc })
        ctx.liveRegion = ref(region)
      },
      setActiveOption(ctx, evt) {
        ctx.activeId = evt.id
        ctx.navigationValue = evt.value
      },
      clearFocusedOption(ctx) {
        ctx.activeId = null
        ctx.navigationValue = ""
      },
      selectOption(ctx, evt) {
        ctx.selectedValue = ctx.navigationValue ?? evt.value
        ctx.inputValue = ctx.selectedValue
      },
      focusInput(ctx) {
        nextTick(() => dom.getInputEl(ctx)?.focus())
      },
      selectInput(ctx) {
        nextTick(() => dom.getInputEl(ctx)?.select())
      },
      setInputValue(ctx, evt) {
        ctx.inputValue = evt.value
      },
      clearInputValue(ctx) {
        ctx.inputValue = ""
      },
      resetScrollPosition(ctx) {
        const listbox = dom.getListboxEl(ctx)
        if (!listbox) return
        listbox.scrollTop = 0
      },
      invokeOnInputChange(ctx) {
        ctx.onInputValueChange?.(ctx.inputValue)
      },
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.selectedValue)
      },
      focusFirstOption(ctx) {
        nextTick(() => {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          ctx.activeId = first.id
          ctx.navigationValue = dom.getOptionData(first).label
        })
      },
      focusLastOption(ctx) {
        nextTick(() => {
          const last = dom.getLastEl(ctx)
          if (!last) return
          ctx.activeId = last.id
          ctx.navigationValue = dom.getOptionData(last).label
        })
      },
      focusNextOption(ctx) {
        const next = dom.getNextEl(ctx, ctx.activeId ?? "")
        if (!next) return
        ctx.activeId = next.id
        ctx.navigationValue = dom.getOptionData(next).label
      },
      focusPrevOption(ctx) {
        const prev = dom.getPrevEl(ctx, ctx.activeId ?? "")
        if (!prev) return
        ctx.activeId = prev.id
        ctx.navigationValue = dom.getOptionData(prev).label
      },
      setEventSourceToKeyboard(ctx) {
        ctx.eventSource = "keyboard"
      },
      setEventSourceToPointer(ctx) {
        ctx.eventSource = "pointer"
      },
      clearEventSource(ctx) {
        ctx.eventSource = null
      },
      // Announce the number of available suggestions when it changes
      announceOptionCount(ctx) {
        // First, check the `aria-setsize` of any option (if virtualized)
        // Next, query the dom for the number of options in the list
        // Announcing the number of options
        nextTick(() => {
          // const count = ctx.childNodes?.value.length
          // const msg = formatMessage(count)
          ctx.liveRegion?.announce("you typed")
        })
      },
      announceSelectedOption(ctx) {
        if (!isApple()) return
        ctx.liveRegion?.announce(`${ctx.selectedValue}, selected`)
      },
    },
  },
)
