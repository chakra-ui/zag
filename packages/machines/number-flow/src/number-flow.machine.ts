import { createMachine, type Params } from "@zag-js/core"
import { getEventTarget } from "@zag-js/dom-query"
import * as dom from "./number-flow.dom"
import type { NumberFlowSchema } from "./number-flow.types"
import { cancelScheduledWrite, scheduleWrite, trackReducedMotion } from "./utils/scheduler"
import { getPresenceCounters, mergeSegments, settleSegments } from "./utils/presence"
import {
  computeCounters,
  getCycles,
  getPlaceOrder,
  getRenderResult,
  isDigitSegment,
  normalizeCounter,
  stableOptionsKey,
  type Segment,
} from "./utils/segments"
import { getSettleTimeoutMs, parseDurationMs } from "./utils/timing"

type Ctx = Params<NumberFlowSchema>

const render = (prop: Ctx["prop"], value: number) =>
  getRenderResult({
    value,
    locale: prop("locale"),
    formatOptions: prop("formatOptions"),
    prefix: prop("prefix"),
    suffix: prop("suffix"),
  })

// The cache is an optimisation: some renderers skip the initial `syncTrackEls`, so fall back to a query
function getTrackEl({ refs, scope }: Pick<Ctx, "refs" | "scope">, place: number): HTMLElement | undefined {
  const cache = refs.get("trackEls")
  const cached = cache.get(place)
  if (cached?.isConnected) return cached
  const el = dom.getDigitTrackEl(scope, place)
  if (el) cache.set(place, el)
  return el ?? undefined
}

function writeCounters(
  params: Pick<Ctx, "context" | "computed" | "refs" | "prop" | "scope" | "send">,
  instant: boolean,
) {
  const { context, computed, refs, prop, scope } = params
  const result = computed("result")
  const nextValue = context.get("value")
  const prevValue = refs.get("prevValue")
  const prevCounters = refs.get("counters")
  const cycles = getCycles(prop("continuous"))

  if (result.signature !== context.get("structuralKey")) context.set("structuralKey", result.signature)
  if (instant) context.set("announcedValueText", result.valueText)

  const rolledCounters = instant
    ? new Map(result.segments.filter(isDigitSegment).map((s) => [s.place, normalizeCounter(s.digit, cycles)]))
    : computeCounters({
        prevCounters,
        segments: result.segments,
        prevValue,
        nextValue,
        trend: prop("trend"),
        continuous: prop("continuous"),
      })

  const segments = instant ? settleSegments(result.segments) : mergeSegments(context.get("segments"), result.segments)
  const nextCounters = getPresenceCounters(segments, prevCounters, rolledCounters, nextValue >= prevValue ? 1 : -1)
  context.set("segments", segments)
  if (!instant) schedulePresence(params, segments)

  const changedPlaces = [...nextCounters].filter(
    ([place, c]) => prevCounters.has(place) && prevCounters.get(place) !== c,
  )
  const changed = changedPlaces.map(([place]) => place)

  refs.set("counters", nextCounters)
  refs.set("prevValue", nextValue)
  if (nextValue !== prevValue) refs.set("trend", nextValue > prevValue ? "up" : "down")

  if (!instant && changed.length > 0) {
    for (const place of changed) getTrackEl(params, place)?.style.setProperty("will-change", "transform")

    // One start per roll (retargets continue it), one complete on settle
    const animating = refs.get("animatingPlaces")
    if (animating.length === 0) prop("onAnimationStart")?.({ places: changed })
    refs.set("animatingPlaces", getPlaceOrder([...animating, ...changed]))

    // Settle once every moved digit reports in; drop places that no longer exist
    const pending = new Set(changed)
    for (const place of refs.get("pendingPlaces")) if (nextCounters.has(place)) pending.add(place)
    refs.set("pendingPlaces", pending)
  }

  scheduleWrite(scope, () => {
    for (const place of changed) {
      const el = getTrackEl(params, place)
      if (!el) continue
      const counter = nextCounters.get(place)!
      if (instant) dom.snapTrack(el, counter)
      else dom.setTrackTransform(el, counter)
    }
  })
}

