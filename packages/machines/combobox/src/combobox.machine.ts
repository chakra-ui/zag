import { choose, createMachine, guards, ref } from "@ui-machines/core"
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
      openText: "Show suggestions",
      closeText: "Hide suggestions",
      clearText: "Clear value",
      getOptionCountText: (count) => {
        return [
          `${count} ${count === 1 ? "option" : "options"} available`,
          "use the up and down keys to navigate. Press the enter key to select",
        ].join(" ")
      },
    },

    computed: {
      trimmedInputValue: (ctx) => ctx.inputValue.trim(),
      isInputValueEmpty: (ctx) => ctx.trimmedInputValue.length === 0,
      hintValue: (ctx) =>
        ctx.navigationValue ? ctx.inputValue + ctx.navigationValue.substr(ctx.inputValue.length) : "",
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
    },

    watch: {
      inputValue: ["invokeOnInputChange"],
      navigationValue: ["invokeOnHighlight"],
      selectedValue: ["invokeOnSelectionChange"],
    },

    on: {
      SET_VALUE: {
        actions: "setInputValue",
      },
      CLEAR_VALUE: [
        {
          target: "focused",
          guard: and(not("isInputValueEmpty"), "focusOnClear"),
          actions: ["clearInputValue"],
        },
        {
          guard: not("isInputValueEmpty"),
          actions: "clearInputValue",
        },
      ],
    },

    exit: ["removeLiveRegion"],

    states: {
      unknown: {
        on: {
          SETUP: [
            {
              guard: "autoFocus",
              target: "focused",
              actions: "setup",
            },
            {
              target: "idle",
              actions: "setup",
            },
          ],
        },
      },

      idle: {
        entry: ["resetScroll", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CLICK_BUTTON: {
            target: "suggesting",
            actions: "announceOptionCount",
          },
          POINTER_DOWN: {
            guard: "openOnClick",
            target: "suggesting",
          },
          POINTER_OVER: {
            actions: "setIsHovering",
          },
          POINTER_LEAVE: {
            actions: "clearIsHovering",
          },
          FOCUS: [
            {
              guard: "selectOnFocus",
              target: "focused",
              actions: "selectInput",
            },
            { target: "focused" },
          ],
        },
      },

      focused: {
        entry: ["focusInput", "resetScroll", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CHANGE: {
            target: "suggesting",
            actions: ["setInputValue", "focusFirstOption"],
          },
          BLUR: "idle",
          ESCAPE: [
            {
              guard: "clearOnEsc",
              actions: "clearInputValue",
            },
            { target: "focused" },
          ],
          CLICK_BUTTON: "suggesting",
          POINTER_OVER: {
            actions: "setIsHovering",
          },
          HOME: {
            actions: "setCursorToStart",
          },
          END: {
            actions: "setCursorToEnd",
          },
          ARROW_UP: [
            {
              target: "suggesting",
              guard: "hasMatchingOption",
              actions: "focusMatchingOption",
            },
            {
              target: "suggesting",
              actions: "focusLastOption",
            },
          ],
          ARROW_DOWN: [
            {
              target: "suggesting",
              guard: "hasMatchingOption",
              actions: "focusMatchingOption",
            },
            {
              target: "suggesting",
              actions: "focusFirstOption",
            },
          ],
        },
      },

      suggesting: {
        activities: ["trackPointerDown"],
        entry: choose([
          {
            guard: not("isInputValueEmpty"),
            actions: ["focusInput", "focusMatchingOption"],
          },
          { actions: ["focusInput"] },
        ]),
        on: {
          ARROW_DOWN: {
            target: "interacting",
            actions: "focusNextOption",
          },
          ARROW_UP: {
            target: "interacting",
            actions: "focusPrevOption",
          },
          HOME: {
            target: "interacting",
            actions: "focusFirstOption",
          },
          END: {
            target: "interacting",
            actions: "focusLastOption",
          },
          ENTER: {
            target: "focused",
            actions: "selectOption",
          },
          CHANGE: {
            actions: ["setInputValue", "focusFirstOption"],
          },
          ESCAPE: "focused",
          POINTEROVER_OPTION: [
            {
              target: "interacting",
              guard: "autoComplete",
              actions: ["setActiveId"],
            },
            {
              target: "interacting",
              actions: ["setActiveId", "setNavigationValue"],
            },
          ],
          BLUR: "idle",
          CLICK_BUTTON: "focused",
        },
      },

      interacting: {
        activities: ["scrollOptionIntoView", "trackPointerDown"],
        on: {
          ARROW_DOWN: [
            {
              guard: and("autoComplete", "isLastOptionFocused"),
              actions: ["clearFocusedOption", "resetScroll"],
            },
            { actions: "focusNextOption" },
          ],
          ARROW_UP: [
            {
              guard: and("autoComplete", "isFirstOptionFocused"),
              actions: ["clearFocusedOption"],
            },
            {
              actions: ["focusPrevOption"],
            },
          ],
          CLEAR_FOCUS: {
            actions: "clearActiveId",
          },
          DELETE_KEY: {
            guard: not("isCursorAtEnd"),
            actions: "clearActiveId",
          },
          TAB: {
            actions: ["selectOption"],
          },
          HOME: {
            actions: "focusFirstOption",
          },
          END: {
            actions: "focusLastOption",
          },
          ENTER: {
            target: "focused",
            actions: ["selectOption"],
          },
          CHANGE: {
            target: "suggesting",
            actions: ["setInputValue", "focusFirstOption"],
          },
          POINTEROVER_OPTION: [
            {
              guard: "autoComplete",
              actions: ["setActiveId"],
            },
            {
              actions: ["setActiveId", "setNavigationValue"],
            },
          ],
          CLICK_OPTION: {
            target: "focused",
            actions: ["selectOption"],
          },
          ESCAPE: "focused",
          CLICK_BUTTON: "focused",
          BLUR: {
            target: "idle",
            actions: ["selectOption"],
          },
          POINTERLEAVE_LISTBOX: {
            actions: "clearActiveId",
          },
        },
      },
    },
  },
  {
    guards: {
      isCursorAtEnd: (ctx) => {
        const el = dom.getInputEl(ctx)
        if (!el) return false
        return el.selectionStart === el.selectionEnd && el.selectionEnd === el.value.length
      },
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
      hasMatchingOption: (ctx) => !!dom.getMatchingOptionEl(ctx),
    },
    activities: {
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      scrollOptionIntoView(ctx, _evt, { getState }) {
        const input = dom.getInputEl(ctx)
        const listbox = dom.getListboxEl(ctx)
        return observeAttributes(input, "aria-activedescendant", () => {
          const event = getState().event.type
          // only scroll into view for keyboard events
          const valid = ["ARROW_UP", "ARROW_DOWN", "HOME", "END"].includes(event)
          if (!valid) return

          const opt = dom.getActiveOptionEl(ctx)
          if (!opt) return

          scrollIntoView(opt, {
            boundary: listbox,
            block: "nearest",
            scrollMode: "if-needed",
          })
        })
      },
    },
    actions: {
      setup(ctx, evt) {
        ctx.uid = evt.id
        ctx.doc = ref(evt.doc)
        const region = new LiveRegion({
          ariaLive: "assertive",
          role: "status",
          doc: ctx.doc,
        })
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
      resetScroll(ctx) {
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
      invokeOnSelectionChange(ctx) {
        ctx.onSelectionChange?.(ctx.selectedValue)
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
        nextTick(() => {
          const count = dom.getOptionCount(ctx)
          if (count > 0) {
            ctx.liveRegion?.announce(ctx.getOptionCountText(count))
          }
        })
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
      removeLiveRegion(ctx) {
        ctx.liveRegion?.destroy()
      },
      setCursorToStart(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input) return
        input.selectionStart = 0
        input.selectionEnd = 0
      },
      setCursorToEnd(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input) return
        input.selectionStart = input.value.length
        input.selectionEnd = input.value.length
      },
      focusMatchingOption(ctx) {
        const option = dom.getMatchingOptionEl(ctx)
        if (!option) return
        ctx.activeId = option.id
        ctx.navigationValue = ctx.inputValue
      },
    },
  },
)
