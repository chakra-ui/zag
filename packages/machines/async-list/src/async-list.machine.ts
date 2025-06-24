import { createMachine } from "@zag-js/core"
import { ensure, ensureProps } from "@zag-js/utils"
import type { AsyncListSchema, LoadDependency, SortDescriptor } from "./async-list.types"

export const machine = createMachine<AsyncListSchema<any, any>>({
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
      filterText: bindable<string>(() => ({
        defaultValue: prop("initialFilterText") ?? "",
      })),
      sortDescriptor: bindable<SortDescriptor | undefined>(() => ({
        defaultValue: prop("initialSortDescriptor"),
      })),
      error: bindable<any>(() => ({
        defaultValue: undefined,
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
    ABORT: {
      target: "idle",
      actions: ["cancelFetch"],
    },
    RELOAD: {
      target: "loading",
      reenter: true,
      actions: ["clearItems"],
    },
    FILTER: {
      reenter: true,
      target: "loading",
      actions: ["setFilterText"],
    },
  },

  entry: ["loadIfNeeded"],

  states: {
    idle: {
      tags: ["idle", "error"],
      on: {
        LOAD_MORE: {
          guard: "hasCursor",
          target: "loading",
        },
        SORT: [
          {
            guard: "hasSortFn",
            target: "loading",
            actions: ["performSort"],
          },
          { target: "loading" },
        ],
      },
    },
    loading: {
      tags: ["loading", "loadingMore", "sorting", "filtering"],
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
        // if (prop("dependencies") == null) return
        if (!prop("autoReload")) return
        send({ type: "RELOAD" })
      },

      performFetch({ context, prop, refs, send, event }) {
        refs.set("abort", new AbortController())
        const abort = refs.get("abort")

        context.set("error", undefined)
        const seq = refs.get("seq") + 1
        refs.set("seq", seq)

        const isLoadMore = event.type === "LOAD_MORE"

        const loadFn = prop("load")
        loadFn({
          signal: abort?.signal,
          cursor: isLoadMore ? context.get("cursor") : null,
          filterText: event.filterText ?? context.get("filterText"),
          sortDescriptor: event.sortDescriptor ?? context.get("sortDescriptor"),
        })
          .then(({ items, cursor }) => {
            if (seq !== refs.get("seq")) return // stale
            send({ type: "SUCCESS", items, cursor, append: isLoadMore })
          })
          .catch((error) => {
            if (seq !== refs.get("seq")) return // stale
            if (isAbortError(error)) return
            send({ type: "ERROR", error })
          })
      },

      performSort({ context, prop, send, event }) {
        context.set("sortDescriptor", event.sortDescriptor)
        const sortFn = prop("sort")
        ensure(sortFn, () => "[zag-js/async-list] sort is required")
        Promise.resolve(
          sortFn({
            items: context.get("items"),
            descriptor: event.sortDescriptor,
          }),
        )
          .then((r) => {
            send({ type: "SUCCESS", items: r?.items ?? [], append: false })
          })
          .catch((e) => {
            send({ type: "ERROR", error: e as Error })
          })
      },

      setFilterText({ context, event }) {
        context.set("filterText", event.filterText)
      },
      invokeOnSuccess({ prop, event }) {
        prop("onSuccess")?.({ items: event.items })
      },
      invokeOnError({ prop, event }) {
        prop("onError")?.({ error: event.error })
      },
      clearItems({ context }) {
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
      cancelFetch({ refs }) {
        const _abort = refs.get("abort")
        _abort?.abort()
        refs.set("abort", null)
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
