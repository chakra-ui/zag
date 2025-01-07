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
  id: "qr-code",
  initial: "idle",
  context: {},
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "DOWNLOAD_TRIGGER.CLICK": {
      actions: ["downloadQrCode"]
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