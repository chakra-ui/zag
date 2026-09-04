import type { CollectionItem, ListCollection } from "@zag-js/collection"
import { createMachine, type BindableContext, type BindableRefs, type PropFn, type Scope } from "@zag-js/core"
import {
  getByTypeahead,
  markAsInternalChangeEvent,
  raf,
  setElementValue,
  trackFormControl,
  trackPointerMove,
} from "@zag-js/dom-query"
import { collection } from "./wheel-picker.collection"
import * as dom from "./wheel-picker.dom"
import type { WheelPickerSchema } from "./wheel-picker.types"
import {
  DRAG_THRESHOLD,
  MAX_VELOCITY,
  OVERSCROLL_RESISTANCE,
  WHEEL_THROTTLE,
  clamp,
  findItemIndex,
  getClickedStep,
  getExpandedItems,
  getInertiaTarget,
  getStepDuration,
  getWheelGeometry,
  normalizeScroll,
  resolveEnabledIndex,
} from "./wheel-picker.utils"

function getItems<T extends CollectionItem>(
  itemCollection: ListCollection<T>,
  infinite: boolean,
  visibleCount: number,
) {
  return getExpandedItems(itemCollection.items, infinite, visibleCount)
}

export const machine = createMachine<WheelPickerSchema>({
  props({ props }) {
    const itemCollection = props.collection ?? collection.empty()
    const defaultValue = props.defaultValue ?? itemCollection.firstValue

    return {
      dir: "ltr",
      dragSensitivity: 3,
      infinite: false,
      optionItemHeight: 30,
      scrollSensitivity: 5,
      visibleCount: 20,
      ...props,
      collection: itemCollection,
      defaultValue,
    }
  },

  context({ bindable, prop }) {
    const value = prop("value") ?? prop("defaultValue")

    return {
      fieldsetDisabled: bindable(() => ({ defaultValue: false })),
      focused: bindable(() => ({ defaultValue: false })),
      index: bindable(() => ({
        defaultValue: Math.max(0, prop("collection").indexOf(value ?? null)),
      })),
      value: bindable<string | null>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value, item: prop("collection").find(value) })
        },
      })),
    }
  },

  refs() {
    return {
      drag: {
        moved: false,
        samples: [],
        startScroll: 0,
        startY: 0,
      },
      lastWheelTime: -Infinity,
      scrollDirection: 1,
      scrollDuration: 0,
      scrollPosition: 0,
      scrollTarget: 0,
      typeahead: { ...getByTypeahead.defaultOptions },
    }
  },

  computed: {
    interactive: ({ prop, context }) => !(prop("disabled") || context.get("fieldsetDisabled") || prop("readOnly")),
  },

  entry: ["syncValueFromCollection", "syncScrollPosition", "syncSelectElement"],

  effects: ["trackFormControlState"],

  watch({ track, action, context, prop }) {
    track([() => context.get("value")], () => {
      action(["syncScrollPosition", "syncSelectElement", "dispatchChangeEvent"])
    })

    track([() => prop("collection").toString()], () => {
      action(["syncValueFromCollection", "syncScrollPosition", "syncSelectElement"])
    })

    track([() => prop("infinite"), () => prop("optionItemHeight"), () => prop("visibleCount")], () => {
      action(["syncScrollPosition"])
    })
  },

  initialState() {
    return "idle"
  },

  on: {
    "CONTROL.FOCUS": {
      actions: ["setFocused"],
    },
    "CONTROL.BLUR": {
      actions: ["clearFocused", "clearTypeahead"],
    },
    "CONTROL.POINTER_DOWN": {
      guard: "canInteract",
      target: "dragging",
      reenter: true,
      actions: ["startDragging", "focusControl"],
    },
    "CONTROL.WHEEL": {
      guard: "canScrollByWheel",
      target: "scrolling",
      reenter: true,
      actions: ["prepareWheelScroll"],
    },
    "CONTROL.STEP": {
      guard: "canInteract",
      target: "scrolling",
      reenter: true,
      actions: ["prepareStepScroll"],
    },
    "CONTROL.HOME": {
      guard: "canJumpToBoundary",
      target: "scrolling",
      reenter: true,
      actions: ["prepareFirstScroll"],
    },
    "CONTROL.END": {
      guard: "canJumpToBoundary",
      target: "scrolling",
      reenter: true,
      actions: ["prepareLastScroll"],
    },
    "CONTROL.TYPEAHEAD": {
      guard: "canInteract",
      target: "scrolling",
      reenter: true,
      actions: ["prepareTypeaheadScroll"],
    },
    "VALUE.SET": {
      target: "idle",
      actions: ["setValue", "syncScrollPosition"],
    },
    "INDEX.SCROLL_TO": {
      guard: "hasItems",
      target: "scrolling",
      reenter: true,
      actions: ["prepareIndexScroll"],
    },
  },

  states: {
    idle: {},

    dragging: {
      effects: ["trackPointerMove"],
      on: {
        "POINTER.MOVE": {
          actions: ["updateDragScroll"],
        },
        "POINTER.UP": {
          target: "scrolling",
          actions: ["prepareDragEndScroll"],
        },
      },
    },

    scrolling: {
      effects: ["animateScroll"],
      on: {
        "SCROLL.END": {
          target: "idle",
          actions: ["commitScroll"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasItems({ prop }) {
        return prop("collection").size > 0
      },
      canInteract({ computed, prop }) {
        return computed("interactive") && prop("collection").size > 0
      },
      canJumpToBoundary({ computed, prop }) {
        return computed("interactive") && !prop("infinite") && prop("collection").size > 0
      },
      canScrollByWheel({ computed, prop, refs, event }) {
        if (!computed("interactive") || prop("collection").size === 0 || !event.deltaY) return false
        return event.timestamp - refs.get("lastWheelTime") >= WHEEL_THROTTLE
      },
    },

    effects: {
      trackPointerMove({ scope, send }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove({ point, event }) {
            if (event.cancelable) event.preventDefault()
            send({ type: "POINTER.MOVE", point, timestamp: event.timeStamp })
          },
          onPointerUp({ point, event }) {
            send({ type: "POINTER.UP", point, timestamp: event.timeStamp })
          },
        })
      },

      animateScroll({ scope, refs, prop, send }) {
        const win = scope.getWin()
        const start = refs.get("scrollPosition")
        const target = refs.get("scrollTarget")
        const reduceMotion = win.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        const duration = reduceMotion ? 0 : refs.get("scrollDuration")

        if (start === target || duration === 0) {
          refs.set("scrollPosition", applyScroll(scope, prop, target))
          const timer = win.setTimeout(() => send({ type: "SCROLL.END" }), 0)
          return () => win.clearTimeout(timer)
        }

        const startTime = win.performance.now()
        const distance = target - start
        let frameId = 0

        const tick = (time: number) => {
          const progress = Math.min((time - startTime) / duration, 1)
          const eased = Math.pow(progress - 1, 3) + 1
          refs.set("scrollPosition", applyScroll(scope, prop, start + eased * distance))

          if (progress < 1) {
            frameId = win.requestAnimationFrame(tick)
          } else {
            send({ type: "SCROLL.END" })
          }
        }

        frameId = win.requestAnimationFrame(tick)
        return () => win.cancelAnimationFrame(frameId)
      },

      trackFormControlState({ context, scope }) {
        return trackFormControl(dom.getHiddenSelectEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", context.initial("value"))
          },
        })
      },
    },

    actions: {
      setFocused({ context }) {
        context.set("focused", true)
      },
      clearFocused({ context }) {
        context.set("focused", false)
      },
      clearTypeahead({ refs }) {
        const typeahead = refs.get("typeahead")
        clearTimeout(typeahead.timer)
        typeahead.keysSoFar = ""
        typeahead.timer = -1
      },
      focusControl({ scope }) {
        dom.getControlEl(scope)?.focus({ preventScroll: true })
      },
      startDragging({ refs, event }) {
        const scrollPosition = refs.get("scrollPosition")
        refs.set("drag", {
          moved: false,
          samples: [{ time: event.timestamp, y: event.point.y }],
          startScroll: scrollPosition,
          startY: event.point.y,
        })
      },
      updateDragScroll({ refs, event, prop, scope }) {
        const drag = refs.get("drag")
        const itemHeight = Math.max(1, prop("optionItemHeight"))
        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        const delta = (drag.startY - event.point.y) / itemHeight
        let nextScroll = drag.startScroll + delta

        if (prop("infinite")) {
          nextScroll = normalizeScroll(nextScroll, items.length)
        } else {
          const maxIndex = Math.max(0, items.length - 1)
          if (nextScroll < 0) nextScroll *= OVERSCROLL_RESISTANCE
          if (nextScroll > maxIndex) nextScroll = maxIndex + (nextScroll - maxIndex) * OVERSCROLL_RESISTANCE
        }

        const samples = [...drag.samples, { time: event.timestamp, y: event.point.y }].slice(-5)
        refs.set("drag", {
          ...drag,
          moved: drag.moved || Math.abs(event.point.y - drag.startY) > DRAG_THRESHOLD,
          samples,
        })
        refs.set("scrollPosition", applyScroll(scope, prop, nextScroll))
      },
      prepareDragEndScroll({ refs, event, prop, scope }) {
        const drag = refs.get("drag")
        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        const current = refs.get("scrollPosition")

        if (!drag.moved) {
          const controlEl = dom.getControlEl(scope)
          const geometry = getWheelGeometry(prop("visibleCount"), prop("optionItemHeight"))
          const step = controlEl
            ? getClickedStep(event.point.y, controlEl.getBoundingClientRect().top, geometry, prop("optionItemHeight"))
            : 0

          const targetIndex = prop("infinite")
            ? normalizeScroll(Math.round(current + step), items.length)
            : clamp(Math.round(current + step), 0, items.length - 1)
          if (prop("collection").getItemDisabled(items[targetIndex] ?? null)) {
            prepareTarget(refs, prop, current, refs.get("scrollDirection"), 0)
            return
          }

          prepareStep(refs, prop, current, step)
          return
        }

        const samples = [...drag.samples, { time: event.timestamp, y: event.point.y }].slice(-5)
        const latest = samples.at(-1)
        const previous = samples.at(-2)
        let velocity = 0

        if (latest && previous && latest.time - previous.time > 0 && event.timestamp - latest.time < 100) {
          velocity =
            (((previous.y - latest.y) / Math.max(1, prop("optionItemHeight"))) * 1000) / (latest.time - previous.time)
          velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY)
        }

        const direction = velocity === 0 ? refs.get("scrollDirection") : velocity > 0 ? 1 : -1
        const inertia = getInertiaTarget({
          current,
          dragSensitivity: prop("dragSensitivity"),
          infinite: prop("infinite"),
          itemCount: items.length,
          velocity,
        })

        prepareTarget(refs, prop, inertia.target, direction, inertia.duration)
      },
      prepareWheelScroll({ refs, event, prop }) {
        refs.set("lastWheelTime", event.timestamp)
        prepareStep(refs, prop, refs.get("scrollPosition"), event.deltaY > 0 ? 1 : -1)
      },
      prepareStepScroll({ refs, event, prop }) {
        prepareStep(refs, prop, refs.get("scrollPosition"), event.step)
      },
      prepareFirstScroll({ refs, prop }) {
        prepareTarget(refs, prop, 0, 1)
      },
      prepareLastScroll({ refs, prop }) {
        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        prepareTarget(refs, prop, items.length - 1, -1)
      },
      prepareIndexScroll({ refs, event, prop }) {
        const direction = event.index >= refs.get("scrollPosition") ? 1 : -1
        prepareTarget(refs, prop, event.index, direction)
      },
      prepareTypeaheadScroll({ context, refs, event, prop }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("value"),
        })
        if (value == null) {
          prepareTarget(refs, prop, refs.get("scrollPosition"), refs.get("scrollDirection"), 0)
          return
        }

        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        const index = findItemIndex(items, prop("collection"), value)
        const direction = index >= refs.get("scrollPosition") ? 1 : -1
        prepareTarget(refs, prop, index, direction)
      },
      commitScroll({ context, refs, prop, scope }) {
        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        if (items.length === 0) return

        const normalizedIndex = prop("infinite")
          ? normalizeScroll(Math.round(refs.get("scrollTarget")), items.length)
          : clamp(Math.round(refs.get("scrollTarget")), 0, items.length - 1)
        const item = items[normalizedIndex] ?? null
        const value = prop("collection").getItemValue(item)
        if (value == null) return

        refs.set("scrollPosition", applyScroll(scope, prop, normalizedIndex))
        context.set("index", normalizedIndex)
        context.set("value", value)
        prop("onValueChangeEnd")?.({ value, item })

        const effectiveValue = context.get("value")
        if (effectiveValue !== value) syncScrollPosition(context, refs, prop, scope)
      },
      setValue({ context, refs, event, prop, scope }) {
        const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
        if (event.value == null) {
          context.set("value", null)
          context.set("index", 0)
          refs.set("scrollPosition", applyScroll(scope, prop, 0))
          return
        }

        const index = findItemIndex(items, prop("collection"), event.value)
        if (index === -1) return

        const resolvedIndex = resolveEnabledIndex(index, 1, items, prop("infinite"), prop("collection"))
        if (resolvedIndex === -1) return

        const item = items[resolvedIndex] ?? null
        const value = prop("collection").getItemValue(item)
        if (value == null) return

        context.set("value", value)
        context.set("index", resolvedIndex)
        refs.set("scrollPosition", applyScroll(scope, prop, resolvedIndex))
      },
      syncValueFromCollection({ context, prop }) {
        const value = context.get("value")
        const item = prop("collection").find(value)
        if (item && !prop("collection").getItemDisabled(item)) return
        context.set("value", prop("collection").firstValue)
      },
      syncScrollPosition({ context, refs, prop, scope }) {
        syncScrollPosition(context, refs, prop, scope)
      },
      syncSelectElement({ context, scope }) {
        const selectEl = dom.getHiddenSelectEl(scope)
        if (!selectEl) return
        const value = context.get("value")
        if (value == null) {
          selectEl.selectedIndex = -1
        } else {
          setElementValue(selectEl, value)
        }
      },
      dispatchChangeEvent({ scope }) {
        queueMicrotask(() => {
          const selectEl = dom.getHiddenSelectEl(scope)
          if (!selectEl) return
          const event = new (scope.getWin().Event)("change", { bubbles: true, composed: true })
          selectEl.dispatchEvent(markAsInternalChangeEvent(event))
        })
      },
    },
  },
})

