import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
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
      initial: ctx.autoFocus ? "focused" : "idle",
      context: {
        loop: true,
        openOnClick: false,
        ariaHidden: true,

        focusedId: null,
        focusedOptionData: null,
        navigationData: null,
        selectionData: null,

        inputValue: "",

        liveRegion: null,
        focusOnClear: true,
        selectOnTab: true,
        isHovering: false,
        isKeyboardEvent: false,
        allowCustomValue: false,
        isCustomValue: (data) => data.inputValue !== data.previousValue,
        inputBehavior: "none",
        selectionBehavior: "set",
        closeOnSelect: true,
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

      computed: {
        isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        autoComplete: (ctx) => ctx.inputBehavior === "autocomplete",
        autoHighlight: (ctx) => ctx.inputBehavior === "autohighlight",
      },

      watch: {
        inputValue: "invokeOnInputChange",
        navigationData: "invokeOnHighlight",
        selectionData: ["invokeOnSelect", "blurInputIfNeeded"],
        focusedId: "setSectionLabel",
      },

      entry: ["setupLiveRegion"],
      exit: ["removeLiveRegion"],

      activities: ["syncInputValue"],

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
            actions: ["clearInputValue", "clearSelectedValue"],
          },
          {
            actions: ["clearInputValue", "clearSelectedValue"],
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
        idle: {
          tags: ["idle"],
          entry: ["scrollToTop", "clearFocusedOption"],
          on: {
            CLICK_BUTTON: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
            CLICK_INPUT: {
              guard: "openOnClick",
              target: "interacting",
              actions: "invokeOnOpen",
            },
            FOCUS: "focused",
          },
        },

        focused: {
          tags: ["focused"],
          entry: ["focusInput", "scrollToTop", "clearFocusedOption"],
          activities: ["trackInteractOutside"],
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
            CLICK_INPUT: {
              guard: "openOnClick",
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
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
                guard: and("hasFocusedOption", "autoComplete", "closeOnSelect"),
                target: "focused",
                actions: ["selectActiveOption", "invokeOnClose"],
              },
              {
                guard: and("hasFocusedOption", "autoComplete"),
                actions: "selectActiveOption",
              },
              {
                guard: and("hasFocusedOption", "closeOnSelect"),
                target: "focused",
                actions: ["selectOption", "invokeOnClose"],
              },
              {
                guard: "hasFocusedOption",
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
            CLICK_OPTION: [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectOption", "invokeOnClose"],
              },
              {
                actions: ["selectOption"],
              },
            ],
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
            ENTER: [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectOption", "invokeOnClose"],
              },
              {
                actions: ["selectOption"],
              },
            ],
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
            CLICK_OPTION: [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectOption", "invokeOnClose"],
              },
              {
                actions: ["selectOption"],
              },
            ],
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
        isFirstOptionFocused: (ctx) => dom.getFirstEl(ctx)?.id === ctx.focusedId,
        isLastOptionFocused: (ctx) => dom.getLastEl(ctx)?.id === ctx.focusedId,
        isCustomValue: (ctx) =>
          !!ctx.isCustomValue?.({ inputValue: ctx.inputValue, previousValue: ctx.selectionData?.value }),
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasFocusedOption: (ctx) => !!ctx.focusedId,
        selectOnTab: (ctx) => !!ctx.selectOnTab,
        closeOnSelect: (ctx) => !!ctx.closeOnSelect,
      },

      activities: {
        syncInputValue: (ctx) => {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          return observeAttributes(inputEl, ["data-value"], () => {
            inputEl.value = inputEl.dataset.value || ""
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              const ignore = [dom.getContentEl(ctx), dom.getTriggerEl(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
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
        scrollOptionIntoView(ctx, _evt, { getState }) {
          const inputEl = dom.getInputEl(ctx)
          return observeAttributes(inputEl, ["aria-activedescendant"], () => {
            const evt = getState().event
            const isKeyboardEvent = /(ARROW_UP|ARROW_DOWN|HOME|END|TAB)/.test(evt.type)
            if (!isKeyboardEvent) return

            const option = dom.getActiveOptionEl(ctx)
            option?.scrollIntoView({ block: "nearest" })

            if (ctx.autoComplete) {
              dom.focusInput(ctx)
            }
          })
        },
      },

      actions: {
        setupLiveRegion(ctx) {
          ctx.liveRegion = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
        },
        removeLiveRegion(ctx) {
          ctx.liveRegion?.destroy()
        },
        setActiveOption(ctx, evt) {
          const { label, id, value } = evt
          ctx.focusedId = id
          ctx.focusedOptionData = { label, value }
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
          ctx.focusedId = null
          ctx.focusedOptionData = null
          ctx.navigationData = null
        },
        selectActiveOption(ctx) {
          if (!ctx.focusedOptionData) return
          ctx.selectionData = ctx.focusedOptionData
          ctx.inputValue = ctx.focusedOptionData.label
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
        blurInputIfNeeded(ctx) {
          if (ctx.autoComplete || !ctx.blurOnSelect) return
          raf(() => {
            dom.getInputEl(ctx)?.blur()
          })
        },
        focusInput(ctx, evt) {
          if (evt.type === "CHANGE") return
          dom.focusInput(ctx)
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
            const option = dom.getNextEl(ctx, ctx.focusedId ?? "")
            setFocus(ctx, option)
          })
        },
        focusPrevOption(ctx) {
          raf(() => {
            const option = dom.getPrevEl(ctx, ctx.focusedId ?? "")
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
  ctx.focusedId = option.id
  ctx.focusedOptionData = data
  return data
}

function setFocus(ctx: MachineContext, option: HTMLElement | undefined | null) {
  if (!option || option.id === ctx.focusedId) return
  const data = setHighlight(ctx, option)
  ctx.navigationData = data!
}
