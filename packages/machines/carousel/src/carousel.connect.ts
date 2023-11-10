import { dataAttr, isDom } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { MachineApi, Send, IndicatorProps, ItemProps, State, ItemState } from "./carousel.types"
import { getSlidesInView } from "./utils/get-slide-in-view"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const canScrollNext = state.context.canScrollNext
  const canScrollPrev = state.context.canScrollPrev
  const isHorizontal = state.context.isHorizontal
  const isAutoplay = state.matches("autoplay")

  const activeSnap = state.context.scrollSnaps[state.context.index]
  const slidesInView = isDom() ? getSlidesInView(state.context)(activeSnap) : []

  function getItemStateState(props: ItemProps): ItemState {
    const { index } = props
    return {
      valueText: `Slide ${index + 1}`,
      isCurrent: index === state.context.index,
      isNext: index === state.context.index + 1,
      isPrevious: index === state.context.index - 1,
      isInView: slidesInView.includes(index),
    }
  }

  return {
    index: state.context.index,
    scrollProgress: state.context.scrollProgress,
    isAutoplay,
    canScrollNext,
    canScrollPrev,

    scrollTo(index, jump) {
      send({ type: "GOTO", index, jump })
    },

    scrollToNext() {
      send("NEXT")
    },

    scrollToPrevious() {
      send("PREV")
    },

    getItemState: getItemStateState,

    play() {
      send("PLAY")
    },

    pause() {
      send("PAUSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      role: "region",
      "aria-roledescription": "carousel",
      "data-orientation": state.context.orientation,
      dir: state.context.dir,
      "aria-label": "Carousel",
      style: {
        "--slide-spacing": state.context.spacing,
        "--slide-size": `calc(100% / ${state.context.slidesPerView} - var(--slide-spacing))`,
      },
    }),

    viewportProps: normalize.element({
      ...parts.viewport.attrs,
      dir: state.context.dir,
      id: dom.getViewportId(state.context),
      "data-orientation": state.context.orientation,
    }),

    itemGroupProps: normalize.element({
      ...parts.itemGroup.attrs,
      id: dom.getItemGroupId(state.context),
      "data-orientation": state.context.orientation,
      dir: state.context.dir,
      style: {
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        [isHorizontal ? "height" : "width"]: "auto",
        gap: "var(--slide-spacing)",
        transform: state.context.translateValue,
        transitionProperty: "transform",
        willChange: "transform",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "0.3s",
      },
    }),

    getItemProps(props) {
      const { index } = props
      const sliderState = getItemStateState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, index),
        dir: state.context.dir,
        "data-current": dataAttr(sliderState.isCurrent),
        "data-inview": dataAttr(sliderState.isInView),
        role: "group",
        "aria-roledescription": "slide",
        "data-orientation": state.context.orientation,
        "aria-label": sliderState.valueText,
        style: {
          position: "relative",
          flex: "0 0 var(--slide-size)",
          [isHorizontal ? "minWidth" : "minHeight"]: "0px",
        },
      })
    },

    prevTriggerProps: normalize.button({
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
        send("PREV")
      },
    }),

    nextTriggerProps: normalize.button({
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
        send("NEXT")
      },
    }),

    indicatorGroupProps: normalize.element({
      ...parts.indicatorGroup.attrs,
      dir: state.context.dir,
      id: dom.getIndicatorGroupId(state.context),
      "data-orientation": state.context.orientation,
    }),

    getIndicatorProps(props: IndicatorProps) {
      const { index, readOnly } = props
      return normalize.button({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        id: dom.getIndicatorId(state.context, index),
        type: "button",
        "data-orientation": state.context.orientation,
        "data-index": index,
        "data-readonly": dataAttr(readOnly),
        "data-current": dataAttr(index === state.context.index),
        onClick() {
          if (readOnly) return
          send({ type: "GOTO", index })
        },
      })
    },
  }
}
