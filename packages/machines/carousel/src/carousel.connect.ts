import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, getEventTarget, isFocusable } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { ItemProps, MachineApi, MachineContext, Send, State } from "./carousel.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isPlaying = state.matches("autoplay")
  const isDragging = state.matches("dragging")

  const canScrollNext = state.context.canScrollNext
  const canScrollPrev = state.context.canScrollPrev
  const horizontal = state.context.isHorizontal

  const pageSnapPoints = Array.from(state.context.pageSnapPoints)
  const page = state.context.page
  const slidesPerPage = state.context.slidesPerPage

  const padding = state.context.padding
  const translations = state.context.translations

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
      send("AUTOPLAY.START")
    },
    pause() {
      send("AUTOPLAY.PAUSE")
    },
    isInView(index) {
      return Array.from(state.context.slidesInView).includes(index)
    },
    refresh() {
      send({ type: "SNAP.REFRESH" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        role: "region",
        "aria-roledescription": "carousel",
        "data-orientation": state.context.orientation,
        dir: state.context.dir,
        style: {
          "--slides-per-page": slidesPerPage,
          "--slide-spacing": state.context.spacing,
          "--slide-item-size":
            "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))",
        },
      })
    },

    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(state.context),
        "data-orientation": state.context.orientation,
        "data-dragging": dataAttr(isDragging),
        dir: state.context.dir,
        "aria-live": isPlaying ? "off" : "polite",
        onMouseDown(event) {
          if (!state.context.allowMouseDrag) return
          if (event.button !== 0) return
          if (event.defaultPrevented) return

          const target = getEventTarget<HTMLElement>(event)
          if (isFocusable(target) && target !== event.currentTarget) return

          event.preventDefault()
          send({ type: "DRAGGING.START" })
        },

        style: {
          display: "grid",
          gap: "var(--slide-spacing)",
          scrollSnapType: [horizontal ? "x" : "y", state.context.snapType].join(" "),
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
      const isInView = state.context.slidesInView.includes(props.index)
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, props.index),
        dir: state.context.dir,
        role: "group",
        "data-index": props.index,
        "data-inview": dataAttr(isInView),
        "aria-roledescription": "slide",
        "data-orientation": state.context.orientation,
        "aria-label": state.context.slideCount ? translations.item(props.index, state.context.slideCount) : undefined,
        "aria-hidden": ariaAttr(!isInView),
        style: {
          scrollSnapAlign: getItemSnapAlign(state.context, props),
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-orientation": state.context.orientation,
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(state.context),
        type: "button",
        tabIndex: -1,
        disabled: !canScrollPrev,
        dir: state.context.dir,
        "aria-label": translations.prevTrigger,
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "PAGE.PREV", src: "trigger" })
        },
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: state.context.dir,
        id: dom.getNextTriggerId(state.context),
        type: "button",
        tabIndex: -1,
        "aria-label": translations.nextTrigger,
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
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
        dir: state.context.dir,
        id: dom.getIndicatorGroupId(state.context),
        "data-orientation": state.context.orientation,
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
            dir: state.context.dir,
            orientation: state.context.orientation,
          })

          const exec = keyMap[key]
          exec?.(event)
        },
      })
    },

    getIndicatorProps(props) {
      return normalize.button({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        id: dom.getIndicatorId(state.context, props.index),
        type: "button",
        "data-orientation": state.context.orientation,
        "data-index": props.index,
        "data-readonly": dataAttr(props.readOnly),
        "data-current": dataAttr(props.index === state.context.page),
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
        "data-orientation": state.context.orientation,
        "aria-label": isPlaying ? translations.autoplayStop : translations.autoplayStart,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: isPlaying ? "AUTOPLAY.PAUSE" : "AUTOPLAY.START" })
        },
      })
    },
  }
}

function getItemSnapAlign(ctx: MachineContext, props: ItemProps) {
  const snapAlign = props.snapAlign ?? "start"
  if (ctx.scrollBy === "item") return snapAlign
  const perPage = Math.floor(ctx.slidesPerPage)
  const shouldSnap = (props.index + perPage) % perPage === 0
  return shouldSnap ? snapAlign : undefined
}
