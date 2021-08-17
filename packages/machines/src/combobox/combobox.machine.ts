import { cast, env, nextTick } from "@core-foundation/utils"
import { createMachine, guards, preserve } from "@ui-machines/core"
import scrollIntoView from "scroll-into-view-if-needed"
import { trackPointerDown } from "../utils/pointer-down"
import { LiveRegion } from "../utils/live-region"
import { observeNodeAttr } from "../utils/mutation-observer"
import { WithDOM } from "../utils/types"
import { dom, getElements } from "./combobox.dom"

const { and } = guards

type Option = {
  label: string
  value: string
}

export type ComboboxMachineContext = WithDOM<{
  /**
   * The name applied to the `input` element. Useful for form submissions.
   */
  name?: string
  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean
  /**
   * Whether to allow custom value in the input.
   *
   * This prevents the input from being cleared when blurred
   * and call `onSelect` with the input's value
   */
  allowCustomValue?: boolean
  /**
   * Whether to clear the input's value on escape
   */
  clearInputValueOnEsc?: boolean
  /**
   * Whether to close the menu when the input is blurred
   */
  closeOnBlur?: boolean
  /**
   * Whether to focus the input when it is mounted
   */
  autoFocus?: boolean
  /**
   * Whether to close the popup when an option is selected
   * with keyboard or pointer
   */
  closeOnSelect?: boolean | ((value: Option) => boolean)
  /**
   * Whether the popup should open on focus
   */
  openOnClick?: boolean
  /**
   * Whether the input's value should be selected
   * on focus. This is useful if the user is likely
   * to delete the entire value in the input (e.g browser search bar)
   */
  selectInputOnFocus?: boolean
  /**
   * Whether the combobox is in read-only mode
   */
  readonly?: boolean
  /**
   * Whether the combobox is required
   */
  required?: boolean
  /**
   * The initial value that shows up in the input
   */
  inputValue: string
  /**
   * The selected value for the combobox
   */
  selectedValue: string
  /**
   * The value of the option when navigating with the keyboard/pointer
   */
  navigationValue: string
  /**
   *  The input placeholder
   */
  placeholder?: string
  /**
   * Select the first option on input change
   *
   * `false` - This corresponds to a manual selection where the user
   * needs to manually navigate the options using the `ArrowUp` and `ArrowDown` keys.
   *
   * `true` - The first option will be automatically highlighted when the menu is opened.
   *
   * `inline` - The inline completion string is visually highlighted and has a selected state.
   */
  autoSelect?: boolean | "inline"
  /**
   * Function called when the input value changes
   */
  onInputValueChange?: (value: string) => string
  /**
   * Function called when an option is selected by pointer or keyboard
   */
  onSelect?: (value: string) => void
  /**
   * The `id` of the highlighted option
   */
  activeId: string | null
  /**
   * The event source for triggers highlighted option change
   */
  eventSource: "pointer" | "keyboard" | null
  /**
   * The live region for the combobox
   */
  liveRegion?: LiveRegion | null
  /**
   * The live collection of visible option nodes
   */
  childNodes?: { value: HTMLCollectionOf<HTMLElement> }
}>

export type ComboboxMachineState = {
  value: "unknown" | "focused" | "open" | "closed"
}

