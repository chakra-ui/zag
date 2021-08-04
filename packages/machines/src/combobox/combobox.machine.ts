import { nextTick } from "@core-foundation/utils"
import { createMachine, guards, preserve } from "@ui-machines/core"
import { WithDOM } from "../type-utils"
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
  clearInputOnEsc?: boolean
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
}>

export type ComboboxMachineState = {
  value: "unknown" | "focused" | "open" | "closed"
}

export const comboboxMachine = createMachine<
  ComboboxMachineContext,
  ComboboxMachineState
>(
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
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      open: {
        entry: ["selectFirstIfAutoSelect"],
        activities: ["scrollOptionIntoView", "observeOptionCount"],
        on: {
          ARROW_DOWN: {
            actions: "selectNextOptionId",
          },
          ARROW_UP: {
            actions: "selectPrevOptionId",
          },
          ESCAPE: {
            target: "closed",
            actions: "clearInputValue",
          },
          ENTER: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["setSelectedValue", "announceUpdate"],
            },
            {
              actions: ["setSelectedValue", "announceUpdate"],
            },
          ],
          TYPE: {
            actions: ["setInputValue"],
          },
          OPTION_POINTEROVER: {
            actions: ["setActiveId", "setNavigationValue"],
          },
          OPTION_CLICK: [
            {
              cond: "closeOnSelect",
              target: "closed",
              actions: ["setSelectedValue", "announceUpdate", "focusInput"],
            },
            {
              actions: ["setSelectedValue", "announceUpdate", "focusInput"],
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
              // actions: ["clearInputValue"],
            },
            // {
            //   actions: ["clearInputValue"],
            // },
          ],
          TOGGLE_CLICK: "closed",
        },
      },
      focused: {
        on: {
          INPUT_BLUR: "closed",
          INPUT_CLICK: [
            { cond: "openOnClick", target: "open", actions: ["focusInput"] },
            { target: "focused", actions: ["focusInput"] },
          ],
          ARROW_DOWN: {
            target: "open",
            actions: ["selectFirstOptionId"],
          },
          ARROW_UP: {
            target: "open",
            actions: ["selectLastOptionId"],
          },
          TYPE: {
            target: "open",
            actions: ["setInputValue"],
          },
          TOGGLE_POINTERDOWN: {
            target: "open",
            actions: "focusInput",
          },
        },
      },
      closed: {
        entry: ["clearNavigationValue"],
        on: {
          INPUT_FOCUS: "focused",
          TOGGLE_POINTERDOWN: {
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
      scrollOptionIntoView() {
        return () => {}
      },
      observeOptionCount() {
        return () => {}
      },
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      selectFirstIfAutoSelect(ctx) {
        if (ctx.autoSelect) {
          const { first } = dom(ctx)
          if (!first) return
          ctx.activeId = first.id
          ctx.navigationValue = first.getAttribute("data-label") ?? ""
        }
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
      clearInputValue(ctx) {
        ctx.inputValue = ""
      },
      announceUpdate(ctx) {
        console.log(ctx.navigationValue)
      },
      invokeOnInputChange(ctx) {
        ctx.onInputValueChange?.(ctx.inputValue)
      },
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.selectedValue)
      },
      selectFirstOptionId(ctx) {
        const { first } = dom(ctx)
        if (!first) return
        ctx.activeId = first.id
        ctx.navigationValue = first.getAttribute("data-label") ?? ""
      },
      selectLastOptionId(ctx) {
        const { last } = dom(ctx)
        if (!last) return
        ctx.activeId = last.id
        ctx.navigationValue = last.getAttribute("data-label") ?? ""
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
    },
  },
)
