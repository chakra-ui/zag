import { dataAttr } from "@zag-js/dom-utils"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import { Send, SlideProps, State } from "./carousel.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const canScrollNext = state.context.canScrollNext
  const canScrollPrevious = state.context.canScrollPrevious

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
    canScrollNext,
    canScrollPrevious,
    scrollTo(index: number) {
      send({ type: "GOTO", index })
    },
    scrollToNext() {
      send("NEXT")
    },
    scrollToPrevious() {
      send("PREV")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": "Carousel",
      style: {
        "--slide-spacing": state.context.spacing,
        "--slide-size": `calc(100% / ${state.context.slidesPerView})`,
      },
    }),

    viewportProps: normalize.element({
      ...parts.viewport.attrs,
      id: dom.getViewportId(state.context),
      style: {
        overflow: "hidden",
      },
    }),

    slideGroupProps: normalize.element({
      ...parts.slideGroup.attrs,
      id: dom.getSlideGroupId(state.context),
      style: {
        display: "flex",
        flexDirection: "row",
        height: "auto",
        marginInlineStart: "calc(var(--slide-spacing) * -1)",
        transform: state.context.translateValue,
        transitionProperty: "transform",
        willChange: "transform",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "0.3s",
      },
    }),

    getSlideState,

    getSlideProps(props: SlideProps) {
      const { index } = props
      const sliderState = getSlideState(props)

      return normalize.element({
        ...parts.slide.attrs,
        id: dom.getSlideId(state.context, index),
        "data-current": dataAttr(sliderState.isCurrent),
        role: "group",
        "aria-roledescription": "slide",
        "aria-label": sliderState.valueText,
        style: {
          flex: "0 0 var(--slide-size)",
          minWidth: "0px",
          paddingInlineStart: "var(--slide-spacing)",
          position: "relative",
        },
      })
    },

    previousTriggerProps: normalize.button({
      ...parts.previousTrigger.attrs,
      type: "button",
      disabled: !canScrollPrevious,
      "aria-label": "Previous Slide",
      "aria-controls": dom.getSlideGroupId(state.context),
      onClick() {
        send("PREV")
      },
    }),

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
      type: "button",
      "aria-label": "Next Slide",
      "aria-controls": dom.getSlideGroupId(state.context),
      disabled: !canScrollNext,
      onClick() {
        send("NEXT")
      },
    }),

    indicatorGroupProps: normalize.element({
      ...parts.indicatorGroup.attrs,
    }),

    indicatorProps: normalize.button({
      ...parts.indicator.attrs,
      type: "button",
    }),
  }
}
