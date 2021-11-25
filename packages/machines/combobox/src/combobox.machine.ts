import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { LiveRegion, nextTick, observeAttributes, trackPointerDown } from "@ui-machines/dom-utils"
import { dom } from "./combobox.dom"
import { ComboboxMachineContext, ComboboxMachineState } from "./combobox.types"

const { and, not } = guards

function withAutoHighlight(actions: string[], action: string) {
  return choose([
    {
      guard: "autoHighlight",
      actions: actions.concat(action),
    },
    { actions },
  ])
}

const suggestEntry = ["focusInput", "focusMatchingOption", "invokeOnOpen"]

export const comboboxMachine = createMachine<ComboboxMachineContext, ComboboxMachineState>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: "",
      loop: true,
      autoComplete: true,
      autoHighlight: true,
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
      isCustomValue: (opts) => opts.inputValue !== opts.previousValue,
      getOptionCountText: (count) => {
        return [
          `${count} ${count === 1 ? "option" : "options"} available`,
          "use the up and down keys to navigate. Press the enter key to select",
        ].join(" ")
      },
    },

    computed: {
      isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
    },

    watch: {
      inputValue: "invokeOnInputChange",
      navigationValue: "invokeOnHighlight",
      selectedValue: "invokeOnSelect",
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
            {
              guard: "autoFocus",
              target: "focused",
              actions: ["setId", "setOwnerDocument", "createLiveRegion"],
            },
            {
              target: "idle",
              actions: ["setId", "setOwnerDocument", "createLiveRegion"],
            },
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
              actions: withAutoHighlight(["setInputValue"], "highlightFirstOption"),
            },
            {
              target: "suggesting",
              actions: withAutoHighlight(["setInputValue"], "focusFirstOption"),
            },
          ],
          BLUR: "idle",
          ESCAPE: {
            guard: and("isCustomValue", not("allowCustomValue")),
            actions: "revertInputValue",
          },
          CLICK_BUTTON: "suggesting",
          POINTER_OVER: {
            actions: "setIsHovering",
          },
          HOME: {
            actions: "moveCursorToStart",
          },
          END: {
            actions: "moveCursorToEnd",
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
        entry: choose([
          {
            guard: and("autoComplete", "autoHighlight", "isInputValueEmpty"),
            actions: suggestEntry.concat("highlightFirstOption"),
          },
          {
            guard: and("autoHighlight", "isInputValueEmpty"),
            actions: suggestEntry.concat(["focusFirstOption"]),
          },
          {
            actions: suggestEntry,
          },
        ]),
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
          ENTER: [
            {
              guard: and("hasActiveId", "autoComplete"),
              target: "focused",
              actions: ["selectActiveId"],
            },
            {
              guard: "hasActiveId",
              target: "focused",
              actions: ["selectOption"],
            },
          ],
          CHANGE: [
            {
              guard: "autoComplete",
              actions: withAutoHighlight(["clearFocusedOption", "setInputValue"], "highlightFirstOption"),
            },
            {
              actions: withAutoHighlight(["setInputValue"], "focusFirstOption"),
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
            actions: "clearFocusedOption",
          },
          DELETE: {
            guard: not("isCursorAtEnd"),
            actions: "clearFocusedOption",
          },
          TAB: {
            target: "idle",
            actions: ["selectOption", "invokeOnClose"],
          },
          ENTER: {
            target: "focused",
            actions: ["selectOption", "invokeOnClose"],
          },
          CHANGE: [
            {
              guard: "autoComplete",
              target: "suggesting",
              actions: withAutoHighlight(["clearFocusedOption", "setInputValue"], "highlightFirstOption"),
            },
            {
              target: "suggesting",
              actions: withAutoHighlight(["setInputValue"], "focusFirstOption"),
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
      isInputValueEmpty: (ctx) => ctx.isInputValueEmpty,
      focusOnClear: (ctx) => !!ctx.focusOnClear,
      autoFocus: (ctx) => !!ctx.autoFocus,
      autoComplete: (ctx) => ctx.autoComplete,
      autoHighlight: (ctx) => ctx.autoHighlight,
      isFirstOptionFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.activeId,
      isLastOptionFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.activeId,
      isCustomValue: (ctx) => !!ctx.isCustomValue?.({ inputValue: ctx.inputValue, previousValue: ctx.selectedValue }),
      allowCustomValue: (ctx) => !!ctx.allowCustomValue,
      hasActiveId: (ctx) => !!ctx.activeId,
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
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      createLiveRegion(ctx) {
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
      selectActiveId(ctx) {
        const option = dom.getActiveOptionEl(ctx)
        if (!option) return
        ctx.selectedValue = dom.getOptionData(option).label
        ctx.inputValue = ctx.selectedValue
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
      revertInputValue(ctx) {
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
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.selectedValue)
      },
      invokeOnOpen(ctx) {
        ctx.onOpen?.()
      },
      invokeOnClose(ctx) {
        ctx.onClose?.()
      },
      highlightFirstOption(ctx) {
        nextTick(() => {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          ctx.activeId = first.id
        })
      },
      focusFirstOption(ctx) {
        nextTick(() => {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          ctx.activeId = first.id
          const data = dom.getOptionData(first)
          ctx.navigationValue = data.label
        })
      },
      focusLastOption(ctx) {
        nextTick(() => {
          const last = dom.getLastEl(ctx)
          if (!last) return
          ctx.activeId = last.id
          const data = dom.getOptionData(last)
          ctx.navigationValue = data.label
        })
      },
      focusNextOption(ctx) {
        const next = dom.getNextEl(ctx, ctx.activeId ?? "")
        if (!next) return
        ctx.activeId = next.id
        const data = dom.getOptionData(next)
        ctx.navigationValue = data.label
      },
      focusPrevOption(ctx) {
        let prevOption = dom.getPrevEl(ctx, ctx.activeId ?? "")
        if (!prevOption) return
        ctx.activeId = prevOption.id
        const data = dom.getOptionData(prevOption)
        ctx.navigationValue = data.label
      },
      announceOptionCount(ctx) {
        nextTick(() => {
          const count = dom.getOptionCount(ctx)
          if (count > 0) {
            ctx.liveRegion?.announce(ctx.getOptionCountText(count))
          }
        })
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
      moveCursorToStart(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input) return
        input.selectionStart = 0
        input.selectionEnd = 0
      },
      moveCursorToEnd(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input) return
        input.selectionStart = input.value.length
        input.selectionEnd = input.value.length
      },
      focusMatchingOption(ctx) {
        nextTick(() => {
          const option = dom.getMatchingOptionEl(ctx)
          if (!option) return

          // focus the matching option
          ctx.activeId = option.id
          ctx.navigationValue = ctx.inputValue

          // scroll the option into view
          dom.scrollIntoView(ctx, option)
        })
      },
    },
  },
)
