import { dataAttr, isDom } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { MachineApi, Send, SlideIndicatorProps, SlideProps, State } from "./carousel.types"
import { getSlidesInView } from "./utils/get-slide-in-view"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const canScrollNext = state.context.canScrollNext
  const canScrollPrev = state.context.canScrollPrev
  const isHorizontal = state.context.isHorizontal
  const isAutoplay = state.matches("autoplay")

  const activeSnap = state.context.scrollSnaps[state.context.index]
  const slidesInView = isDom() ? getSlidesInView(state.context)(activeSnap) : []

  function getSlideState(props: SlideProps) {
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

    scrollTo(index: number, jump?: boolean) {
      send({ type: "GOTO", index, jump })
    },

    scrollToNext() {
      send("NEXT")
    },

    scrollToPrevious() {
      send("PREV")
    },

    getSlideState,

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
      "aria-label": "Carousel",
      style: {
        "--slide-spacing": state.context.spacing,
        "--slide-size": `calc(100% / ${state.context.slidesPerView} - var(--slide-spacing))`,
      },
    }),

    viewportProps: normalize.element({
      ...parts.viewport.attrs,
      id: dom.getViewportId(state.context),
      "data-orientation": state.context.orientation,
    }),

    slideGroupProps: normalize.element({
      ...parts.slideGroup.attrs,
      id: dom.getSlideGroupId(state.context),
      "data-orientation": state.context.orientation,
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

    getSlideProps(props: SlideProps) {
      const { index } = props
      const sliderState = getSlideState(props)

      return normalize.element({
        ...parts.slide.attrs,
        id: dom.getSlideId(state.context, index),
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

    prevSlideTriggerProps: normalize.button({
      ...parts.prevSlideTrigger.attrs,
      id: dom.getPrevSliderTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: !canScrollPrev,
      "aria-label": "Previous Slide",
      "data-orientation": state.context.orientation,
      "aria-controls": dom.getSlideGroupId(state.context),
      onClick() {
        send("PREV")
      },
    }),

    nextSlideTriggerProps: normalize.button({
      ...parts.nextSlideTrigger.attrs,
      id: dom.getNextSliderTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      "aria-label": "Next Slide",
      "data-orientation": state.context.orientation,
      "aria-controls": dom.getSlideGroupId(state.context),
      disabled: !canScrollNext,
      onClick() {
        send("NEXT")
      },
    }),

    indicatorGroupProps: normalize.element({
      ...parts.indicatorGroup.attrs,
      id: dom.getIndicatorGroupId(state.context),
      "data-orientation": state.context.orientation,
    }),

    getIndicatorProps(props: SlideIndicatorProps) {
      const { index, readOnly } = props
      return normalize.button({
        ...parts.indicator.attrs,
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
