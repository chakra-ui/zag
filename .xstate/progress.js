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
    const min = props.min ?? 0;
    const max = props.max ?? 100;
    return {
      ...props,
      max,
      min,
      defaultValue: props.defaultValue ?? midValue(min, max),
      orientation: "horizontal",
      translations: {
        value: ({
          percent
        }) => percent === -1 ? "loading..." : `${percent} percent`,
        ...props.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  entry: ["validateContext"],
  context({
    bindable,
    prop
  }) {
    return {
      value: bindable < number | null > (() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({
            value
          });
        }
      }))
    };
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "VALUE.SET": {
          actions: ["setValue"]
        }
      }
    }
  },
  implementations: {
    actions: {
      setValue: ({
        context: {},
        event,
        prop
      }) => {
        const value = event.value === null ? null : Math.max(0, Math.min(event.value, prop("max")));
        context.set("value", value);
      },
      validateContext: ({
        context,
        prop
      }) => {
        const max = prop("max");
        const min = prop("min");
        const value = context.get("value");
        if (value == null) return;
        if (!isValidNumber(max)) {
          throw new Error(`[progress] The max value passed \`${max}\` is not a valid number`);
        }
        if (!isValidMax(value, max)) {
          throw new Error(`[progress] The value passed \`${value}\` exceeds the max value \`${max}\``);
        }
        if (!isValidMin(value, min)) {
          throw new Error(`[progress] The value passed \`${value}\` exceeds the min value \`${min}\``);
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