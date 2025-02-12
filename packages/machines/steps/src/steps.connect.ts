import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { fromLength } from "@zag-js/utils"
import { parts } from "./steps.anatomy"
import * as dom from "./steps.dom"
import type { ItemProps, ItemState, StepsApi, StepsService } from "./steps.types"

export function connect<T extends PropTypes>(service: StepsService, normalize: NormalizeProps<T>): StepsApi<T> {
  const { context, send, computed, prop, scope } = service

  const step = context.get("step")
  const count = prop("count")
  const percent = computed("percent")
  const hasNextStep = computed("hasNextStep")
  const hasPrevStep = computed("hasPrevStep")

  const getItemState = (props: ItemProps): ItemState => ({
    triggerId: dom.getTriggerId(scope, props.index),
    contentId: dom.getContentId(scope, props.index),
    current: props.index === step,
    completed: props.index < step,
    incomplete: props.index > step,
    index: props.index,
    first: props.index === 0,
    last: props.index === count - 1,
  })

  const goToNextStep = () => {
    send({ type: "STEP.NEXT", src: "next.trigger.click" })
  }

  const goToPrevStep = () => {
    send({ type: "STEP.PREV", src: "prev.trigger.click" })
  }

  const resetStep = () => {
    send({ type: "STEP.RESET", src: "reset.trigger.click" })
  }

  const setStep = (value: number) => {
    send({ type: "STEP.SET", value, src: "api.setValue" })
  }

  return {
    value: step,
    count,
    percent,
    hasNextStep,
    hasPrevStep,
    isCompleted: computed("completed"),
    goToNextStep,
    goToPrevStep,
    resetStep,
    getItemState,
    setStep,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        style: {
          "--percent": `${percent}%`,
        },
      })
    },

    getListProps() {
      const arr = fromLength(count)
      const triggerIds = arr.map((_, index) => dom.getTriggerId(scope, index))
      return normalize.element({
        ...parts.list.attrs,
        dir: prop("dir"),
        id: dom.getListId(scope),
        role: "tablist",
        "aria-owns": triggerIds.join(" "),
        "aria-orientation": prop("orientation"),
        "data-orientation": prop("orientation"),
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        "aria-current": itemState.current ? "step" : undefined,
        "data-orientation": prop("orientation"),
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        role: "tab",
        dir: prop("dir"),
        tabIndex: !prop("linear") || itemState.current ? 0 : -1,
        "aria-selected": itemState.current,
        "aria-controls": itemState.contentId,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-complete": dataAttr(itemState.completed),
        "data-current": dataAttr(itemState.current),
        "data-incomplete": dataAttr(itemState.incomplete),
        onClick(event) {
          if (event.defaultPrevented) return
          if (prop("linear")) return
          send({ type: "STEP.SET", value: props.index, src: "trigger.click" })
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: itemState.contentId,
        role: "tabpanel",
        tabIndex: 0,
        hidden: !itemState.current,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "aria-labelledby": itemState.triggerId,
      })
    },

    getIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.indicator.attrs,
        dir: prop("dir"),
        "aria-hidden": true,
        "data-complete": dataAttr(itemState.completed),
        "data-current": dataAttr(itemState.current),
        "data-incomplete": dataAttr(itemState.incomplete),
      })
    },

    getSeparatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.separator.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-complete": dataAttr(itemState.completed),
        "data-current": dataAttr(itemState.current),
        "data-incomplete": dataAttr(itemState.incomplete),
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled: !hasNextStep,
        onClick(event) {
          if (event.defaultPrevented) return
          goToNextStep()
        },
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        dir: prop("dir"),
        ...parts.prevTrigger.attrs,
        type: "button",
        disabled: !hasPrevStep,
        onClick(event) {
          if (event.defaultPrevented) return
          goToPrevStep()
        },
      })
    },

    getProgressProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.progress.attrs,
        role: "progressbar",
        "aria-valuenow": percent,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuetext": `${percent}% complete`,
        "data-complete": dataAttr(percent === 100),
      })
    },
  }
}
