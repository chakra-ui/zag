import { ariaAttr, dataAttr, getEventKey, getEventTarget, isFocusable } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { throttle } from "@zag-js/utils"
import { parts } from "./carousel.anatomy"
import * as dom from "./carousel.dom"
import type { CarouselApi, CarouselService } from "./carousel.types"

export function connect<T extends PropTypes>(service: CarouselService, normalize: NormalizeProps<T>): CarouselApi<T> {
  const { state, context, computed, send, scope, prop } = service

  const isPlaying = state.matches("autoplay")
  const isDragging = state.matches("dragging")

  const canScrollNext = computed("canScrollNext")
  const canScrollPrev = computed("canScrollPrev")
  const horizontal = computed("isHorizontal")

  const pageSnapPoints = Array.from(context.get("pageSnapPoints"))
  const page = context.get("page")
  const slidesPerPage = prop("slidesPerPage")

  const padding = prop("padding")
  const translations = prop("translations")

  return {
    isPlaying,
    isDragging,
    page,
    pageSnapPoints,
    canScrollNext,
    canScrollPrev,
    getProgress() {
      return page / pageSnapPoints.length
    },
    scrollToIndex(index, instant) {
      send({ type: "INDEX.SET", index, instant })
    },
    scrollTo(index, instant) {
      send({ type: "PAGE.SET", index, instant })
    },
    scrollNext(instant) {
      send({ type: "PAGE.NEXT", instant })
    },
    scrollPrev(instant) {
      send({ type: "PAGE.PREV", instant })
    },
    play() {
      send({ type: "AUTOPLAY.START" })
    },
    pause() {
      send({ type: "AUTOPLAY.PAUSE" })
    },
    isInView(index) {
      return Array.from(context.get("slidesInView")).includes(index)
    },
    refresh() {
      send({ type: "SNAP.REFRESH" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        role: "region",
        "aria-roledescription": "carousel",
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        style: {
          "--slides-per-page": slidesPerPage,
          "--slide-spacing": prop("spacing"),
          "--slide-item-size":
            "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))",
        },
      })
    },

    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(scope),
        "data-orientation": prop("orientation"),
        "data-dragging": dataAttr(isDragging),
        dir: prop("dir"),
        "aria-live": isPlaying ? "off" : "polite",
        onMouseDown(event) {
          if (!prop("allowMouseDrag")) return
          if (event.button !== 0) return
          if (event.defaultPrevented) return

          const target = getEventTarget<HTMLElement>(event)
          if (isFocusable(target) && target !== event.currentTarget) return

          event.preventDefault()
          send({ type: "DRAGGING.START" })
        },
        onWheel: throttle(() => {
          send({ type: "USER.SCROLL" })
        }, 150),
        onTouchStart() {
          send({ type: "USER.SCROLL" })
        },
        style: {
          display: "grid",
          gap: "var(--slide-spacing)",
          scrollSnapType: [horizontal ? "x" : "y", prop("snapType")].join(" "),
          gridAutoFlow: horizontal ? "column" : "row",
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
          [horizontal ? "gridAutoColumns" : "gridAutoRows"]: "var(--slide-item-size)",
          [horizontal ? "scrollPaddingInline" : "scrollPaddingBlock"]: padding,
          [horizontal ? "paddingInline" : "paddingBlock"]: padding,
          [horizontal ? "overflowX" : "overflowY"]: "auto",
        },
      })
    },

    getItemProps(props) {
      const isInView = context.get("slidesInView").includes(props.index)
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, props.index),
        dir: prop("dir"),
        role: "group",
        "data-index": props.index,
        "data-inview": dataAttr(isInView),
        "aria-roledescription": "slide",
        "data-orientation": prop("orientation"),
        "aria-label": prop("slideCount") ? translations.item(props.index, prop("slideCount")!) : undefined,
        "aria-hidden": ariaAttr(!isInView),
        style: {
          scrollSnapAlign: (() => {
            const snapAlign = props.snapAlign ?? "start"
            const slidesPerMove = prop("slidesPerMove")
            const perMove = slidesPerMove === "auto" ? Math.floor(prop("slidesPerPage")) : slidesPerMove
            const shouldSnap = (props.index + perMove) % perMove === 0
            return shouldSnap ? snapAlign : undefined
          })(),
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-orientation": prop("orientation"),
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(scope),
        type: "button",
        disabled: !canScrollPrev,
        dir: prop("dir"),
        "aria-label": translations.prevTrigger,
        "data-orientation": prop("orientation"),
        "aria-controls": dom.getItemGroupId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "PAGE.PREV", src: "trigger" })
        },
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: prop("dir"),
        id: dom.getNextTriggerId(scope),
        type: "button",
        "aria-label": translations.nextTrigger,
        "data-orientation": prop("orientation"),
        "aria-controls": dom.getItemGroupId(scope),
        disabled: !canScrollNext,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "PAGE.NEXT", src: "trigger" })
        },
      })
    },

    getIndicatorGroupProps() {
      return normalize.element({
        ...parts.indicatorGroup.attrs,
        dir: prop("dir"),
        id: dom.getIndicatorGroupId(scope),
        "data-orientation": prop("orientation"),
        onKeyDown(event) {
          if (event.defaultPrevented) return
          const src = "indicator"
          const keyMap: EventKeyMap = {
            ArrowDown(event) {
              if (horizontal) return
              send({ type: "PAGE.NEXT", src })
              event.preventDefault()
            },
            ArrowUp(event) {
              if (horizontal) return
              send({ type: "PAGE.PREV", src })
              event.preventDefault()
            },
            ArrowRight(event) {
              if (!horizontal) return
              send({ type: "PAGE.NEXT", src })
              event.preventDefault()
            },
            ArrowLeft(event) {
              if (!horizontal) return
              send({ type: "PAGE.PREV", src })
              event.preventDefault()
            },
            Home(event) {
              send({ type: "PAGE.SET", index: 0, src })
              event.preventDefault()
            },
            End(event) {
              send({ type: "PAGE.SET", index: pageSnapPoints.length - 1, src })
              event.preventDefault()
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: prop("orientation"),
          })

          const exec = keyMap[key]
          exec?.(event)
        },
      })
    },

    getIndicatorProps(props) {
      return normalize.button({
        ...parts.indicator.attrs,
        dir: prop("dir"),
        id: dom.getIndicatorId(scope, props.index),
        type: "button",
        "data-orientation": prop("orientation"),
        "data-index": props.index,
        "data-readonly": dataAttr(props.readOnly),
        "data-current": dataAttr(props.index === page),
        "aria-label": translations.indicator(props.index),
        onClick(event) {
          if (event.defaultPrevented) return
          if (props.readOnly) return
          send({ type: "PAGE.SET", index: props.index, src: "indicator" })
        },
      })
    },

    getAutoplayTriggerProps() {
      return normalize.button({
        ...parts.autoplayTrigger.attrs,
        type: "button",
        "data-orientation": prop("orientation"),
        "data-pressed": dataAttr(isPlaying),
        "aria-label": isPlaying ? translations.autoplayStop : translations.autoplayStart,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: isPlaying ? "AUTOPLAY.PAUSE" : "AUTOPLAY.START" })
        },
      })
    },
  }
}
