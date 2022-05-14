"use strict"

var _xstate = require("xstate")

const { actions, createMachine, assign } = _xstate
const { choose } = actions
const fetchMachine = createMachine(
  {
    id: "combobox",
    initial: "unknown",
    context: {
      focusOnClear: false,
      autoFocus: false,
      openOnClick: false,
      "isCustomValue && !allowCustomValue": false,
      autoComplete: false,
      autoComplete: false,
      "isOptionFocused && autoComplete": false,
      isOptionFocused: false,
      autoHighlight: false,
      autoComplete: false,
      "autoComplete && isLastOptionFocused": false,
      "autoComplete && isFirstOptionFocused": false,
      selectOnTab: false,
      autoComplete: false,
      autoComplete: false,
    },

    onEvent(ctx, evt) {
      ctx.isKeyboardEvent = /(ARROW_UP|ARROW_DOWN|HOME|END)/.test(evt.type)
    },

    exit: "removeLiveRegion",
    on: {
      SET_VALUE: {
        actions: ["setInputValue", "setSelectedValue"],
      },
      CLEAR_VALUE: [
        {
          cond: "focusOnClear",
          target: "focused",
          actions: "clearInputValue",
        },
        {
          actions: "clearInputValue",
        },
      ],
      UPDATE_CONTEXT: {
        actions: "updateContext",
      },
    },
    states: {
      unknown: {
        tags: ["idle"],
        on: {
          SETUP: [
            {
              cond: "autoFocus",
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
        entry: ["scrollToTop", "clearFocusedOption", "clearPointerdownNode"],
        on: {
          CLICK_BUTTON: {
            target: "interacting",
            actions: ["focusInput", "invokeOnOpen"],
          },
          POINTER_DOWN: {
            cond: "openOnClick",
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
            cond: "isCustomValue && !allowCustomValue",
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
              cond: "autoComplete",
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
              cond: "autoComplete",
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
          "trackPointerDown",
          "scrollOptionIntoView",
          "computePlacement",
          "trackOptionNodes",
          "ariaHideOutside",
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
              cond: "isOptionFocused && autoComplete",
              target: "focused",
              actions: "selectActiveOption",
            },
            {
              cond: "isOptionFocused",
              target: "focused",
              actions: "selectOption",
            },
          ],
          CHANGE: [
            {
              cond: "autoHighlight",
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
              cond: "autoComplete",
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
        activities: ["scrollOptionIntoView", "trackPointerDown", "computePlacement", "ariaHideOutside"],
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
              cond: "autoComplete && isLastOptionFocused",
              actions: ["clearFocusedOption", "scrollToTop"],
            },
            {
              actions: "focusNextOption",
            },
          ],
          ARROW_UP: [
            {
              cond: "autoComplete && isFirstOptionFocused",
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
            cond: "selectOnTab",
            target: "idle",
            actions: ["selectOption", "invokeOnClose"],
          },
          ENTER: {
            target: "focused",
            actions: ["selectOption", "invokeOnClose"],
          },
          CHANGE: [
            {
              cond: "autoComplete",
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
              cond: "autoComplete",
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
    actions: {
      updateContext: assign((context, event) => {
        return {
          [event.contextKey]: true,
        }
      }),
    },
    guards: {
      focusOnClear: (ctx) => ctx["focusOnClear"],
      autoFocus: (ctx) => ctx["autoFocus"],
      openOnClick: (ctx) => ctx["openOnClick"],
      "isCustomValue && !allowCustomValue": (ctx) => ctx["isCustomValue && !allowCustomValue"],
      autoComplete: (ctx) => ctx["autoComplete"],
      "isOptionFocused && autoComplete": (ctx) => ctx["isOptionFocused && autoComplete"],
      isOptionFocused: (ctx) => ctx["isOptionFocused"],
      autoHighlight: (ctx) => ctx["autoHighlight"],
      "autoComplete && isLastOptionFocused": (ctx) => ctx["autoComplete && isLastOptionFocused"],
      "autoComplete && isFirstOptionFocused": (ctx) => ctx["autoComplete && isFirstOptionFocused"],
      selectOnTab: (ctx) => ctx["selectOnTab"],
    },
  },
)