// Entering segments need one painted frame at zero width; exiting ones leave on transitionend (or timeout)
function schedulePresence(
  { refs, prop, scope, send }: Pick<Ctx, "refs" | "prop" | "scope" | "send">,
  segments: Segment[],
) {
  const win = scope.getWin()

  if (segments.some((s) => s.presence === "entering")) {
    win.cancelAnimationFrame(refs.get("presenceFrame"))
    refs.set(
      "presenceFrame",
      win.requestAnimationFrame(() => {
        refs.set(
          "presenceFrame",
          win.requestAnimationFrame(() => send({ type: "PRESENCE.COMMIT" })),
        )
      }),
    )
  }

  if (segments.some((s) => s.presence === "exiting")) {
    win.clearTimeout(refs.get("presenceTimer"))
    const timeoutMs = parseDurationMs(prop("transformTiming")?.duration, 900) + 200
    refs.set(
      "presenceTimer",
      win.setTimeout(() => send({ type: "PRESENCE.EXITED" }), timeoutMs),
    )
  }
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
      presenceFrame: 0,
      presenceTimer: 0,
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
      // Seeded from props so the first (and server) render has segments
      segments: bindable<Segment[]>(() => ({
        defaultValue: render(prop, prop("value") ?? prop("defaultValue")).segments,
      })),
    }
  },

  computed: {
    result: ({ context, prop }) => render(prop, context.get("value")),
  },

  entry: ["initialize"],

  exit: ["cancelWrite", "cancelPresence"],

  effects: ["trackReducedMotionPreference", "trackPresenceExit"],

  watch({ context, prop, track, action, send }) {
    track(
      [
        () => context.get("value"),
        () => stableOptionsKey(prop("locale"), prop("formatOptions")),
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
    "PRESENCE.COMMIT": {
      actions: ["commitEntering"],
    },
    "PRESENCE.EXITED": {
      actions: ["removeExiting"],
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
          // Re-enter to restart the settle timeout for the new transition
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

        // Middle cycle, so the first roll has headroom both ways
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

        // Snap every track to the same digit in the middle cycle, invisibly
        const cycles = getCycles(prop("continuous"))
        const normalized = new Map<number, number>()
        for (const [place, counter] of refs.get("counters")) {
          const target = normalizeCounter(counter, cycles)
          normalized.set(place, target)
          const el = getTrackEl(params, place)
          if (!el) continue
          el.style.removeProperty("will-change")
          dom.snapTrack(el, target)
        }
        refs.set("counters", normalized)
        // Forced settles (timeout, hidden tab) never fire transitionend
        refs.get("pendingPlaces").clear()

        const animating = refs.get("animatingPlaces")
        refs.set("animatingPlaces", [])
        if (animating.length > 0) prop("onAnimationComplete")?.({ places: animating })
      },

      cancelWrite({ scope }) {
        cancelScheduledWrite(scope)
        cancelScheduledWrite(`${scope.id}:enter`)
      },

      cancelPresence({ refs, scope }) {
        const win = scope.getWin()
        win.cancelAnimationFrame(refs.get("presenceFrame"))
        win.clearTimeout(refs.get("presenceTimer"))
      },

      commitEntering(params) {
        const { context, refs, prop, scope } = params
        const segments = context.get("segments")
        if (!segments.some((s) => s.presence === "entering")) return

        // Roll each entering digit its last cell onto its own glyph
        const counters = refs.get("counters")
        const cycles = getCycles(prop("continuous"))
        const rolls: number[] = []
        for (const segment of segments) {
          if (segment.presence !== "entering" || !isDigitSegment(segment)) continue
          const target = normalizeCounter(segment.digit, cycles)
          if (counters.get(segment.place) === target) continue
          counters.set(segment.place, target)
          rolls.push(segment.place)
        }
        // Own key, so it can't replace a value write queued for the same frame
        scheduleWrite(`${scope.id}:enter`, () => {
          for (const place of rolls) {
            const el = getTrackEl(params, place)
            if (el) dom.setTrackTransform(el, counters.get(place)!)
          }
        })

        context.set(
          "segments",
          segments.map((s) => (s.presence === "entering" ? { ...s, presence: undefined } : s)),
        )
      },

      // Drops one exited segment by key, or all of them on timeout
      removeExiting({ context, refs, event }) {
        const segments = context.get("segments")
        const isGone = (s: Segment) => s.presence === "exiting" && (event.key == null || s.key === event.key)
        const gone = segments.filter(isGone)
        if (gone.length === 0) return
        for (const segment of gone) if (isDigitSegment(segment)) refs.get("counters").delete(segment.place)
        context.set(
          "segments",
          segments.filter((s) => !isGone(s)),
        )
      },
    },

    effects: {
      trackPresenceExit({ scope, send }) {
        const rootEl = dom.getRootEl(scope)
        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName !== "grid-template-columns") return
          const target = getEventTarget<HTMLElement>(event)
          const key = target?.hasAttribute("data-exiting") ? target.dataset.key : undefined
          if (key) send({ type: "PRESENCE.EXITED", key })
        }
        rootEl?.addEventListener("transitionend", onTransitionEnd)
        return () => rootEl?.removeEventListener("transitionend", onTransitionEnd)
      },

      trackReducedMotionPreference({ refs, scope }) {
        return trackReducedMotion(scope.getWin(), (matches) => {
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
          if (doc.visibilityState === "hidden") send({ type: "SETTLE", src: "visibilitychange" })
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
