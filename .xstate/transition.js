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
  initial: ctx.mounted ? "entered" : "exited",
  context: {},
  on: {
    "MOUNTED.TOGGLE": {
      actions: ["togglePresence"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    exited: {
      tags: "exit",
      on: {
        MOUNT: {
          target: "pre-entering",
          actions: ["invokeOnEnter"]
        }
      }
    },
    "pre-entering": {
      tags: "exit",
      after: {
        NEXT_FRAME: "entering"
      }
    },
    entering: {
      tags: "enter",
      after: {
        ENTER_DURATION: {
          target: "entered",
          actions: ["invokeOnEntered"]
        }
      },
      on: {
        UNMOUNT: {
          target: "exited",
          actions: ["invokeOnExited"]
        }
      }
    },
    entered: {
      tags: "enter",
      on: {
        UNMOUNT: {
          target: "pre-exiting",
          actions: ["invokeOnExit"]
        }
      }
    },
    "pre-exiting": {
      tags: "exit",
      after: {
        NEXT_FRAME: "exiting"
      }
    },
    exiting: {
      tags: "exit",
      after: {
        EXIT_DURATION: {
          target: "exited",
          actions: ["invokeOnExited"]
        }
      },
      on: {
        MOUNT: {
          target: "entered",
          actions: ["invokeOnEntered"]
        }
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
  guards: {}
});