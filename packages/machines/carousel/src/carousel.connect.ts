import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import type { Send, SlideProps, State } from "./carousel.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const canScrollNext = state.context.canScrollNext
  const canScrollPrevious = state.context.canScrollPrevious
  const isHorizontal = state.context.isHorizontal
  const isAutoplay = state.matches("autoplay")

  function getSlideState(props: SlideProps) {
    const { index } = props
    return {
      valueText: `Slide ${index + 1}`,
      isCurrent: index === state.context.index,
      isNext: index === state.context.index + 1,
      isPrevious: index === state.context.index - 1,
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
    canScrollPrevious,
    /**
     * Function to scroll to a specific slide index
     */
    scrollTo(index: number) {
      send({ type: "GOTO", index })
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

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      role: "region",
      "aria-roledescription": "carousel",
      "data-orientation": state.context.orientation,
      "aria-label": "Carousel",
      style: {
        "--slide-spacing": state.context.spacing,
        "--slide-size": `calc(100% / ${state.context.slidesPerView})`,
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

    previousTriggerProps: normalize.button({
      ...parts.previousTrigger.attrs,
      type: "button",
      tabIndex: -1,
      disabled: !canScrollPrevious,
      "aria-label": "Previous Slide",
      "data-orientation": state.context.orientation,
      "aria-controls": dom.getSlideGroupId(state.context),
      onClick() {
        send("PREV")
      },
    }),

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
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

    indicatorProps: normalize.button({
      ...parts.indicator.attrs,
      "data-orientation": state.context.orientation,
      type: "button",
    }),
  }
}
