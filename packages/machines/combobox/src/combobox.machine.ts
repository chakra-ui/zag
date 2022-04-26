import { createMachine, guards, ref } from "@zag-js/core"
import {
  createLiveRegion,
  nextTick,
  observeAttributes,
  observeChildren,
  raf,
  trackPointerDown,
} from "@zag-js/dom-utils"
import { getPlacement } from "@zag-js/popper"
import { dom } from "./combobox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: "unknown",
      context: {
        uid: "",
        loop: true,
        openOnClick: false,
        activeId: null,
        activeOptionData: null,
        inputValue: "",
        selectedValue: "",
        navigationValue: "",
        liveRegion: null,
        pointerdownNode: null,
        focusOnClear: true,
        selectInputOnFocus: false,
        selectOnTab: true,
        isHovering: false,
        isKeyboardEvent: false,
        allowCustomValue: false,
        isCustomValue: (data) => data.inputValue !== data.previousValue,
        inputBehavior: "none",
        selectionBehavior: "set",
        ...ctx,
        messages: {
          toggleButtonLabel: "Toggle suggestions",
          clearButtonLabel: "Clear value",
          navigationHint: "use the up and down keys to navigate. Press the enter key to select",
          countAnnouncement: (count) => `${count} ${count === 1 ? "option" : "options"} available`,
          ...ctx.messages,
        },
      },

      computed: {
        isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
        isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
        autoComplete: (ctx) => ctx.inputBehavior === "autocomplete",
        autoHighlight: (ctx) => ctx.inputBehavior === "autohighlight",
      },

      onEvent(ctx, evt) {
        ctx.isKeyboardEvent = /(ARROW_UP|ARROW_DOWN)/.test(evt.type)
      },

      watch: {
        inputValue: "invokeOnInputChange",
        navigationValue: "invokeOnHighlight",
        selectedValue: ["invokeOnSelect", "blurOnSelectIfNeeded"],
        activeId: "setSectionLabel",
      },

      created: "setSelectedValueIfNeeded",

      exit: "removeLiveRegion",

      on: {
        SET_VALUE: {
          actions: ["setInputValue", "setSelectedValue"],
        },
        CLEAR_VALUE: [
          { guard: "focusOnClear", target: "focused", actions: "clearInputValue" },
          { actions: "clearInputValue" },
        ],
      },

      states: {
        unknown: {
          tags: ["idle"],
          on: {
            SETUP: [
              { guard: "autoFocus", target: "focused", actions: "setupDocument" },
              { target: "idle", actions: "setupDocument" },
            ],
          },
        },

        idle: {
          tags: ["idle"],
          entry: ["scrollToTop", "clearFocusedOption", "clearPointerdownNode"],
          on: {
            CLICK_BUTTON: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
            POINTER_DOWN: {
              guard: "openOnClick",
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
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
          entry: ["focusInput", "scrollToTop", "clearFocusedOption", "clearPointerdownNode"],
          on: {
            CHANGE: {
              target: "suggesting",
              actions: "setInputValue",
            },
            BLUR: "idle",
            ESCAPE: {
              guard: and("isCustomValue", not("allowCustomValue")),
              actions: "revertInputValue",
            },
            CLICK_BUTTON: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
            POINTER_OVER: {
              actions: "setIsHovering",
            },
            ARROW_UP: [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                target: "interacting",
                actions: ["focusLastOption", "invokeOnOpen"],
              },
            ],
            ARROW_DOWN: [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                target: "interacting",
                actions: ["focusFirstOption", "invokeOnOpen"],
              },
            ],
            ALT_ARROW_DOWN: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
          },
        },

        suggesting: {
          tags: ["open", "focused"],
          activities: ["trackPointerDown", "scrollOptionIntoView", "computePlacement", "trackOptionNodes"],
          entry: ["focusInput", "invokeOnOpen"],
          on: {
            ARROW_DOWN: {
              target: "interacting",
              actions: "focusNextOption",
            },
            ARROW_UP: {
              target: "interacting",
              actions: "focusPrevOption",
            },
            ALT_ARROW_UP: "focused",
            ENTER: [
              {
                guard: and("isOptionFocused", "autoComplete"),
                target: "focused",
                actions: "selectActiveOption",
              },
              {
                guard: "isOptionFocused",
                target: "focused",
                actions: "selectOption",
              },
            ],
            CHANGE: [
              {
                guard: "autoHighlight",
                actions: ["clearFocusedOption", "setInputValue", "focusFirstOption"],
              },
              {
                actions: ["clearFocusedOption", "setInputValue"],
              },
            ],
            ESCAPE: {
              target: "focused",
              actions: "invokeOnClose",
            },
            POINTEROVER_OPTION: [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "setActiveId",
              },
              {
                target: "interacting",
                actions: ["setActiveId", "setNavigationValue"],
              },
            ],
            BLUR: {
              target: "idle",
              actions: "invokeOnClose",
            },
            CLICK_BUTTON: {
              target: "focused",
              actions: "invokeOnClose",
            },
          },
        },

        interacting: {
          tags: ["open", "focused"],
          activities: ["scrollOptionIntoView", "trackPointerDown", "computePlacement"],
          entry: "focusMatchingOption",
          on: {
            ARROW_DOWN: [
              {
                guard: and("autoComplete", "isLastOptionFocused"),
                actions: ["clearFocusedOption", "scrollToTop"],
              },
              { actions: "focusNextOption" },
            ],
            ARROW_UP: [
              {
                guard: and("autoComplete", "isFirstOptionFocused"),
                actions: "clearFocusedOption",
              },
              {
                actions: "focusPrevOption",
              },
            ],
            ALT_UP: {
              target: "focused",
              actions: ["selectOption", "invokeOnClose"],
            },
            CLEAR_FOCUS: {
              actions: "clearFocusedOption",
            },
            TAB: {
              guard: "selectOnTab",
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
                actions: ["commitNavigationValue", "setInputValue"],
              },
              {
                target: "suggesting",
                actions: ["clearFocusedOption", "setInputValue"],
              },
            ],
            POINTEROVER_OPTION: [
              {
                guard: "autoComplete",
                actions: "setActiveId",
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
              actions: "invokeOnClose",
            },
            CLICK_BUTTON: {
              target: "focused",
              actions: "invokeOnClose",
            },
            BLUR: {
              target: "idle",
              actions: "invokeOnClose",
            },
          },
        },
      },
    },

    {
      guards: {
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
        isOptionFocused: (ctx) => !!ctx.activeId,
        selectOnTab: (ctx) => !!ctx.selectOnTab,
      },

      activities: {
        computePlacement(ctx) {
          return getPlacement(dom.getControlEl(ctx), dom.getPositionerEl(ctx), {
            placement: "bottom",
            flip: false,
            sameWidth: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        },
        // in event the options are fetched (async), we still want to auto-highlight the first option
        trackOptionNodes(ctx, evt, meta) {
          if (!ctx.autoHighlight) return
          const fn = meta.getAction("focusFirstOption")
          const action = () => fn(ctx, evt, meta)
          action()
          return observeChildren(dom.getListboxEl(ctx), action)
        },
        trackPointerDown(ctx) {
          return trackPointerDown(dom.getDoc(ctx), (el) => {
            ctx.pointerdownNode = ref(el)
          })
        },
        scrollOptionIntoView(ctx, _evt) {
          const input = dom.getInputEl(ctx)
          return observeAttributes(input, "aria-activedescendant", () => {
            if (!ctx.isKeyboardEvent) return

            const option = dom.getActiveOptionEl(ctx)
            if (!option) return

            dom.scrollIntoView(ctx, option)

            if (ctx.autoComplete) {
              dom.focusInput(ctx)
            }
          })
        },
      },

      actions: {
        setupDocument(ctx, evt) {
          if (evt.doc) ctx.doc = ref(evt.doc)
          ctx.uid = evt.id
          nextTick(() => {
            ctx.liveRegion = createLiveRegion({ level: "assertive", document: ctx.doc })
          })
        },
        setActiveId(ctx, evt) {
          ctx.activeId = evt.id
          ctx.activeOptionData = evt.data
        },
        clearActiveId(ctx) {
          ctx.activeId = null
          ctx.activeOptionData = null
        },
        setNavigationValue(ctx, evt) {
          ctx.navigationValue = evt.value
        },
        clearNavigationValue(ctx) {
          ctx.navigationValue = ""
        },
        commitNavigationValue(ctx) {
          ctx.inputValue = ctx.navigationValue
          ctx.navigationValue = ""
        },
        clearFocusedOption(ctx) {
          ctx.activeId = null
          ctx.activeOptionData = null
          ctx.navigationValue = ""
        },
        selectActiveOption(ctx) {
          const option = dom.getActiveOptionEl(ctx)
          if (!option) return
          ctx.selectedValue = dom.getOptionData(option).label
          ctx.inputValue = ctx.selectedValue
        },
        selectOption(ctx, evt) {
          ctx.selectedValue = evt.value || ctx.navigationValue
          let value: string | undefined
          if (ctx.selectionBehavior === "set") value = ctx.selectedValue
          if (ctx.selectionBehavior === "clear") value = ""
          if (value != null) ctx.inputValue = value
        },
        blurOnSelectIfNeeded(ctx) {
          if (ctx.autoComplete || !ctx.blurOnSelect) return
          raf(() => {
            dom.getInputEl(ctx)?.blur()
          })
        },
        focusInput(ctx, evt) {
          if (evt.type === "CHANGE") return
          raf(() => {
            dom.focusInput(ctx)
          })
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
        setSelectedValueIfNeeded(ctx) {
          // if user initializes with a value, we need to set the selected value
          if (!ctx.isInputValueEmpty) {
            ctx.selectedValue = ctx.inputValue
          }
        },
        clearSelectedValue(ctx) {
          ctx.selectedValue = ""
        },
        scrollToTop(ctx) {
          const listbox = dom.getListboxEl(ctx)
          if (!listbox) return
          listbox.scrollTop = 0
        },
        invokeOnInputChange(ctx) {
          ctx.onInputChange?.({ value: ctx.inputValue })
        },
        invokeOnHighlight(ctx) {
          const relatedTarget = dom.getMatchingOptionEl(ctx, ctx.navigationValue)
          ctx.onHighlight?.({ value: ctx.navigationValue, relatedTarget })
        },
        invokeOnSelect(ctx) {
          const relatedTarget = dom.getMatchingOptionEl(ctx, ctx.selectedValue)
          ctx.onSelect?.({ value: ctx.selectedValue, relatedTarget })
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        highlightFirstOption(ctx) {
          raf(() => {
            const option = dom.getFirstEl(ctx)
            if (!option) return
            // highlight
            ctx.activeId = option.id
            ctx.activeOptionData = dom.getOptionData(option)
          })
        },
        focusFirstOption(ctx) {
          raf(() => {
            const option = dom.getFirstEl(ctx)
            if (!option || option.id === ctx.activeId) return
            const data = dom.getOptionData(option)
            // focus
            ctx.activeId = option.id
            ctx.activeOptionData = data
            ctx.navigationValue = data.label
          })
        },
        focusLastOption(ctx) {
          raf(() => {
            const option = dom.getLastEl(ctx)
            if (!option || option.id === ctx.activeId) return
            const data = dom.getOptionData(option)
            // focus
            ctx.activeId = option.id
            ctx.activeOptionData = data
            ctx.navigationValue = data.label
          })
        },
        focusNextOption(ctx) {
          raf(() => {
            const option = dom.getNextEl(ctx, ctx.activeId ?? "")
            if (!option || option.id === ctx.activeId) return
            const data = dom.getOptionData(option)
            // focus
            ctx.activeId = option.id
            ctx.activeOptionData = data
            ctx.navigationValue = data.label
          })
        },
        focusPrevOption(ctx) {
          raf(() => {
            let option = dom.getPrevEl(ctx, ctx.activeId ?? "")
            if (!option || option.id === ctx.activeId) return
            const data = dom.getOptionData(option)
            // focus
            ctx.activeId = option.id
            ctx.activeOptionData = data
            ctx.navigationValue = data.label
          })
        },
        focusMatchingOption(ctx) {
          raf(() => {
            const option = dom.getMatchingOptionEl(ctx)
            if (!option || option.id === ctx.activeId) return
            // focus
            ctx.activeId = option.id
            ctx.activeOptionData = dom.getOptionData(option)
            ctx.navigationValue = ctx.inputValue
            // scroll into view
            dom.scrollIntoView(ctx, option)
          })
        },
        announceOptionCount(ctx) {
          raf(() => {
            const count = dom.getOptionCount(ctx)
            if (!count) return
            const text = ctx.messages.countAnnouncement(count)
            ctx.liveRegion?.announce(text)
          })
        },
        clearPointerdownNode(ctx) {
          ctx.pointerdownNode = null
        },
        setIsHovering(ctx) {
          ctx.isHovering = true
        },
        clearIsHovering(ctx) {
          ctx.isHovering = false
        },
        removeLiveRegion(ctx) {
          ctx.liveRegion?.destroy()
        },
        setSectionLabel(ctx) {
          const label = dom.getClosestSectionLabel(ctx)
          if (!label) return
          ctx.sectionLabel = label
        },
      },

      hookSync: true,
    },
  )
}
