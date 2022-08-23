"use strict";

var _xstate = require("xstate");

const {
  actions,
  createMachine,
  assign
} = _xstate;
const {
  choose
} = actions;
const fetchMachine = createMachine({
  id: "pressable",
  initial: "unknown",
  context: {
    "isValidTarget && isLeftButton && isVirtualPointerEvent": false,
    "isValidTarget && isLeftButton": false,
    "isValidTarget && isValidKeyboardEvent": false,
    "shouldTriggerKeyboardClick": false,
    "isLeftButton": false,
    "!isOverTarget && cancelOnPointerExit": false,
    "!isOverTarget": false,
    "isOverTarget": false,
    "isOverTarget": false
  },
  exit: ["restoreTextSelectionIfNeeded", "removeDocumentListeners"],
  activities: ["attachElementListeners"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: "idle"
      }
    },
    idle: {
      tags: ["unpressed"],
      entry: ["removeDocumentListeners", "resetContext", "restoreTextSelectionIfNeeded"],
      on: {
        POINTER_DOWN: [{
          cond: "isValidTarget && isLeftButton && isVirtualPointerEvent",
          actions: "setPointerToVirtual"
        }, {
          cond: "isValidTarget && isLeftButton",
          target: "pressed:in",
          actions: ["setPointerType", "setPointerId", "setPressTarget", "focusIfNeeded", "invokeOnPressStart", "preventDefaultIfNeeded", "disableTextSelectionIfNeeded", "attachDocumentListeners"]
        }],
        KEYDOWN: {
          cond: "isValidTarget && isValidKeyboardEvent",
          target: "pressed:in",
          actions: ["setPressTarget", "invokeOnPressStart"]
        },
        CLICK: [{
          cond: "shouldTriggerKeyboardClick",
          actions: ["preventDefaultIfNeeded", "focusIfNeeded", "invokeOnPressStart", "invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress", "resetIgnoreClick"]
        }, {
          actions: ["preventDefaultIfNeeded", "resetIgnoreClick"]
        }],
        MOUSE_DOWN: {
          cond: "isLeftButton",
          actions: "preventDefaultIfNeeded"
        }
      }
    },
    "pressed:in": {
      tags: ["pressed"],
      on: {
        POINTER_MOVE: [{
          cond: "!isOverTarget && cancelOnPointerExit",
          target: "idle",
          actions: "invokeOnPressEnd"
        }, {
          cond: "!isOverTarget",
          target: "pressed:out",
          actions: "invokeOnPressEnd"
        }],
        POINTER_UP: [{
          cond: "isOverTarget",
          target: "idle",
          actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress"]
        }, {
          target: "idle",
          actions: ["invokeOnPressEnd"]
        }],
        POINTER_CANCEL: "idle",
        KEYUP: {
          target: "idle",
          actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress", "clickIfNeeded"]
        },
        DRAG_START: "idle"
      },
      after: {
        500: {
          actions: "invokeOnLongPress"
        }
      }
    },
    "pressed:out": {
      tags: ["pressed"],
      on: {
        POINTER_MOVE: {
          cond: "isOverTarget",
          target: "pressed:in",
          actions: ["invokeOnPressStart"]
        },
        POINTER_UP: {
          target: "idle",
          actions: "invokeOnPressEnd"
        },
        POINTER_CANCEL: "idle",
        DRAG_START: "idle"
      }
    }
  }
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "isValidTarget && isLeftButton && isVirtualPointerEvent": ctx => ctx["isValidTarget && isLeftButton && isVirtualPointerEvent"],
    "isValidTarget && isLeftButton": ctx => ctx["isValidTarget && isLeftButton"],
    "isValidTarget && isValidKeyboardEvent": ctx => ctx["isValidTarget && isValidKeyboardEvent"],
    "shouldTriggerKeyboardClick": ctx => ctx["shouldTriggerKeyboardClick"],
    "isLeftButton": ctx => ctx["isLeftButton"],
    "!isOverTarget && cancelOnPointerExit": ctx => ctx["!isOverTarget && cancelOnPointerExit"],
    "!isOverTarget": ctx => ctx["!isOverTarget"],
    "isOverTarget": ctx => ctx["isOverTarget"]
  }
});