export const comboboxMachine = createMachine<ComboboxMachineContext, ComboboxMachineState>(
  {
    id: "combobox-machine",
    initial: "unknown",
    context: {
      uid: "combobox",
      autoSelect: true,
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
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setId", "setOwnerDocument", "setLiveRegion"],
          },
        },
      },
      open: {
        entry: ["setChildNodes", "announceNumberOfOptions"],
        activities: ["scrollOptionIntoView", "trackPointerDown"],
        on: {
          ARROW_DOWN: {
            actions: ["selectNextOptionId", "setEventSourceToKeyboard", "announceActiveOption"],
          },
          ARROW_UP: {
            actions: ["selectPrevOptionId", "setEventSourceToKeyboard", "announceActiveOption"],
          },
          ESCAPE: "closed",
          ENTER: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["setSelectedValue", "announceSelectedOption"],
            },
            {
              actions: ["setSelectedValue", "announceSelectedOption"],
            },
          ],
          TYPE: {
            actions: ["setInputValue", "selectFirstOptionId", "announceNumberOfOptions"],
          },
          OPTION_POINTEROVER: {
            actions: ["setActiveId", "setNavigationValue", "setEventSourceToPointer", "announceActiveOption"],
          },
          OPTION_CLICK: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["setSelectedValue", "announceSelectedOption", "focusInput"],
            },
            {
              actions: ["setSelectedValue", "announceSelectedOption", "focusInput"],
            },
          ],
          INPUT_BLUR: [
            {
              cond: and("allowCustomValue", "closeOnBlur"),
              target: "closed",
            },
            {
              cond: "closeOnBlur",
              target: "closed",
            },
          ],
          BUTTON_CLICK: {
            target: "closed",
            actions: "focusInput",
          },
        },
      },
      focused: {
        on: {
          INPUT_BLUR: "closed",
          INPUT_CLICK: [{ cond: "openOnClick", target: "open", actions: ["focusInput"] }, { actions: ["focusInput"] }],
          ARROW_DOWN: {
            target: "open",
            actions: ["selectFirstOptionId", "setEventSourceToKeyboard"],
          },
          ARROW_UP: {
            target: "open",
            actions: ["selectLastOptionId", "setEventSourceToKeyboard"],
          },
          TYPE: {
            target: "open",
            actions: ["setInputValue", "selectFirstOptionId", "announceNumberOfOptions"],
          },
          BUTTON_CLICK: {
            target: "open",
            actions: "focusInput",
          },
          ESCAPE: { actions: ["clearInputValue"] },
        },
      },
      closed: {
        entry: ["clearNavigationValue", "clearEventSource"],
        on: {
          INPUT_FOCUS: "focused",
          BUTTON_CLICK: {
            target: "open",
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
      closeOnSelect: (ctx) => !!ctx.closeOnSelect,
    },
    activities: {
      trackPointerDown,
      scrollOptionIntoView(ctx) {
        const { input, listbox } = getElements(ctx)
        return observeNodeAttr(input, "aria-activedescendant", () => {
          const { activeOption: opt } = getElements(ctx)
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
        ctx.doc = preserve(evt.doc)
      },
      setLiveRegion(ctx) {
        const region = new LiveRegion({ ariaLive: "assertive", doc: ctx.doc })
        ctx.liveRegion = preserve(region)
      },
      setChildNodes(ctx) {
        // We're caching the live html collection in context.childNodes
        if (ctx.childNodes) return
        const { listbox } = getElements(ctx)
        // this is a live collection of all options
        const nodes = listbox?.getElementsByClassName("option")
        ctx.childNodes = preserve({
          value: cast<HTMLCollectionOf<HTMLElement>>(nodes),
        })
      },
      setActiveId(ctx, evt) {
        ctx.activeId = evt.id
      },
      setSelectedValue(ctx, evt) {
        ctx.selectedValue = ctx.navigationValue || evt.value
        ctx.inputValue = ctx.selectedValue
      },
      setNavigationValue(ctx, evt) {
        ctx.navigationValue = evt.value
      },
      focusInput(ctx) {
        nextTick(() => {
          const { input } = getElements(ctx)
          input?.focus()
        })
      },
      setInputValue(ctx, evt) {
        ctx.inputValue = evt.value
      },
      clearInputValueValue(ctx) {
        ctx.inputValue = ""
      },
      invokeOnInputChange(ctx) {
        ctx.onInputValueChange?.(ctx.inputValue)
      },
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.selectedValue)
      },
      selectFirstOptionId(ctx) {
        nextTick(() => {
          const { first } = dom(ctx)
          if (!first) return
          ctx.activeId = first.id
          ctx.navigationValue = first.getAttribute("data-label") ?? ""
        })
      },
      selectLastOptionId(ctx) {
        nextTick(() => {
          const { last } = dom(ctx)
          if (!last) return
          ctx.activeId = last.id
          ctx.navigationValue = last.getAttribute("data-label") ?? ""
        })
      },
      selectNextOptionId(ctx) {
        const { next } = dom(ctx)
        const nextOption = next(ctx.activeId ?? "")
        if (!nextOption) return
        ctx.activeId = nextOption.id
        ctx.navigationValue = nextOption.getAttribute("data-label") ?? ""
      },
      selectPrevOptionId(ctx) {
        const options = dom(ctx)
        const prevOption = options.prev(ctx.activeId ?? "")
        if (!prevOption) return
        ctx.activeId = prevOption.id
        ctx.navigationValue = prevOption.getAttribute("data-label") ?? ""
      },
      clearNavigationValue(ctx) {
        ctx.navigationValue = ""
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
      // VoiceOver doesn't announce `aria-activedescendant`. We'll use a live-region to make it happen!
      announceActiveOption(ctx) {
        // if (!env.apple()) return
        // const { activeOption } = getElements(ctx)
        // if (!activeOption) return
        // const { label } = activeOption.dataset
        // if (label) ctx.liveRegion?.announce(label)
      },
      // Announce the number of available suggestions when it changes
      announceNumberOfOptions(ctx) {
        setTimeout(() => {
          // const count = ctx.childNodes?.value.length
          // const msg = formatMessage(count)
          ctx.liveRegion?.announce("you typed")
        })
      },
      announceSelectedOption(ctx) {
        if (!env.apple()) return
        const msg = `${ctx.selectedValue}, selected`
        ctx.liveRegion?.announce(msg)
      },
    },
  },
)

function formatMessage(count?: number) {
  let msg: string
  if (!count) {
    msg = "No results are available."
  } else {
    msg = [
      `${count} option${count === 1 ? " is" : "s are"}`,
      "available, use up and down arrow keys to navigate. Press Enter key to select.",
    ].join(" ")
  }
  return msg
}
