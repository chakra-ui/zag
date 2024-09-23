import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { fromLength } from "@zag-js/utils"
import { parts } from "./steps.anatomy"
import { dom } from "./steps.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./steps.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const step = state.context.step
  const count = state.context.count
  const percent = state.context.percent
  const hasNextStep = state.context.hasNextStep
  const hasPrevStep = state.context.hasPrevStep

  const getItemState = (props: ItemProps): ItemState => ({
    triggerId: dom.getTriggerId(state.context, props.index),
    contentId: dom.getContentId(state.context, props.index),
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
    goToNextStep,
    goToPrevStep,
    resetStep,
    getItemState,
    setStep,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        style: {
          "--percent": `${percent}%`,
        },
      })
    },

    getListProps() {
      const arr = fromLength(state.context.count)
      const triggerIds = arr.map((_, index) => dom.getTriggerId(state.context, index))
      return normalize.element({
        ...parts.list.attrs,
        dir: state.context.dir,
        id: dom.getListId(state.context),
        role: "tablist",
        "aria-owns": triggerIds.join(" "),
        "aria-orientation": state.context.orientation,
        "data-orientation": state.context.orientation,
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        "aria-current": itemState.current ? "step" : undefined,
        "data-orientation": state.context.orientation,
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        role: "tab",
        dir: state.context.dir,
        tabIndex: !state.context.linear || itemState.current ? 0 : -1,
        "aria-selected": itemState.current,
        "aria-controls": itemState.contentId,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": state.context.orientation,
        "data-complete": dataAttr(itemState.completed),
        "data-current": dataAttr(itemState.current),
        "data-incomplete": dataAttr(itemState.incomplete),
        onClick(event) {
          if (event.defaultPrevented) return
          if (state.context.linear) return
          send({ type: "STEP.SET", value: props.index, src: "trigger.click" })
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: itemState.contentId,
        role: "tabpanel",
        tabIndex: 0,
        hidden: !itemState.current,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": state.context.orientation,
        "aria-labelledby": itemState.triggerId,
      })
    },

    getIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.indicator.attrs,
        dir: state.context.dir,
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
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-complete": dataAttr(itemState.completed),
        "data-current": dataAttr(itemState.current),
        "data-incomplete": dataAttr(itemState.incomplete),
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: state.context.dir,
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
        dir: state.context.dir,
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
        dir: state.context.dir,
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
