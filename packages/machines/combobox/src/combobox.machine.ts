import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { contains, observeAttributes, observeChildren, raf } from "@zag-js/dom-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { createLiveRegion } from "@zag-js/live-region"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./combobox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: "unknown",
      context: {
        loop: true,
        openOnClick: false,
        ariaHidden: true,

        activeId: null,
        activeOptionData: null,
        navigationData: null,
        selectionData: null,

        inputValue: "",

        liveRegion: null,
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
        positioning: {
          placement: "bottom",
          flip: false,
          sameWidth: true,
          ...ctx.positioning,
        },
        translations: {
          triggerLabel: "Toggle suggestions",
          clearTriggerLabel: "Clear value",
          navigationHint: "use the up and down keys to navigate. Press the enter key to select",
          countAnnouncement: (count) => `${count} ${count === 1 ? "option" : "options"} available`,
          ...ctx.translations,
        },
      },

      activities: ["syncInputValue"],

      computed: {
        isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        autoComplete: (ctx) => ctx.inputBehavior === "autocomplete",
        autoHighlight: (ctx) => ctx.inputBehavior === "autohighlight",
      },

      onEvent(ctx, evt) {
        ctx.isKeyboardEvent = /(ARROW_UP|ARROW_DOWN|HOME|END|TAB)/.test(evt.type)
      },

      watch: {
        inputValue: "invokeOnInputChange",
        navigationData: "invokeOnHighlight",
        selectionData: ["invokeOnSelect", "blurOnSelectIfNeeded"],
        activeId: "setSectionLabel",
      },

      exit: "removeLiveRegion",

      on: {
        SET_VALUE: {
          actions: ["setInputValue", "setSelectionData"],
        },
        SET_INPUT_VALUE: {
          actions: "setInputValue",
        },
        CLEAR_VALUE: [
          {
            guard: "focusOnClear",
            target: "focused",
            actions: "clearInputValue",
          },
          {
            actions: "clearInputValue",
          },
        ],
        POINTER_OVER: {
          actions: "setIsHovering",
        },
        POINTER_LEAVE: {
          actions: "clearIsHovering",
        },
      },

      states: {
        unknown: {
          tags: ["idle"],
          on: {
            SETUP: [
              {
                guard: "autoFocus",
                target: "focused",
                actions: "setupDocument",
              },
              {
                target: "idle",
                actions: "setupDocument",
              },
            ],
          },
        },

        idle: {
          tags: ["idle"],
          entry: ["scrollToTop", "clearFocusedOption"],
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
            FOCUS: "focused",
          },
        },

        focused: {
          tags: ["focused"],
          entry: ["focusInput", "scrollToTop", "clearFocusedOption"],
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
          activities: [
            "trackInteractOutside",
            "scrollOptionIntoView",
            "computePlacement",
            "trackOptionNodes",
            "hideOtherElements",
          ],
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
            HOME: {
              target: "interacting",
              actions: ["focusFirstOption", "preventDefault"],
            },
            END: {
              target: "interacting",
              actions: ["focusLastOption", "preventDefault"],
            },
            ENTER: [
              {
                guard: and("hasFocusedOption", "autoComplete"),
                target: "focused",
                actions: "selectActiveOption",
              },
              {
                guard: "hasFocusedOption",
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
                actions: "setActiveOption",
              },
              {
                target: "interacting",
                actions: ["setActiveOption", "setNavigationData"],
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
          activities: ["scrollOptionIntoView", "trackInteractOutside", "computePlacement", "hideOtherElements"],
          entry: "focusMatchingOption",
          on: {
            HOME: {
              actions: ["focusFirstOption", "preventDefault"],
            },
            END: {
              actions: ["focusLastOption", "preventDefault"],
            },
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
                actions: ["commitNavigationData", "setInputValue"],
              },
              {
                target: "suggesting",
                actions: ["clearFocusedOption", "setInputValue"],
              },
            ],
            POINTEROVER_OPTION: [
              {
                guard: "autoComplete",
                actions: "setActiveOption",
              },
              {
                actions: ["setActiveOption", "setNavigationData"],
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
        isCustomValue: (ctx) =>
          !!ctx.isCustomValue?.({ inputValue: ctx.inputValue, previousValue: ctx.selectionData?.value }),
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasFocusedOption: (ctx) => !!ctx.activeId,
        selectOnTab: (ctx) => !!ctx.selectOnTab,
      },

      activities: {
        syncInputValue: (ctx) => {
          const input = dom.getInputEl(ctx)
          return observeAttributes(input, ["data-value"], () => {
            if (!input) return
            const value = input.dataset.value || ""
            input.value = value
            input.selectionStart = value.length
            input.selectionEnd = value.length
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              const ignore = [dom.getContentEl(ctx), dom.getTriggerEl(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onInteractOutside() {
              send({ type: "BLUR", src: "interact-outside" })
            },
          })
        },
        hideOtherElements(ctx) {
          if (!ctx.ariaHidden) return
          return ariaHidden([dom.getInputEl(ctx), dom.getContentEl(ctx), dom.getTriggerEl(ctx)])
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(dom.getControlEl(ctx), dom.getPositionerEl(ctx), {
            ...ctx.positioning,
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
          const focusFirstOption = meta.getAction("focusFirstOption")
          const exec = () => focusFirstOption(ctx, evt, meta)
          exec()
          return observeChildren(dom.getContentEl(ctx), exec)
        },
        scrollOptionIntoView(ctx, _evt) {
          const input = dom.getInputEl(ctx)
          return observeAttributes(input, "aria-activedescendant", () => {
            if (!ctx.isKeyboardEvent) return

            const option = dom.getActiveOptionEl(ctx)
            option?.scrollIntoView({ block: "nearest" })

            if (ctx.autoComplete) {
              dom.focusInput(ctx)
            }
          })
        },
      },

      actions: {
        setupDocument(ctx) {
          ctx.liveRegion = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
        },
        setActiveOption(ctx, evt) {
          const { label, id, value } = evt
          ctx.activeId = id
          ctx.activeOptionData = { label, value }
        },
        setNavigationData(ctx, evt) {
          const { label, value } = evt
          ctx.navigationData = { label, value }
        },
        clearNavigationData(ctx) {
          ctx.navigationData = null
        },
        commitNavigationData(ctx) {
          if (!ctx.navigationData) return
          ctx.inputValue = ctx.navigationData.label
          ctx.navigationData = null
        },
        clearFocusedOption(ctx) {
          ctx.activeId = null
          ctx.activeOptionData = null
          ctx.navigationData = null
        },
        selectActiveOption(ctx) {
          if (!ctx.activeOptionData) return
          ctx.selectionData = ctx.activeOptionData
          ctx.inputValue = ctx.activeOptionData.label
        },
        selectOption(ctx, evt) {
          const isOptionEvent = !!evt.value && !!evt.label

          ctx.selectionData = isOptionEvent
            ? {
                label: evt.label,
                value: evt.value,
              }
            : ctx.navigationData

          let value: string | undefined

          if (!ctx.selectionData) return

          if (ctx.selectionBehavior === "set") {
            value = ctx.selectionData!.label
          }
          if (ctx.selectionBehavior === "clear") {
            value = ""
          }
          if (value != null) {
            ctx.inputValue = value
          }
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
          const value = evt.type === "SET_VALUE" ? evt.label : evt.value
          ctx.inputValue = value
        },
        clearInputValue(ctx) {
          ctx.inputValue = ""
        },
        revertInputValue(ctx) {
          if (!ctx.selectionData) return
          ctx.inputValue = ctx.selectionData.label
        },
        setSelectionData(ctx, evt) {
          const { label, value } = evt
          ctx.selectionData = { label, value }
        },
        clearSelectedValue(ctx) {
          ctx.selectionData = null
        },
        scrollToTop(ctx) {
          const listbox = dom.getContentEl(ctx)
          if (!listbox) return
          listbox.scrollTop = 0
        },
        invokeOnInputChange(ctx) {
          ctx.onInputChange?.({ value: ctx.inputValue })
        },
        invokeOnHighlight(ctx) {
          const { label, value } = ctx.navigationData ?? {}
          const relatedTarget = dom.getMatchingOptionEl(ctx, value)
          ctx.onHighlight?.({ label, value, relatedTarget })
        },
        invokeOnSelect(ctx) {
          const { label, value } = ctx.selectionData ?? {}
          const relatedTarget = dom.getMatchingOptionEl(ctx, value)
          ctx.onSelect?.({ label, value, relatedTarget })
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        highlightFirstOption(ctx) {
          raf(() => {
            setHighlight(ctx, dom.getFirstEl(ctx))
          })
        },
        focusFirstOption(ctx) {
          raf(() => {
            setFocus(ctx, dom.getFirstEl(ctx))
          })
        },
        focusLastOption(ctx) {
          raf(() => {
            setFocus(ctx, dom.getLastEl(ctx))
          })
        },
        focusNextOption(ctx) {
          raf(() => {
            const option = dom.getNextEl(ctx, ctx.activeId ?? "")
            setFocus(ctx, option)
          })
        },
        focusPrevOption(ctx) {
          raf(() => {
            let option = dom.getPrevEl(ctx, ctx.activeId ?? "")
            setFocus(ctx, option)
          })
        },
        focusMatchingOption(ctx) {
          raf(() => {
            const option = dom.getMatchingOptionEl(ctx, ctx.selectionData?.value)
            option?.scrollIntoView({ block: "nearest" })
            setFocus(ctx, option)
          })
        },
        announceOptionCount(ctx) {
          raf(() => {
            const count = dom.getOptionCount(ctx)
            if (!count) return
            const text = ctx.translations.countAnnouncement(count)
            ctx.liveRegion?.announce(text)
          })
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
        preventDefault(_ctx, evt) {
          evt.preventDefault()
        },
        setSectionLabel(ctx) {
          const label = dom.getClosestSectionLabel(ctx)
          if (!label) return
          ctx.sectionLabel = label
        },
      },
    },
  )
}

function setHighlight(ctx: MachineContext, option: HTMLElement | undefined | null) {
  if (!option) return
  const data = dom.getOptionData(option)
  ctx.activeId = option.id
  ctx.activeOptionData = data
  return data
}

function setFocus(ctx: MachineContext, option: HTMLElement | undefined | null) {
  if (!option || option.id === ctx.activeId) return
  const data = setHighlight(ctx, option)
  ctx.navigationData = data!
}
