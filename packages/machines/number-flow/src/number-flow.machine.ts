import { createMachine, type Params } from "@zag-js/core"
import { getEventTarget } from "@zag-js/dom-query"
import * as dom from "./number-flow.dom"
import type { NumberFlowSchema } from "./number-flow.types"
import { cancelScheduledWrite, scheduleWrite, trackReducedMotion } from "./utils/scheduler"
import { DIGIT_TRACK_TRANSITION } from "./number-flow.style"
import {
  computeCounters,
  getCycles,
  getPlaceOrder,
  getRenderResult,
  isDigitSegment,
  normalizeCounter,
} from "./utils/segments"
import { getSettleTimeoutMs } from "./utils/timing"

type Ctx = Params<NumberFlowSchema>

/**
 * Resolves a place's track element, refreshing the cache on a miss.
 *
 * The cache is filled by `syncTrackEls`, which runs off a `watch` on the structural key. That
 * fires on the initial key in some renderers and not others, so treating the cache as the only
 * source drops every transform write on the ones where it doesn't - the digits then sit still
 * and jump at settle. Falling back to a query keeps the cache an optimisation rather than a
 * correctness dependency, and `isConnected` drops elements a structural change replaced.
 */
function getTrackEl(params: Pick<Ctx, "refs" | "scope">, place: number): HTMLElement | undefined {
  const { refs, scope } = params
  const cache = refs.get("trackEls")

  const cached = cache.get(place)
  if (cached?.isConnected) return cached

  const el = dom.getDigitTrackEl(scope, place)
  if (el) cache.set(place, el)
  return el ?? undefined
}

/**
 * Computes the next counters and writes changed transforms through the shared scheduler.
 * `instant` (reduced-motion) skips the roll math entirely and snaps counters to rest.
 */
function writeCounters(params: Pick<Ctx, "context" | "computed" | "refs" | "prop" | "scope">, instant: boolean) {
  const { context, computed, refs, prop, scope } = params
  const result = computed("result")
  const nextValue = context.get("value")
  const prevValue = refs.get("prevValue")

  if (result.signature !== context.get("structuralKey")) {
    context.set("structuralKey", result.signature)
  }

  // Reduced motion snaps straight to rest - nothing to debounce until a real settle.
  if (instant) context.set("announcedValueText", result.valueText)

  const prevCounters = refs.get("counters")
  const cycles = getCycles(prop("continuous"))

  const nextCounters = instant
    ? new Map(
        result.segments
          .filter(isDigitSegment)
          .map((segment) => [segment.place, normalizeCounter(segment.digit, cycles)]),
      )
    : computeCounters({
        prevCounters,
        segments: result.segments,
        prevValue,
        nextValue,
        trend: prop("trend"),
        continuous: prop("continuous"),
      })

  const changedPlaces: number[] = []
  for (const [place, counter] of nextCounters) {
    if (prevCounters.has(place) && prevCounters.get(place) !== counter) {
      changedPlaces.push(place)
    }
  }

  refs.set("counters", nextCounters)
  refs.set("prevValue", nextValue)
  if (nextValue !== prevValue) refs.set("trend", nextValue > prevValue ? "up" : "down")

  if (!instant && changedPlaces.length > 0) {
    for (const place of changedPlaces) {
      getTrackEl(params, place)?.style.setProperty("will-change", "transform")
    }

    // A retarget continues the roll already in flight, so `onAnimationStart` fires once per
    // roll - on the first digit to move - and `onAnimationComplete` once on settle, with
    // every place that moved along the way. Firing per retarget would leave a burst of
    // clicks with many starts and a single complete.
    const animating = refs.get("animatingPlaces")
    if (animating.length === 0) prop("onAnimationStart")?.({ places: changedPlaces })
    refs.set("animatingPlaces", getPlaceOrder([...animating, ...changedPlaces]))

    // Digits retargeted at different moments finish at different moments, so the roll is only
    // over once every one of them has reported in. Dropping places that no longer exist keeps
    // a digit that exited mid-roll from holding the settle open until the timeout.
    const pending = new Set(changedPlaces)
    for (const place of refs.get("pendingPlaces")) {
      if (nextCounters.has(place)) pending.add(place)
    }
    refs.set("pendingPlaces", pending)
  }

  scheduleWrite(scope, () => {
    for (const place of changedPlaces) {
      const el = getTrackEl(params, place)
      if (!el) continue
      if (instant) el.style.transition = "none"
      el.style.transform = `translateY(${-nextCounters.get(place)!}lh)`
      if (instant) {
        void el.offsetHeight
        // Restore the exact declarative value - frameworks only re-apply a style property
        // when it *changes* across renders, so clearing to `""` would desync it forever.
        el.style.transition = DIGIT_TRACK_TRANSITION
      }
    }
  })
}

