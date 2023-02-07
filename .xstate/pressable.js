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
    "cancelOnPointerExit": false,
    "wasPressedDown": false
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
          actions: ["focusIfNeeded", "invokeOnPressStart", "invokeOnPressEnd", "invokeOnPress", "resetIgnoreClick"]
        }
      }
    },
    "pressed:in": {
      tags: "pressed",
      entry: "preventContextMenu",
      after: {
        500: {
          cond: "wasPressedDown",
          actions: ["clearPressedDown", "invokeOnLongPress"]
        }
      },
      on: {
        POINTER_LEAVE: [{
          cond: "cancelOnPointerExit",
          target: "idle",
          actions: ["clearPressedDown", "invokeOnPressEnd"]
        }, {
          target: "pressed:out",
          actions: ["clearPressedDown", "invokeOnPressEnd"]
        }],
        DOC_POINTER_UP: [{
          cond: "wasPressedDown",
          target: "idle",
          actions: ["clearPressedDown", "invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress"]
        }, {
          target: "idle",
          actions: ["clearPressedDown", "invokeOnPressUp", "invokeOnPressEnd"]
        }],
        DOC_KEY_UP: {
          target: "idle",
          actions: ["clearPressedDown", "invokeOnPressEnd", "triggerClick"]
        },
        KEY_UP: {
          target: "idle",
          actions: ["clearPressedDown", "invokeOnPressUp"]
        },
        DOC_POINTER_CANCEL: {
          target: "idle",
          actions: "clearPressedDown"
        },
        DRAG_START: {
          target: "idle",
          actions: "clearPressedDown"
        }
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