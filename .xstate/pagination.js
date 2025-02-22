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
      defaultPageSize: 10,
      siblingCount: 1,
      defaultPage: 1,
      type: "button",
      count: 1,
      ...props,
      translations: {
        rootLabel: "pagination",
        prevTriggerLabel: "previous page",
        nextTriggerLabel: "next page",
        itemLabel({
          page,
          totalPages
        }) {
          const isLastPage = totalPages > 1 && page === totalPages;
          return `${isLastPage ? "last page, " : ""}page ${page}`;
        },
        ...props.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({
    prop,
    bindable,
    getContext
  }) {
    return {
      page: bindable(() => ({
        value: prop("page"),
        defaultValue: prop("defaultPage"),
        onChange(value) {
          const context = getContext();
          prop("onPageChange")?.({
            page: value,
            pageSize: context.get("pageSize")
          });
        }
      })),
      pageSize: bindable(() => ({
        value: prop("pageSize"),
        defaultValue: prop("defaultPageSize"),
        onChange(value) {
          prop("onPageSizeChange")?.({
            pageSize: value
          });
        }
      }))
    };
  },
  watch({
    track,
    context: {
      "isValidPage": false,
      "canGoToPrevPage": false,
      "canGoToNextPage": false
    },
    action
  }) {
    track([() => context.get("pageSize")], () => {
      action(["setPageIfNeeded"]);
    });
  },
  on: {
    SET_PAGE: {
      cond: "isValidPage",
      actions: ["setPage"]
    },
    SET_PAGE_SIZE: {
      actions: ["setPageSize"]
    },
    FIRST_PAGE: {
      actions: ["goToFirstPage"]
    },
    LAST_PAGE: {
      actions: ["goToLastPage"]
    },
    PREVIOUS_PAGE: {
      cond: "canGoToPrevPage",
      actions: ["goToPrevPage"]
    },
    NEXT_PAGE: {
      cond: "canGoToNextPage",
      actions: ["goToNextPage"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    guards: {
      isValidPage: ({
        event
      }) => event.page >= 1 && event.page <= computed("totalPages"),
      isValidCount: ({
        context,
        event
      }) => context.get("page") > event.count,
      canGoToNextPage: ({
        context
      }) => context.get("page") < computed("totalPages"),
      canGoToPrevPage: ({
        context
      }) => context.get("page") > 1
    },
    actions: {
      setPage({
        context,
        event
      }) {
        const page = clampPage(event.page, computed("totalPages"));
        context.set("page", page);
      },
      setPageSize({
        context,
        event
      }) {
        context.set("pageSize", event.size);
      },
      goToFirstPage({
        context
      }) {
        context.set("page", 1);
      },
      goToLastPage({
        context
      }) {
        context.set("page", computed("totalPages"));
      },
      goToPrevPage({
        context
      }) {
        context.set("page", prev => clampPage(prev - 1, computed("totalPages")));
      },
      goToNextPage({
        context
      }) {
        context.set("page", prev => clampPage(prev + 1, computed("totalPages")));
      },
      setPageIfNeeded({
        context
      }) {
        if (computed("isValidPage")) return;
        context.set("page", 1);
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
    "isValidPage": ctx => ctx["isValidPage"],
    "canGoToPrevPage": ctx => ctx["canGoToPrevPage"],
    "canGoToNextPage": ctx => ctx["canGoToNextPage"]
  }
});