export const machine = createMachine<NumberFlowSchema>({
  props({ props }) {
    return {
      locale: "en-US",
      defaultValue: 0,
      trend: false,
      continuous: false,
      spinTiming: {},
      transformTiming: {},
      respectMotionPreference: true,
      live: false,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  refs() {
    return {
      counters: new Map<number, number>(),
      trackEls: new Map<number, HTMLElement>(),
      prevValue: 0,
      animatingPlaces: [],
      pendingPlaces: new Set<number>(),
      reducedMotion: false,
      trend: "none",
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable<number>(() => ({
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      structuralKey: bindable<string>(() => ({ defaultValue: "" })),
      announcedValueText: bindable<string>(() => ({ defaultValue: "" })),
    }
  },

  computed: {
    result: ({ context, prop }) =>
      getRenderResult({
        value: context.get("value"),
        locale: prop("locale"),
        formatOptions: prop("formatOptions"),
        prefix: prop("prefix"),
        suffix: prop("suffix"),
      }),
  },

  entry: ["initialize"],

  exit: ["cancelWrite"],

  effects: ["trackReducedMotionPreference"],

  watch({ context, prop, track, action, send }) {
    track(
      [
        () => context.get("value"),
        () => prop("locale"),
        () => JSON.stringify(prop("formatOptions")),
        () => prop("prefix"),
        () => prop("suffix"),
      ],
      () => {
        send({ type: "VALUE.CHANGE" })
      },
    )
    track([() => context.get("structuralKey")], () => {
      action(["syncTrackEls"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
  },

  states: {
    idle: {
      on: {
        "VALUE.CHANGE": [
          { guard: "isReducedMotionActive", actions: ["applyCountersInstant"] },
          { target: "rolling", actions: ["applyCounters"] },
        ],
      },
    },
    rolling: {
      effects: ["trackSettle"],
      on: {
        "VALUE.CHANGE": [
          { guard: "isReducedMotionActive", target: "idle", actions: ["applyCountersInstant"] },
          // Re-enter so the settle window restarts - a retarget begins a fresh transition,
          // and the previous window's timeout would otherwise cut it short mid-roll.
          { reenter: true, actions: ["applyCounters"] },
        ],
        SETTLE: {
          target: "idle",
          actions: ["normalizeCounters"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isReducedMotionActive: ({ prop, refs }) => !!prop("respectMotionPreference") && refs.get("reducedMotion"),
    },

    actions: {
      setValue({ context, event }) {
        context.set("value", event.value)
      },

      initialize({ context, computed, refs, prop }) {
        const result = computed("result")
        context.set("structuralKey", result.signature)
        context.set("announcedValueText", result.valueText)

        // Start each counter at the middle cycle (not the raw 0-9 digit) so the very first
        // roll always has headroom in both directions - see `computeCounters` (§9.7).
        const cycles = getCycles(prop("continuous"))
        const counters = new Map<number, number>()
        for (const segment of result.segments) {
          if (isDigitSegment(segment)) counters.set(segment.place, normalizeCounter(segment.digit, cycles))
        }
        refs.set("counters", counters)
        refs.set("prevValue", context.get("value"))
      },

      syncTrackEls({ scope, refs }) {
        const trackEls = new Map<number, HTMLElement>()
        for (const el of dom.getDigitTrackEls(scope)) {
          const place = Number(el.dataset.place)
          if (!Number.isNaN(place)) trackEls.set(place, el)
        }
        refs.set("trackEls", trackEls)
      },

      applyCounters(params) {
        writeCounters(params, false)
      },

      applyCountersInstant(params) {
        writeCounters(params, true)
      },

      normalizeCounters(params) {
        const { context, computed, refs, prop } = params
        context.set("announcedValueText", computed("result").valueText)

        const cycles = getCycles(prop("continuous"))
        const counters = refs.get("counters")

        const normalized = new Map<number, number>()
        for (const [place, counter] of counters) {
          normalized.set(place, normalizeCounter(counter, cycles))
        }

        for (const [place, target] of normalized) {
          const el = getTrackEl(params, place)
          if (!el) continue
          el.style.removeProperty("will-change")

          // Suppress the transition, snap to the equivalent position in the middle cycle,
          // force a flush, then restore - so the reset is visually silent (§7, §9.6). Restoring
          // to the exact declarative string (not `""`) keeps the DOM in sync with the framework's
          // style object, which only re-applies a property when its value changes across renders.
          el.style.transition = "none"
          el.style.transform = `translateY(${-target}lh)`
          void el.offsetHeight
          el.style.transition = DIGIT_TRACK_TRANSITION
        }

        refs.set("counters", normalized)
        // A settle forced by the timeout or a hidden tab suppresses transitions rather than
        // letting them end, so nothing else will report these in.
        refs.get("pendingPlaces").clear()

        const animating = refs.get("animatingPlaces")
        refs.set("animatingPlaces", [])
        if (animating.length > 0) prop("onAnimationComplete")?.({ places: animating })
      },

      cancelWrite({ scope }) {
        cancelScheduledWrite(scope)
      },
    },

    effects: {
      trackReducedMotionPreference({ refs, scope }) {
        const win = scope.getWin()
        return trackReducedMotion(win, (matches) => {
          refs.set("reducedMotion", matches)
        })
      },

      trackSettle({ refs, scope, send, prop }) {
        const win = scope.getWin()
        const doc = scope.getDoc()
        const pending = refs.get("pendingPlaces")

        if (pending.size === 0) {
          const rafId = win.requestAnimationFrame(() => send({ type: "SETTLE", src: "no-settle-target" }))
          return () => win.cancelAnimationFrame(rafId)
        }

        // `transitionend` bubbles, so one listener on the root covers every track - including
        // tracks added by a structural change after this effect started.
        const rootEl = dom.getRootEl(scope)

        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName !== "transform") return
          const target = getEventTarget<Element>(event)
          if (!dom.isDigitTrackEl(scope, target)) return
          const place = Number(target.dataset.place)
          if (Number.isNaN(place)) return
          pending.delete(place)
          if (pending.size === 0) send({ type: "SETTLE", src: "transitionend" })
        }

        const onVisibilityChange = () => {
          if (doc.visibilityState === "hidden") {
            send({ type: "SETTLE", src: "visibilitychange" })
          }
        }

        rootEl?.addEventListener("transitionend", onTransitionEnd)
        doc.addEventListener("visibilitychange", onVisibilityChange)

        const timeoutMs = getSettleTimeoutMs({
          spinDuration: prop("spinTiming")?.duration,
          stagger: prop("stagger"),
          placeCount: refs.get("counters").size,
        })
        const timeoutId = win.setTimeout(() => send({ type: "SETTLE", src: "timeout" }), timeoutMs)

        return () => {
          rootEl?.removeEventListener("transitionend", onTransitionEnd)
          doc.removeEventListener("visibilitychange", onVisibilityChange)
          win.clearTimeout(timeoutId)
        }
      },
    },
  },
})
