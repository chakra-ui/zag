import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./carousel.anatomy"
import { dom } from "./carousel.dom"
import { Send, State } from "./carousel.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const canScrollNext = true
  const canScrollPrevious = true

  return {
    canScrollNext,
    canScrollPrevious,
    scrollTo(index: number) {
      send({ type: "SCROLL_TO", index })
    },
    scrollToNext() {},
    scrollToPrevious() {},

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      style: {
        "--slide-spacing": "0px",
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
      },
    }),

    getSlideProps(props: { index: number }) {
      return normalize.element({
        ...parts.slide.attrs,
        id: dom.getSlideId(state.context, props.index),
        "data-selected": "true",
        style: {
          "--slide-size": "100%",
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
    }),

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
      type: "button",
      disabled: !canScrollNext,
      onClick() {
        send({ type: "NEXT" })
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
