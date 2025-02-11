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
      placeholder: "○",
      otp: false,
      type: "numeric",
      defaultValue: [],
      ...props,
      translations: {
        inputLabel: (index, length) => `pin code ${index + 1} of ${length}`,
        ...props.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({
    prop,
    bindable
  }) {
    return {
      value: bindable(() => ({
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        isEqual: isEqual,
        onChange(value) {
          prop("onValueChange")?.({
            value,
            valueAsString: value.join("")
          });
        }
      })),
      focusedIndex: bindable(() => ({
        defaultValue: -1
      }))
    };
  },
  entry: ["raiseInitEvent"],
  watch({
    action,
    track,
    context: {
      "hasIndex": false,
      "autoFocus": false,
      "isFinalValue": false,
      "hasValue": false,
      "hasValue": false,
      "isValueComplete": false
    }
  }) {
    track([() => context.get("focusedIndex")], () => {
      action(["focusInput", "selectInputIfNeeded"]);
    });
    track([() => context.get("value").toString()], () => {
      action(["syncInputElements", "dispatchInputEvent"]);
    });
    track([() => computed("isValueComplete")], () => {
      action(["invokeOnComplete", "blurFocusedInputIfNeeded"]);
    });
  },
  on: {
    "VALUE.SET": [{
      cond: "hasIndex",
      actions: ["setValueAtIndex"]
    }, {
      actions: ["setValue"]
    }],
    "VALUE.CLEAR": {
      actions: ["clearValue", "setFocusIndexToFirst"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "INPUT.FOCUS": {
          target: "focused",
          actions: ["setFocusedIndex"]
        },
        INIT: [{
          cond: "autoFocus",
          actions: ["setupValue", "setFocusIndexToFirst"]
        }, {
          actions: ["setupValue"]
        }]
      }
    },
    focused: {
      on: {
        "INPUT.CHANGE": [{
          cond: "isFinalValue",
          actions: ["setFocusedValue", "syncInputValue"]
        }, {
          actions: ["setFocusedValue", "setNextFocusedIndex", "syncInputValue"]
        }],
        "INPUT.PASTE": {
          actions: ["setPastedValue", "setLastValueFocusIndex"]
        },
        "INPUT.BLUR": {
          target: "idle",
          actions: ["clearFocusedIndex"]
        },
        "INPUT.DELETE": {
          cond: "hasValue",
          actions: ["clearFocusedValue"]
        },
        "INPUT.ARROW_LEFT": {
          actions: ["setPrevFocusedIndex"]
        },
        "INPUT.ARROW_RIGHT": {
          actions: ["setNextFocusedIndex"]
        },
        "INPUT.BACKSPACE": [{
          cond: "hasValue",
          actions: ["clearFocusedValue"]
        }, {
          actions: ["setPrevFocusedIndex", "clearFocusedValue"]
        }],
        "INPUT.ENTER": {
          cond: "isValueComplete",
          actions: ["requestFormSubmit"]
        },
        "VALUE.INVALID": {
          actions: ["invokeOnInvalid"]
        }
      }
    }
  },
  implementations: {
    guards: {
      autoFocus: ({
        prop
      }) => !!prop("autoFocus"),
      isValueEmpty: ({
        event
      }) => event.value === "",
      hasValue: ({
        context
      }) => context.get("value")[context.get("focusedIndex")] !== "",
      isValueComplete: ({}) => computed("isValueComplete"),
      isFinalValue: ({
        context
      }) => computed("filledValueLength") + 1 === computed("valueLength") && context.get("value").findIndex(v => v.trim() === "") === context.get("focusedIndex"),
      hasIndex: ({
        event
      }) => event.index !== undefined,
      isDisabled: ({
        prop
      }) => !!prop("disabled")
    },
    actions: {
      raiseInitEvent({
        send
      }) {
        send({
          type: "INIT"
        });
      },
      dispatchInputEvent({
        scope
      }) {
        const inputEl = dom.getHiddenInputEl(scope);
        dispatchInputValueEvent(inputEl, {
          value: computed("valueAsString")
        });
      },
      setupValue({
        context,
        scope
      }) {
        if (context.get("value").length) return;
        const inputEls = dom.getInputEls(scope);
        const emptyValues = Array.from < string > {
          length: inputEls.length
        }.fill("");
        context.set("value", emptyValues);
      },
      focusInput({
        context,
        scope
      }) {
        const focusedIndex = context.get("focusedIndex");
        if (focusedIndex === -1) return;
        dom.getInputElAtIndex(scope, focusedIndex)?.focus({
          preventScroll: true
        });
      },
      selectInputIfNeeded({
        context,
        prop,
        scope
      }) {
        const focusedIndex = context.get("focusedIndex");
        if (!prop("selectOnFocus") || focusedIndex === -1) return;
        raf(() => {
          dom.getInputElAtIndex(scope, focusedIndex)?.select();
        });
      },
      invokeOnComplete({
        context,
        prop
      }) {
        if (!computed("isValueComplete")) return;
        prop("onValueComplete")?.({
          value: Array.from(context.get("value")),
          valueAsString: computed("valueAsString")
        });
      },
      invokeOnInvalid({
        context,
        event,
        prop
      }) {
        prop("onValueInvalid")?.({
          value: event.value,
          index: context.get("focusedIndex")
        });
      },
      clearFocusedIndex({
        context
      }) {
        context.set("focusedIndex", -1);
      },
      setFocusedIndex({
        context,
        event
      }) {
        context.set("focusedIndex", event.index);
      },
      setValue({
        context,
        event
      }) {
        context.set("value", event.value);
      },
      setFocusedValue({
        context,
        event
      }) {
        const focusedValue = computed("focusedValue");
        const nextValue = getNextValue(focusedValue, event.value);
        context.set("value", prev => {
          const next = [...prev];
          next[context.get("focusedIndex")] = nextValue;
          return next;
        });
      },
      revertInputValue({
        context,
        scope
      }) {
        const inputEl = dom.getInputElAtIndex(scope, context.get("focusedIndex"));
        setElementValue(inputEl, computed("focusedValue"));
      },
      syncInputValue({
        context,
        event,
        scope
      }) {
        const value = context.get("value");
        const inputEl = dom.getInputElAtIndex(scope, event.index);
        setElementValue(inputEl, value[event.index]);
      },
      syncInputElements({
        context,
        scope
      }) {
        const inputEls = dom.getInputEls(scope);
        inputEls.forEach((inputEl, index) => {
          setElementValue(inputEl, context.get("value")[index]);
        });
      },
      setPastedValue({
        context,
        event
      }) {
        raf(() => {
          const valueAsString = computed("valueAsString");
          const focusedIndex = context.get("focusedIndex");
          const filledValueLength = computed("filledValueLength");
          const startIndex = Math.min(focusedIndex, filledValueLength);

          // keep value left of cursor
          // replace value from cursor to end with pasted text
          const left = startIndex > 0 ? valueAsString.substring(0, focusedIndex) : "";
          const right = event.value.substring(0, computed("valueLength") - startIndex);
          const value = left + right;
          context.set("value", value.split(""));
        });
      },
      setValueAtIndex({
        context,
        event
      }) {
        const nextValue = getNextValue(computed("focusedValue"), event.value);
        context.set("value", prev => {
          const next = [...prev];
          next[event.index] = nextValue;
          return next;
        });
      },
      clearValue({
        context
      }) {
        const nextValue = Array.from < string > {
          length: computed("valueLength")
        }.fill("");
        context.set("value", nextValue);
      },
      clearFocusedValue({
        context
      }) {
        const focusedIndex = context.get("focusedIndex");
        if (focusedIndex === -1) return;
        context.set("value", prev => {
          const next = [...prev];
          next[focusedIndex] = "";
          return next;
        });
      },
      setFocusIndexToFirst({
        context
      }) {
        context.set("focusedIndex", 0);
      },
      setNextFocusedIndex({
        context
      }) {
        context.set("focusedIndex", Math.min(context.get("focusedIndex") + 1, computed("valueLength") - 1));
      },
      setPrevFocusedIndex({
        context
      }) {
        context.set("focusedIndex", Math.max(context.get("focusedIndex") - 1, 0));
      },
      setLastValueFocusIndex({
        context
      }) {
        raf(() => {
          context.set("focusedIndex", Math.min(computed("filledValueLength"), computed("valueLength") - 1));
        });
      },
      blurFocusedInputIfNeeded({
        context,
        prop,
        scope
      }) {
        if (!prop("blurOnComplete")) return;
        raf(() => {
          dom.getInputElAtIndex(scope, context.get("focusedIndex"))?.blur();
        });
      },
      requestFormSubmit({
        prop,
        scope
      }) {
        if (!prop("name") || !computed("isValueComplete")) return;
        const inputEl = dom.getHiddenInputEl(scope);
        inputEl?.form?.requestSubmit();
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
    "hasIndex": ctx => ctx["hasIndex"],
    "autoFocus": ctx => ctx["autoFocus"],
    "isFinalValue": ctx => ctx["isFinalValue"],
    "hasValue": ctx => ctx["hasValue"],
    "isValueComplete": ctx => ctx["isValueComplete"]
  }
});