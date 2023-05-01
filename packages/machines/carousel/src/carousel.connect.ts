import { dataAttr, isDom } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { Send, SlideProps, State } from "./carousel.types"
import { getSlidesInView } from "./utils/get-slide-in-view"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
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
      isInview: slidesInView.includes(index),
    }
  }

  return {
    /**
     * The current index of the carousel
     */
    index: state.context.index,
    /**
     * Whether the carousel is currently auto-playing
     */
    isAutoplay,
    /**
     * Whether the carousel is can scroll to the next slide
     */
    canScrollNext,
    /**
     * Whether the carousel is can scroll to the previous slide
     */
    canScrollPrev,
    /**
     * Function to scroll to a specific slide index
     */
    scrollTo(index: number, jump?: boolean) {
      send({ type: "GOTO", index, jump })
    },
    /**
     * Function to scroll to the next slide
     */
    scrollToNext() {
      send("NEXT")
    },
    /**
     * Function to scroll to the previous slide
     */
    scrollToPrevious() {
      send("PREV")
    },
    /**
     *  Returns the state of a specific slide
     */
    getSlideState,
    /**
     * Returns the current scroll progress of the carousel
     */
    getScrollProgress() {},
    /**
     * Returns the scroll snap list of the carousel
     */
    getScrollSnapList() {},
    /**
     * Function to start/resume autoplay
     */
    play() {
      send("PLAY")
    },
    /**
     * Function to pause autoplay
     */
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
        "data-inview": dataAttr(sliderState.isInview),
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
      ...parts.previousTrigger.attrs,
      id: dom.getPrevTriggerId(state.context),
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

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
      id: dom.getNextTriggerId(state.context),
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
      "data-orientation": state.context.orientation,
    }),

    getIndicatorProps(props: { index: number }) {
      const { index } = props
      return normalize.button({
        ...parts.indicator.attrs,
        id: dom.getIndicatorId(state.context, index),
        type: "button",
        "data-orientation": state.context.orientation,
        "data-index": index,
        "data-current": dataAttr(index === state.context.index),
      })
    },
  }
}
