import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./carousel.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const canScrollNext = state.context.canScrollNext
  const canScrollPrev = state.context.canScrollPrev
  const horizontal = state.context.isHorizontal
  const slidesPerView = state.context.slidesPerView
  const padding = state.context.padding
  const scrollBy = state.context.scrollBy

  const autoPlaying = state.matches("autoplay")

  function getItemState(props: ItemProps): ItemState {
    const index = state.context.index
    const slidesInView = state.context.views[index] ?? []
    return {
      current: props.index === index && slidesPerView === 1,
      next: props.index === index + 1,
      previous: props.index === index - 1,
      inView: slidesInView.includes(props.index),
      valueText: `slide ${props.index + 1}`,
    }
  }

  return {
    index: state.context.index,
    views: state.context.views.map((_, index) => ({ index })),
    autoPlaying,
    canScrollNext,
    canScrollPrev,
    scrollTo(index) {
      send({ type: "GOTO", index })
    },
    scrollToNext() {
      send("NEXT")
    },
    scrollToPrevious() {
      send("PREV")
    },
    play() {
      send("PLAY")
    },
    pause() {
      send("PAUSE")
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        role: "region",
        "aria-roledescription": "carousel",
        "data-orientation": state.context.orientation,
        "data-loaded": dataAttr(state.context.views.length > 0),
        dir: state.context.dir,
        "aria-label": "Carousel",
        style: {
          "--slides-per-view": slidesPerView,
          "--slide-spacing": state.context.spacing,
          "--slide-item-size":
            "calc(100% / var(--slides-per-view) - var(--slide-spacing) * (var(--slides-per-view) - 1) / var(--slides-per-view))",
        },
      })
    },

    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(state.context),
        "data-orientation": state.context.orientation,
        "data-loaded": dataAttr(state.context.views.length > 0),
        dir: state.context.dir,
        tabIndex: 0,
        onMouseDown(event) {
          if (event.button !== 0) return
          if (event.defaultPrevented) return
          if (!state.context.draggable) return
          event.preventDefault()
          send({ type: "MOUSE_DOWN" })
        },

        onKeyDown(event) {
          if (event.defaultPrevented) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              if (horizontal) return
              send({ type: "GOTO.NEXT" })
            },
            ArrowUp() {
              if (horizontal) return
              send({ type: "GOTO.PREV" })
            },
            ArrowRight() {
              if (!horizontal) return
              send({ type: "GOTO.NEXT" })
            },
            ArrowLeft() {
              if (!horizontal) return
              send({ type: "GOTO.PREV" })
            },
            Home() {
              send({ type: "GOTO.FIRST" })
            },
            End() {
              send({ type: "GOTO.LAST" })
            },
          }

          const key = getEventKey(event, {
            dir: state.context.dir,
            orientation: state.context.orientation,
          })

          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },

        style: {
          [horizontal ? "gridAutoColumns" : "gridAutoRows"]: "var(--slide-item-size)",
          [horizontal ? "scrollPaddingInline" : "scrollPaddingBlock"]: padding,
          [horizontal ? "paddingInline" : "paddingBlock"]: padding,
          gap: "var(--slide-spacing)",
        },
      })
    },

    getItemState,
    getItemProps(props) {
      const itemState = getItemState(props)
      const slides = Math.floor(slidesPerView)
      const shouldSnap = scrollBy === "item" || (props.index + slides) % slides === 0

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, props.index),
        dir: state.context.dir,
        "data-current": dataAttr(itemState.current),
        "data-inview": dataAttr(itemState.inView),
        // Used to detect active slide after scroll
        "data-index": props.index,
        role: "group",
        "aria-roledescription": "slide",
        "data-orientation": state.context.orientation,
        "aria-label": itemState.valueText,
        inert: itemState.inView ? undefined : "true",
        "aria-hidden": ariaAttr(!itemState.inView),

        style: {
          scrollSnapAlign: shouldSnap ? "start" : undefined,
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
        "aria-label": "Previous Slide",
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
        onClick() {
          send("GOTO.PREV")
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
        "aria-label": "Next Slide",
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
        disabled: !canScrollNext,
        onClick() {
          send("GOTO.NEXT")
        },
      })
    },

    getIndicatorGroupProps() {
      return normalize.element({
        ...parts.indicatorGroup.attrs,
        dir: state.context.dir,
        id: dom.getIndicatorGroupId(state.context),
        "data-orientation": state.context.orientation,
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
        "data-current": dataAttr(props.index === state.context.index),
        onClick() {
          if (props.readOnly) return
          send({ type: "GOTO", index: props.index })
        },
      })
    },
  }
}