type PickerContext = BindableContext<WheelPickerSchema>
type PickerProp = PropFn<WheelPickerSchema>
type PickerRefs = BindableRefs<WheelPickerSchema>

function prepareStep(refs: PickerRefs, prop: PickerProp, current: number, step: number) {
  const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
  if (items.length === 0 || step === 0) {
    prepareTarget(refs, prop, current, refs.get("scrollDirection"), 0)
    return
  }

  const direction = step > 0 ? 1 : -1
  let target = Math.round(current + step)
  if (!prop("infinite")) target = clamp(target, 0, items.length - 1)
  prepareTarget(refs, prop, target, direction)
}

function prepareTarget(refs: PickerRefs, prop: PickerProp, target: number, direction: 1 | -1, duration?: number) {
  const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
  const resolvedIndex = resolveEnabledIndex(target, direction, items, prop("infinite"), prop("collection"))
  const current = refs.get("scrollPosition")
  let resolvedTarget = resolvedIndex === -1 ? current : resolvedIndex

  if (resolvedIndex !== -1 && prop("infinite")) {
    const targetIndex = normalizeScroll(target, items.length)
    let offset = resolvedIndex - targetIndex
    if (direction === 1 && offset < 0) offset += items.length
    if (direction === -1 && offset > 0) offset -= items.length
    resolvedTarget = target + offset
  }

  refs.set("scrollDirection", direction)
  refs.set("scrollTarget", resolvedTarget)
  refs.set("scrollDuration", duration ?? getStepDuration(Math.abs(resolvedTarget - current), prop("scrollSensitivity")))
}

