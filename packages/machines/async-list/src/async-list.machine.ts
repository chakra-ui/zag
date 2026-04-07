import { createMachine } from "@zag-js/core"
import { ensure, ensureProps } from "@zag-js/utils"
import type { AsyncListSchema, LoadDependency } from "./async-list.types"

export const machine = createMachine<AsyncListSchema<any, any, any, any>>({
  props({ props }) {
    ensureProps(props, ["load"], "load is required")
    return props
  },

  context({ prop, bindable }) {
    return {
      items: bindable<any[]>(() => ({
        defaultValue: prop("initialItems") ?? [],
      })),
      cursor: bindable<any>(() => ({
        defaultValue: null,
      })),
      filter: bindable<any>(() => ({
        defaultValue: prop("initialFilter"),
      })),
      sorting: bindable<any>(() => ({
        defaultValue: prop("initialSorting"),
      })),
      error: bindable<any>(() => ({
        defaultValue: undefined,
      })),
      isLoadMore: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  refs() {
    return {
      abort: null,
      seq: 0,
    }
  },

  watch({ prop, track, send }) {
    track([() => hashDeps(prop("dependencies"))], () => {
      send({ type: "RELOAD" })
    })
  },

  initialState() {
    return "idle"
  },

  on: {
    RELOAD: {
      target: "loading",
      reenter: true,
      actions: ["clearItems", "clearIsLoadMore"],
    },
  },

  entry: ["loadIfNeeded"],

  states: {
    idle: {
      on: {
        LOAD_MORE: {
          guard: "hasCursor",
          target: "loading",
          actions: ["setIsLoadMore"],
        },
        SORT: [
          {
            guard: "hasSortFn",
            target: "sorting",
            actions: ["setSorting", "clearCursor", "clearIsLoadMore", "performSort"],
          },
          {
            target: "loading",
            actions: ["setSorting", "clearCursor", "clearIsLoadMore"],
          },
        ],
        FILTER: {
          target: "loading",
          actions: ["setFilter", "clearCursor", "clearIsLoadMore"],
        },
      },
    },
    loading: {
      entry: ["performFetch"],
      exit: ["cancelFetch"],
      on: {
        SUCCESS: {
          target: "idle",
          actions: ["setItems", "setCursor", "clearError", "invokeOnSuccess"],
        },
        ERROR: {
          target: "idle",
          actions: ["setError", "invokeOnError"],
        },
        ABORT: {
          target: "idle",
          actions: ["cancelFetch"],
        },
        FILTER: {
          reenter: true,
          target: "loading",
          actions: ["setFilter", "clearCursor", "clearIsLoadMore"],
        },
      },
    },
    sorting: {
      on: {
        SUCCESS: {
          target: "idle",
          actions: ["setItems", "setCursor", "clearError", "invokeOnSuccess"],
        },
        ERROR: {
          target: "idle",
          actions: ["setError", "invokeOnError"],
        },
        ABORT: {
          target: "idle",
          actions: ["cancelSort"],
        },
        FILTER: {
          target: "loading",
          actions: ["setFilter", "clearCursor", "cancelSort", "clearIsLoadMore"],
        },
        RELOAD: {
          target: "loading",
          actions: ["clearItems", "cancelSort", "clearIsLoadMore"],
        },
        SORT: [
          {
            guard: "hasSortFn",
            target: "sorting",
            reenter: true,
            actions: ["setSorting", "clearCursor", "cancelSort", "clearIsLoadMore", "performSort"],
          },
          {
            target: "loading",
            actions: ["setSorting", "clearCursor", "cancelSort", "clearIsLoadMore"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      hasCursor({ context }) {
        return context.get("cursor") != null
      },
      hasSortFn({ prop }) {
        return prop("sort") != null
      },
    },

    actions: {
      loadIfNeeded({ prop, send }) {
        if (!prop("autoReload")) return
        send({ type: "RELOAD" })
      },

      setIsLoadMore({ context }) {
        context.set("isLoadMore", true)
      },

      clearIsLoadMore({ context }) {
        context.set("isLoadMore", false)
      },

      performFetch({ context, prop, refs, send, event }) {
        refs.set("abort", new AbortController())
        const abort = refs.get("abort")

        context.set("error", undefined)
        const seq = refs.get("seq") + 1
        refs.set("seq", seq)

        const isLoadMore = context.get("isLoadMore")

        const loadFn = prop("load")
        loadFn({
          signal: abort?.signal,
          cursor: isLoadMore ? context.get("cursor") : null,
          filter: event.filter ?? context.get("filter"),
          sorting: event.sorting ?? context.get("sorting"),
        })
          .then(({ items, cursor }) => {
            if (seq !== refs.get("seq")) return
            send({ type: "SUCCESS", items, cursor, append: isLoadMore })
          })
          .catch((error) => {
            if (seq !== refs.get("seq")) return
            if (isAbortError(error)) return
            send({ type: "ERROR", error })
          })
      },

      performSort({ context, prop, send, event, refs }) {
        const sortFn = prop("sort")
        ensure(sortFn, () => "[zag-js/async-list] sort is required")
        const currentItems = context.get("items")
        const filter = context.get("filter")

        const seq = refs.get("seq") + 1
        refs.set("seq", seq)

        Promise.resolve(
          sortFn({
            items: currentItems,
            sorting: event.sorting,
            filter,
          }),
        )
          .then((r) => {
            if (seq !== refs.get("seq")) return
            const sortedItems = r?.items ?? currentItems
            send({ type: "SUCCESS", items: sortedItems, cursor: undefined, append: false })
          })
          .catch((e) => {
            if (seq !== refs.get("seq")) return
            send({ type: "ERROR", error: e as Error })
          })
      },

      setSorting({ context, event }) {
        context.set("sorting", event.sorting)
      },

      setFilter({ context, event }) {
        context.set("filter", event.filter)
      },
      invokeOnSuccess({ prop, event }) {
        prop("onSuccess")?.({ items: event.items })
      },
      invokeOnError({ prop, event }) {
        prop("onError")?.({ error: event.error })
      },
      clearItems({ context, prop }) {
        if (prop("keepPreviousItems")) return
        context.set("items", [])
      },
      setItems({ context, event }) {
        context.set("items", (prev) => (event.append ? [...prev, ...event.items] : event.items))
      },
      setCursor({ context, event }) {
        context.set("cursor", event.cursor)
      },
      setError({ context, event }) {
        context.set("error", event.error)
      },
      clearError({ context }) {
        context.set("error", undefined)
      },
      clearCursor({ context }) {
        context.set("cursor", null)
      },
      cancelFetch({ refs }) {
        const _abort = refs.get("abort")
        _abort?.abort()
        refs.set("abort", null)
      },
      cancelSort({ refs }) {
        const seq = refs.get("seq") + 1
        refs.set("seq", seq)
      },
    },
  },
})

function isAbortError(err: unknown): err is DOMException {
  return err instanceof Error && err.name === "AbortError"
}

function hashDeps(deps: LoadDependency[] = []) {
  return deps.filter(Boolean).join(",")
}
