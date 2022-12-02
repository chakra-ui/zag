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
  initial: "idle",
  context: {
    "isVirtualPointerEvent": false,
    "wasPressedDown": false,
    "cancelOnPointerExit": false
  },
  exit: ["restoreTextSelection", "removeDocumentListeners"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      entry: ["removeDocumentListeners", "resetContext", "restoreTextSelection", "resetIgnoreClick"],
      on: {
        POINTER_DOWN: [{
          cond: "isVirtualPointerEvent",
          actions: "setPointerType"
        }, {
          target: "pressed:in",
          actions: ["setPressedDown", "setPointerType", "setPointerId", "setTarget", "focusIfNeeded", "disableTextSelection", "invokeOnPressStart", "trackDocumentPointerEvents"]
        }],
        KEY_DOWN: {
          target: "pressed:in",
          actions: ["setTarget", "invokeOnPressStart", "trackDocumentKeyup"]
        },
        CLICK: {
          actions: ["focusIfNeeded", "invokeOnPressStart", "invokeOnPressUp", "invokeOnPressEnd", "resetIgnoreClick"]
        }
      }
    },
    "pressed:in": {
      tags: "pressed",
      exit: "clearPressedDown",
      entry: "preventContextMenu",
      after: {
        500: {
          cond: "wasPressedDown",
          actions: "invokeOnLongPress"
        }
      },
      on: {
        POINTER_LEAVE: [{
          cond: "cancelOnPointerExit",
          target: "idle",
          actions: "invokeOnPressEnd"
        }, {
          target: "pressed:out",
          actions: "invokeOnPressEnd"
        }],
        DOC_POINTER_UP: {
          target: "idle",
          actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress"]
        },
        DOC_KEY_UP: {
          target: "idle",
          actions: ["invokeOnPressEnd", "triggerClick"]
        },
        KEY_UP: {
          target: "idle",
          actions: "invokeOnPressUp"
        },
        DOC_POINTER_CANCEL: "idle",
        DRAG_START: "idle"
      }
    },
    "pressed:out": {
      on: {
        POINTER_ENTER: {
          target: "pressed:in",
          actions: "invokeOnPressStart"
        },
        DOC_POINTER_UP: {
          target: "idle",
          actions: "invokeOnPressEnd"
        },
        DOC_POINTER_CANCEL: "idle",
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
    "isVirtualPointerEvent": ctx => ctx["isVirtualPointerEvent"],
    "wasPressedDown": ctx => ctx["wasPressedDown"],
    "cancelOnPointerExit": ctx => ctx["cancelOnPointerExit"]
  }
});