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
  props({
    props
  }) {
    return {
      defaultPressed: false,
      ...props
    };
  },
  context({
    prop,
    bindable
  }) {
    return {
      pressed: bindable < boolean > (() => ({
        value: prop("pressed"),
        defaultValue: prop("defaultPressed"),
        onChange(value) {
          prop("onPressedChange")?.(value);
        }
      }))
    };
  },
  initialState() {
    return "idle";
  },
  on: {
    "PRESS.TOGGLE": {
      actions: ["togglePressed"]
    },
    "PRESS.SET": {
      actions: ["setPressed"]
    },
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    actions: {
      togglePressed({
        context: {}
      }) {
        context.set("pressed", !context.get("pressed"));
      },
      setPressed({
        context,
        event
      }) {
        context.set("pressed", event.value);
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