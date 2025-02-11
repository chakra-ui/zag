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
      activationMode: "focus",
      submitMode: "both",
      defaultValue: "",
      selectOnFocus: true,
      ...props,
      translations: {
        input: "editable input",
        edit: "edit",
        submit: "submit",
        cancel: "cancel",
        ...props.translations
      }
    };
  },
  initialState({
    prop
  }) {
    const edit = prop("edit") || prop("defaultEdit");
    return edit ? "edit" : "preview";
  },
  entry: ["focusInputIfNeeded"],
  context: {
    "isEditControlled": false,
    "isSubmitEvent": false,
    "isEditControlled": false,
    "isEditControlled": false
  },
  watch({
    track,
    action,
    context,
    prop
  }) {
    track([() => context.get("value")], () => {
      action(["syncInputValue"]);
    });
    track([() => prop("edit")], () => {
      action(["toggleEditing"]);
    });
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    preview: {
      entry: ["blurInputIfNeeded"],
      on: {
        "CONTROLLED.EDIT": {
          target: "edit",
          actions: ["setPreviousValue", "focusInput"]
        },
        EDIT: [{
          cond: "isEditControlled",
          actions: ["invokeOnEdit"]
        }, {
          target: "edit",
          actions: ["setPreviousValue", "focusInput", "invokeOnEdit"]
        }]
      }
    },
    edit: {
      effects: ["trackInteractOutside"],
      on: {
        "CONTROLLED.PREVIEW": [{
          cond: "isSubmitEvent",
          target: "preview",
          actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit"]
        }, {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel"]
        }],
        CANCEL: [{
          cond: "isEditControlled",
          actions: ["invokeOnPreview"]
        }, {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel", "invokeOnPreview"]
        }],
        SUBMIT: [{
          cond: "isEditControlled",
          actions: ["invokeOnPreview"]
        }, {
          target: "preview",
          actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit", "invokeOnPreview"]
        }]
      }
    }
  },
  implementations: {
    guards: {
      isEditControlled: ({
        prop
      }) => prop("edit") != undefined,
      isSubmitEvent: ({
        event
      }) => event.previousEvent?.type === "SUBMIT"
    },
    effects: {
      trackInteractOutside({
        send,
        scope,
        prop
      }) {
        return trackInteractOutside(dom.getInputEl(scope), {
          exclude(target) {
            const ignore = [dom.getCancelTriggerEl(scope), dom.getSubmitTriggerEl(scope)];
            return ignore.some(el => contains(el, target));
          },
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            if (event.defaultPrevented) return;
            const {
              focusable
            } = event.detail;
            send({
              type: computed("submitOnBlur") ? "SUBMIT" : "CANCEL",
              src: "interact-outside",
              focusable
            });
          }
        });
      }
    },
    actions: {
      restoreFocus({
        event,
        scope,
        prop
      }) {
        if (event.focusable) return;
        raf(() => {
          const finalEl = prop("finalFocusEl")?.() ?? dom.getEditTriggerEl(scope);
          finalEl?.focus({
            preventScroll: true
          });
        });
      },
      clearValue({
        context
      }) {
        context.set("value", "");
      },
      focusInputIfNeeded({
        action,
        prop
      }) {
        const edit = prop("edit") || prop("defaultEdit");
        if (!edit) return;
        action(["focusInput"]);
      },
      focusInput({
        scope,
        prop
      }) {
        raf(() => {
          const inputEl = dom.getInputEl(scope);
          if (!inputEl) return;
          if (prop("selectOnFocus")) {
            inputEl.select();
          } else {
            inputEl.focus({
              preventScroll: true
            });
          }
        });
      },
      invokeOnCancel({
        prop,
        context
      }) {
        const prev = context.get("previousValue");
        prop("onValueRevert")?.({
          value: prev
        });
      },
      invokeOnSubmit({
        prop,
        context
      }) {
        const value = context.get("value");
        prop("onValueCommit")?.({
          value
        });
      },
      invokeOnEdit({
        prop
      }) {
        prop("onEditChange")?.({
          edit: true
        });
      },
      invokeOnPreview({
        prop
      }) {
        prop("onEditChange")?.({
          edit: false
        });
      },
      toggleEditing({
        prop,
        send,
        event
      }) {
        send({
          type: prop("edit") ? "CONTROLLED.EDIT" : "CONTROLLED.PREVIEW",
          previousEvent: event
        });
      },
      syncInputValue({
        context,
        scope
      }) {
        const inputEl = dom.getInputEl(scope);
        if (!inputEl) return;
        setElementValue(inputEl, context.get("value"));
      },
      setValue({
        context,
        prop,
        event
      }) {
        const max = prop("maxLength");
        const current = event.value;
        const value = max != null ? current.slice(0, max) : current;
        context.set("value", value);
      },
      setPreviousValue({
        context
      }) {
        const value = context.get("value");
        context.set("previousValue", value);
      },
      revertValue({
        context
      }) {
        const value = context.get("previousValue");
        if (!value) return;
        context.set("value", value);
      },
      blurInputIfNeeded({
        scope
      }) {
        dom.getInputEl(scope)?.blur();
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
    "isEditControlled": ctx => ctx["isEditControlled"],
    "isSubmitEvent": ctx => ctx["isSubmitEvent"]
  }
});