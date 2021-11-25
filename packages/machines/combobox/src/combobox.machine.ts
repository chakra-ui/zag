import { createMachine, guards, ref } from "@ui-machines/core"
import { LiveRegion, nextTick, observeAttributes, trackPointerDown } from "@ui-machines/dom-utils"
import { isApple } from "@ui-machines/utils"
import { dom } from "./combobox.dom"
import { ComboboxMachineContext, ComboboxMachineState } from "./combobox.types"

const { and, not } = guards

export const comboboxMachine = createMachine<ComboboxMachineContext, ComboboxMachineState>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: "",
      loop: true,
      autoComplete: true,
      closeOnBlur: true,
      openOnClick: false,
      activeId: null,
      inputValue: "",
      selectedValue: "",
      navigationValue: "",
      liveRegion: null,
      pointerdownNode: null,
      focusOnClear: true,
      selectOnFocus: false,
      isHoveringInput: false,
      openText: "Show suggestions",
      closeText: "Hide suggestions",
      clearText: "Clear value",
      allowCustomValue: false,
      getOptionCountText: (count) => {
        return [
          `${count} ${count === 1 ? "option" : "options"} available`,
          "use the up and down keys to navigate. Press the enter key to select",
        ].join(" ")
      },
    },

    computed: {
      trimmedInputValue: (ctx) => ctx.inputValue?.trim(),
      isInputValueEmpty: (ctx) => ctx.trimmedInputValue.length === 0,
      hintValue: (ctx) =>
        ctx.navigationValue ? ctx.inputValue + ctx.navigationValue.substr(ctx.inputValue.length) : "",
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
    },

    watch: {
      inputValue: "invokeOnInputChange",
      navigationValue: "invokeOnHighlight",
      selectedValue: "invokeOnSelectionChange",
    },

    created(ctx) {
      // if user initializes with a value, we need to set the selected value
      if (ctx.inputValue !== "") {
        ctx.selectedValue = ctx.inputValue
      }
    },

    on: {
      SET_VALUE: {
        actions: ["setInputValue", "setSelectedValue"],
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
            { guard: "autoFocus", target: "focused", actions: "setup" },
            { target: "idle", actions: "setup" },
          ],
        },
      },

      idle: {
        entry: ["resetScroll", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CLICK_BUTTON: {
            target: "suggesting",
            actions: ["announceOptionCount", "invokeOnOpen"],
          },
          POINTER_DOWN: {
            guard: "openOnClick",
            target: "suggesting",
            actions: ["announceOptionCount", "invokeOnOpen"],
          },
          POINTER_OVER: {
            actions: "setIsHovering",
          },
          POINTER_LEAVE: {
            actions: "clearIsHovering",
          },
          FOCUS: "focused",
        },
      },

      focused: {
        tags: ["focused"],
        entry: ["focusInput", "resetScroll", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CHANGE: [
            {
              guard: "autoComplete",
              target: "suggesting",
              actions: ["setInputValue"],
            },
            {
              target: "suggesting",
              actions: ["setInputValue", "focusFirstOption"],
            },
          ],
          BLUR: "idle",
          ESCAPE: {
            guard: and("isCustomValue", not("allowCustomValue")),
            actions: "resetInputValue",
          },
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
              guard: "autoComplete",
              target: "suggesting",
            },
            {
              target: "suggesting",
              actions: ["focusLastOption"],
            },
          ],
          ARROW_DOWN: [
            {
              guard: "autoComplete",
              target: "suggesting",
            },
            {
              target: "suggesting",
              actions: ["focusFirstOption"],
            },
          ],
          ALT_DOWN: "suggesting",
        },
      },

      suggesting: {
        tags: ["expanded", "focused"],
        activities: ["trackPointerDown", "scrollOptionIntoView"],
        entry: ["focusInput", "focusMatchingOption", "invokeOnOpen"],
        on: {
          ARROW_DOWN: {
            target: "interacting",
            actions: ["focusNextOption"],
          },
          ARROW_UP: {
            target: "interacting",
            actions: ["focusPrevOption"],
          },
          ALT_UP: "focused",
          HOME: {
            target: "interacting",
            actions: ["focusFirstOption"],
          },
          END: {
            target: "interacting",
            actions: ["focusLastOption"],
          },
          CHANGE: [
            {
              guard: "autoComplete",
              actions: ["clearNavigationValue", "clearActiveId", "setInputValue"],
            },
            {
              actions: ["setInputValue", "focusFirstOption"],
            },
          ],
          ESCAPE: {
            target: "focused",
            actions: ["invokeOnClose"],
          },
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
          BLUR: {
            target: "idle",
            actions: ["invokeOnClose"],
          },
          CLICK_BUTTON: {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        },
      },

      interacting: {
        tags: ["expanded", "focused"],
        activities: ["scrollOptionIntoView", "trackPointerDown"],
        on: {
          ARROW_DOWN: [
            {
              guard: and("autoComplete", "isLastOptionFocused"),
              actions: ["clearFocusedOption", "resetScroll"],
            },
            { actions: ["focusNextOption"] },
          ],
          ARROW_UP: [
            {
              guard: and("autoComplete", "isFirstOptionFocused"),
              actions: ["clearFocusedOption"],
            },
            { actions: ["focusPrevOption"] },
          ],
          ALT_UP: {
            target: "focused",
            actions: ["selectOption", "invokeOnClose"],
          },
          HOME: {
            actions: ["focusFirstOption"],
          },
          END: {
            actions: ["focusLastOption"],
          },
          CLEAR_FOCUS: {
            actions: "clearActiveId",
          },
          DELETE: {
            guard: not("isCursorAtEnd"),
            actions: "clearActiveId",
          },
          TAB: {
            target: "idle",
            actions: ["selectOption"],
          },
          ENTER: {
            target: "focused",
            actions: ["selectOption", "invokeOnClose"],
          },
          CHANGE: [
            {
              guard: "autoComplete",
              target: "suggesting",
              actions: ["clearNavigationValue", "clearActiveId", "setInputValue"],
            },
            {
              target: "suggesting",
              actions: ["setInputValue", "focusFirstOption"],
            },
          ],
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
            actions: ["selectOption", "invokeOnClose"],
          },
          ESCAPE: {
            target: "focused",
            actions: ["invokeOnClose"],
          },
          CLICK_BUTTON: {
            target: "focused",
            actions: ["invokeOnClose"],
          },
          BLUR: {
            target: "idle",
            actions: ["invokeOnClose"],
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
      autoComplete: (ctx) => !!ctx.autoComplete,
      isFirstOptionFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.activeId,
      isLastOptionFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.activeId,
      isCustomValue: (ctx) => ctx.inputValue !== ctx.selectedValue,
      allowCustomValue: (ctx) => !!ctx.allowCustomValue,
    },
    activities: {
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      scrollOptionIntoView(ctx, _evt, { getState }) {
        const input = dom.getInputEl(ctx)
        return observeAttributes(input, "aria-activedescendant", () => {
          const event = getState().event.type
          // only scroll into view for keyboard events
          const valid = ["ARROW_UP", "ARROW_DOWN", "HOME", "END"].includes(event)
          if (!valid) return
          const opt = dom.getActiveOptionEl(ctx)
          if (!opt) return
          dom.scrollIntoView(ctx, opt)
          dom.focusInput(ctx)
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
      clearNavigationValue(ctx) {
        ctx.navigationValue = ""
      },
      clearFocusedOption(ctx) {
        ctx.activeId = null
        ctx.navigationValue = ""
      },
      selectOption(ctx, evt) {
        ctx.selectedValue = evt.value || ctx.navigationValue
        ctx.inputValue = ctx.selectedValue
      },
      focusInput(ctx, evt) {
        if (evt.type === "CHANGE") return
        nextTick(() => dom.focusInput(ctx))
      },
      setInputValue(ctx, evt) {
        ctx.inputValue = evt.value
      },
      clearInputValue(ctx) {
        ctx.inputValue = ""
      },
      resetInputValue(ctx) {
        ctx.inputValue = ctx.selectedValue
      },
      setSelectedValue(ctx, evt) {
        ctx.selectedValue = evt.value
      },
      clearSelectedValue(ctx) {
        ctx.selectedValue = ""
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
      invokeOnClose(ctx) {
        ctx.onClose?.()
      },
      focusFirstOption(ctx) {
        nextTick(() => {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          ctx.activeId = first.id
          const { label } = dom.getOptionData(first)
          ctx.navigationValue = label
        })
      },
      focusLastOption(ctx) {
        nextTick(() => {
          const last = dom.getLastEl(ctx)
          if (!last) return
          ctx.activeId = last.id
          const { label } = dom.getOptionData(last)
          ctx.navigationValue = label
        })
      },
      focusNextOption(ctx) {
        const next = dom.getNextEl(ctx, ctx.activeId ?? "")
        if (!next) return
        ctx.activeId = next.id
        const { label } = dom.getOptionData(next)
        ctx.navigationValue = label
      },
      focusPrevOption(ctx) {
        let prev = dom.getPrevEl(ctx, ctx.activeId ?? "")
        if (!prev) return
        ctx.activeId = prev.id
        const { label } = dom.getOptionData(prev)
        ctx.navigationValue = label
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
        nextTick(() => {
          const el = dom.getMatchingOptionEl(ctx)
          if (!el) return
          ctx.activeId = el.id
          ctx.navigationValue = ctx.inputValue
          dom.scrollIntoView(ctx, el)
        })
      },
    },
  },
)
