import { createMachine, guards, ref } from "@ui-machines/core"
import { LiveRegion, nextTick, observeAttributes, trackPointerDown } from "@ui-machines/dom-utils"
import { isApple, isFunction } from "@ui-machines/utils"
import scrollIntoView from "scroll-into-view-if-needed"
import { dom } from "./combobox.dom"
import { ComboboxMachineContext, ComboboxMachineState } from "./combobox.types"

const { and, not } = guards

export const comboboxMachine = createMachine<ComboboxMachineContext, ComboboxMachineState>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: "",
      autoComplete: true,
      closeOnSelect: true,
      closeOnBlur: true,
      openOnClick: false,
      activeId: null,
      inputValue: "",
      selectedValue: "",
      navigationValue: "",
      liveRegion: null,
      pointerdownNode: null,
      firstOptionLabel: "",
      focusOnClear: true,
      clearOnEsc: false,
      selectOnFocus: true,
      isHoveringInput: false,
    },

    computed: {
      trimmedInputValue: (ctx) => ctx.inputValue.trim(),
      isInputValueEmpty: (ctx) => ctx.inputValue.trim().length === 0,
      hintValue: (ctx) =>
        ctx.navigationValue ? ctx.inputValue + ctx.navigationValue.substr(ctx.inputValue.length) : "",
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
    },

    watch: {
      inputValue: ["invokeOnInputChange"],
      navigationValue: ["invokeOnHighlight"],
    },

    on: {
      SET_VALUE: {
        actions: "setInputValue",
      },
      CLEAR_VALUE: [
        {
          guard: and(not("isInputValueEmpty"), "focusOnClear"),
          actions: ["clearInputValue", "focusInput"],
        },
        {
          guard: not("isInputValueEmpty"),
          actions: "clearInputValue",
        },
      ],
    },

    states: {
      unknown: {
        on: {
          SETUP: [
            { guard: "autoFocus", target: "focused", actions: "setup" },
            { target: "idle", actions: "setup" },
          ],
        },
      },

      idle: {
        entry: ["resetScrollPosition", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CLICK_BUTTON: "suggesting",
          POINTER_DOWN: {
            guard: "openOnClick",
            target: "suggesting",
          },
          POINTER_OVER: { actions: "setIsHovering" },
          POINTER_LEAVE: {
            actions: "clearIsHovering",
          },
          FOCUS: [
            {
              guard: "selectOnFocus",
              target: "focused",
              actions: "selectInput",
            },
            {
              target: "focused",
            },
          ],
        },
      },

      focused: {
        entry: ["focusInput", "resetScrollPosition", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CHANGE: {
            target: "suggesting",
            actions: ["setInputValue", "focusFirstOption"],
          },
          BLUR: "idle",
          ESCAPE: [
            {
              guard: "clearOnEsc",
              actions: ["clearInputValue"],
            },
            {
              target: "focused",
            },
          ],
          CLICK_BUTTON: "suggesting",
          POINTER_OVER: { actions: "setIsHovering" },
        },
      },

      suggesting: {
        activities: ["trackPointerDown"],
        entry: ["focusInput"],
        on: {
          ARROW_DOWN: {
            target: "navigating",
            actions: ["focusNextOption"],
          },
          ARROW_UP: {
            target: "navigating",
            actions: ["focusPrevOption"],
          },
          ENTER: {
            target: "focused",
            actions: ["selectOption"],
          },
          CHANGE: {
            actions: ["setInputValue", "focusFirstOption"],
          },
          ESCAPE: "focused",
          POINTEROVER_OPTION: {
            target: "interacting",
            actions: ["setActiveId", "setNavigationValue"],
          },
          BLUR: "idle",
          CLICK_BUTTON: "focused",
        },
      },

      navigating: {
        activities: ["scrollOptionIntoView", "trackPointerDown"],
        on: {
          ARROW_DOWN: [
            {
              guard: "isLastOptionFocused",
              actions: ["clearFocusedOption"],
            },
            { actions: ["focusNextOption"] },
          ],
          ARROW_UP: [
            {
              guard: "isFirstOptionFocused",
              actions: ["clearFocusedOption"],
            },
            { actions: ["focusPrevOption"] },
          ],
          ENTER: {
            target: "focused",
            actions: ["selectOption"],
          },
          CHANGE: {
            target: "suggesting",
            actions: ["setInputValue", "focusFirstOption"],
          },
          POINTEROVER_OPTION: {
            target: "interacting",
            actions: ["setActiveId", "setNavigationValue"],
          },
          ESCAPE: "focused",
          CLICK_BUTTON: "focused",
          BLUR: {
            target: "idle",
            actions: ["selectOption"],
          },
        },
      },

      interacting: {
        activities: ["trackPointerDown"],
        on: {
          ARROW_DOWN: [
            {
              target: "navigating",
              guard: "isLastOptionFocused",
              actions: ["clearFocusedOption"],
            },
            {
              target: "navigating",
              actions: ["focusNextOption"],
            },
          ],
          ARROW_UP: [
            {
              target: "navigating",
              guard: "isFirstOptionFocused",
              actions: ["clearFocusedOption"],
            },
            { target: "navigating", actions: ["focusPrevOption"] },
          ],
          ENTER: {
            target: "focused",
            actions: ["selectOption"],
          },
          ESCAPE: "focused",
          CLICK_BUTTON: "focused",
          CHANGE: {
            actions: ["setInputValue", "focusFirstOption"],
          },
          POINTEROVER_OPTION: {
            actions: ["setActiveId", "setNavigationValue"],
          },
          CLICK_OPTION: {
            target: "focused",
            actions: ["selectOption"],
          },
          BLUR: "idle",
          POINTERLEAVE_LISTBOX: {
            actions: "clearActiveId",
          },
        },
      },
    },
  },
  {
    guards: {
      openOnClick: (ctx) => !!ctx.openOnClick,
      closeOnBlur: (ctx) => !!ctx.closeOnBlur,
      isInputValueEmpty: (ctx) => ctx.isInputValueEmpty,
      focusOnClear: (ctx) => !!ctx.focusOnClear,
      autoFocus: (ctx) => !!ctx.autoFocus,
      closeOnSelect: (ctx) => {
        if (isFunction(ctx.closeOnSelect)) {
          const el = dom.getFocusedOptionEl(ctx)
          return !!(el && ctx.closeOnSelect(dom.getOptionData(el)))
        }
        return !!ctx.closeOnSelect
      },
      isInputFocused: (ctx) => dom.isInputFocused(ctx),
      autoComplete: (ctx) => !!ctx.autoComplete,
      isFirstOptionFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.activeId,
      isLastOptionFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.activeId,
      hasFocusedOption: (ctx) => !!ctx.activeId,
      selectOnFocus: (ctx) => !!ctx.selectOnFocus,
      clearOnEsc: (ctx) => !!ctx.clearOnEsc,
    },
    activities: {
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      scrollOptionIntoView(ctx) {
        const input = dom.getInputEl(ctx)
        const listbox = dom.getListboxEl(ctx)
        return observeAttributes(input, "aria-activedescendant", () => {
          const opt = dom.getActiveOptionEl(ctx)
          if (!opt) return
          scrollIntoView(opt, { boundary: listbox, block: "nearest", scrollMode: "if-needed" })
        })
      },
    },
    actions: {
      setup(ctx, evt) {
        ctx.uid = evt.id
        ctx.doc = ref(evt.doc)
        const region = new LiveRegion({ ariaLive: "assertive", doc: ctx.doc })
        ctx.liveRegion = ref(region)
      },
      setActiveId(ctx, evt) {
        ctx.activeId = evt.id
      },
      clearActiveId(ctx) {
        ctx.activeId = null
      },
      setNavigationValue(ctx, evt) {
        ctx.navigationValue = evt.value
      },
      clearFocusedOption(ctx) {
        ctx.activeId = null
        ctx.navigationValue = ""
      },
      selectOption(ctx, evt) {
        ctx.selectedValue = ctx.navigationValue || evt.value
        ctx.inputValue = ctx.selectedValue
      },
      clearSelectedValue(ctx) {
        ctx.selectedValue = ""
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
        ctx.onInputChange?.(ctx.inputValue)
      },
      invokeOnHighlight(ctx) {
        ctx.onHighlight?.(ctx.navigationValue)
      },
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.selectedValue)
      },
      invokeOnOpen(ctx) {
        ctx.onOpen?.()
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
        let prev = dom.getPrevEl(ctx, ctx.activeId ?? "")
        if (!prev) return
        ctx.activeId = prev.id
        ctx.navigationValue = dom.getOptionData(prev).label
      },
      setFirstOptionLabel(ctx) {
        if (ctx.navigationValue || !ctx.inputValue) {
          ctx.firstOptionLabel = ""
          return
        }
        nextTick(() => {
          const option = dom.getOptionData(dom.getFirstEl(ctx))
          ctx.firstOptionLabel = option.label
        })
      },
      clearFirstOptionLabel(ctx) {
        ctx.firstOptionLabel = ""
      },
      announceOptionCount(ctx) {
        const count = dom.getOptionCount(ctx)
        if (count > 0) {
          ctx.liveRegion?.announce(`${count} ${count === 1 ? "option" : "options"} available`)
        }
      },
      announceSelectedOption() {
        if (!isApple()) return
        // ctx.liveRegion?.announce(`${ctx.selectedValue}, selected`)
      },
      clearPointerdownNode(ctx) {
        ctx.pointerdownNode = null
      },
      setIsHovering(ctx) {
        ctx.isHoveringInput = true
      },
      clearIsHovering(ctx) {
        ctx.isHoveringInput = false
      },
    },
  },
)