function syncScrollPosition(context: PickerContext, refs: PickerRefs, prop: PickerProp, scope: Scope) {
  const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
  const index = findItemIndex(items, prop("collection"), context.get("value"))
  const resolvedIndex = resolveEnabledIndex(index === -1 ? 0 : index, 1, items, prop("infinite"), prop("collection"))
  const nextIndex = Math.max(0, resolvedIndex)

  context.set("index", nextIndex)
  refs.set("scrollPosition", nextIndex)
  refs.set("scrollTarget", nextIndex)
  raf(() => applyScroll(scope, prop, nextIndex))
}

function applyScroll(scope: Scope, prop: PickerProp, scroll: number) {
  const items = getItems(prop("collection"), prop("infinite"), prop("visibleCount"))
  if (items.length === 0) return 0

  const geometry = getWheelGeometry(prop("visibleCount"), prop("optionItemHeight"))
  const normalizedScroll = prop("infinite") ? normalizeScroll(scroll, items.length) : scroll
  const itemGroupEl = dom.getItemGroupEl(scope)

  if (itemGroupEl) {
    itemGroupEl.style.transform = `translateZ(${-geometry.radius}px) rotateX(${geometry.itemAngle * normalizedScroll}deg)`

    for (const itemEl of dom.getItemEls(scope)) {
      const index = Number(itemEl.dataset.index)
      itemEl.style.visibility = Math.abs(index - normalizedScroll) > geometry.quarterCount ? "hidden" : "visible"
    }
  }

  const highlightItemGroupEl = dom.getHighlightItemGroupEl(scope)
  if (highlightItemGroupEl) {
    highlightItemGroupEl.style.transform = `translateY(${-normalizedScroll * prop("optionItemHeight")}px)`
  }

  return normalizedScroll
}
