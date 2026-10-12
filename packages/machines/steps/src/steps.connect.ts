import { dataAttr, getEventKey } from "@zag-js/dom-query"
import { mergeWithDefault } from "@zag-js/utils"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./steps.anatomy"
import * as dom from "./steps.dom"
import {
  COMPLETE,
  type IntlTranslations,
  type ItemProps,
  type ItemState,
  type StepItem,
  type StepsApi,
  type StepsService,
} from "./steps.types"
import {
  findEffectiveIndex,
  findItem,
  findItemIndex,
  findNavigableIndex,
  getNextResult,
  getReachability,
  isCompletingResult,
  isItemDisabled,
  isItemInvalid,
  isItemOptional,
  type NavContext,
} from "./utils"

const defaultTranslations: Required<IntlTranslations> = {
  progressLabel: "Progress",
  progressText: ({ index, count, percent, title, complete }) =>
    !complete && title ? `Step ${index + 1} of ${count}: ${title}` : `${percent}% complete`,
}

export function connect<T extends PropTypes, V extends StepItem = StepItem>(
  service: StepsService<any>,
  normalize: NormalizeProps<T>,
): StepsApi<T, V> {
  const { context, send, computed, prop, scope } = service

  const items = prop("items")
  const value = context.get("value")
  const completedValues = context.get("completedValues")
  const orientation = prop("orientation")
  const linear = prop("linear")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const complete = value === COMPLETE
  const currentIndex = findItemIndex(items, value)
  const currentItem = findItem(items, value) as V | null
  const effectiveItems = computed("effectiveItems") as V[]

  const navContext: NavContext = { items, value, completedValues, linear }

  const count = effectiveItems.length
  const effectiveIndex = findEffectiveIndex(items, value)
  const percent = count === 0 ? 0 : Math.round((Math.max(effectiveIndex, 0) / count) * 100)
  const hasNextStep = !complete && currentIndex !== -1
  const hasPrevStep = currentIndex !== -1 && findNavigableIndex(navContext, currentIndex, -1) !== -1
  const canComplete = isCompletingResult(getNextResult(navContext))
  const isReachable = (target: string) => getReachability(navContext, target).ok
  const reachableItems = effectiveItems.filter((item) => isReachable(item.value))

  // Keep one trigger tabbable in the completed view
  const focusValue = complete ? (reachableItems[reachableItems.length - 1]?.value ?? null) : value

  const canSkip = currentItem != null && isItemOptional(currentItem)

  const getItemState = (props: ItemProps): ItemState => {
    const item = findItem(items, props.value)
    const index = findEffectiveIndex(items, props.value)
    const position = findItemIndex(items, props.value)

    const disabled = item != null && isItemDisabled(item)
    const current = props.value === value
    const completed = completedValues.includes(props.value)
    const invalid = item != null && isItemInvalid(item)
    const optional = item != null && isItemOptional(item)
    const locked = item?.editable === false && completed && !current

    const passed = currentIndex !== -1 && position !== -1 && position < currentIndex
    const skipped = !disabled && !completed && !current && passed

    return {
      value: props.value,
      index,
      triggerId: dom.getTriggerId(scope, props.value),
      contentId: dom.getContentId(scope, props.value),
      current,
      completed,
      skipped,
      invalid,
      disabled,
      optional,
      locked,
      reachable: isReachable(props.value),
    }
  }

  const setValue = (value: string) => {
    send({ type: "VALUE.SET", value, src: "api.setValue" })
  }

  const goToNextStep = () => {
    send({ type: "STEP.NEXT", src: "next.trigger.click" })
  }

  const goToPrevStep = () => {
    send({ type: "STEP.PREV", src: "prev.trigger.click" })
  }

  const skipStep = () => {
    send({ type: "STEP.SKIP", src: "skip.trigger.click" })
  }

  return {
    items: effectiveItems,
    value,
    index: effectiveIndex,
    item: currentItem,
    count,
    percent,
    complete,
    completedValues,
    hasNextStep,
    hasPrevStep,
    canSkip,
    canComplete,
    getItemState,
    setValue,
    goToNextStep,
    goToPrevStep,
    skipStep,
    resetStep() {
      send({ type: "STEP.RESET", src: "api.resetStep" })
    },
    setCompletedValues(values) {
      send({ type: "COMPLETED.SET", value: values, src: "api.setCompletedValues" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "data-orientation": orientation,
        "data-complete": dataAttr(complete),
        style: {
          "--steps-percent": `${percent}%`,
        },
      })
    },

    getListProps() {
      const triggerIds = effectiveItems.map((item) => dom.getTriggerId(scope, item.value))
      return normalize.element({
        ...parts.list.attrs(scope.id),
        id: dom.getListId(scope),
        dir: prop("dir"),
        role: "tablist",
        "aria-owns": triggerIds.join(" "),
        "aria-orientation": orientation,
        "data-orientation": orientation,
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs(scope.id),
        dir: prop("dir"),
        role: "presentation",
        "data-orientation": orientation,
        ...itemStateAttrs(itemState),
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      const unreachable = !itemState.reachable
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: itemState.triggerId,
        role: "tab",
        type: "button",
        dir: prop("dir"),
        tabIndex: props.value === focusValue ? 0 : -1,
        disabled: unreachable,
        "aria-selected": itemState.current,
        "aria-current": itemState.current ? "step" : undefined,
        "aria-controls": itemState.contentId,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": orientation,
        ...itemStateAttrs(itemState),
        onClick(event) {
          if (event.defaultPrevented) return
          if (unreachable) return
          send({ type: "VALUE.SET", value: props.value, src: "trigger.click" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (event.altKey || event.ctrlKey || event.metaKey) return

          const reachable = reachableItems
          if (reachable.length === 0) return
          const index = reachable.findIndex((item) => item.value === props.value)

          // Manual activation: arrows move focus, Enter/Space activates
          const goTo = (next: number) => {
            event.preventDefault()
            const target = reachable[next]
            if (!target) return
            scope.getById(dom.getTriggerId(scope, target.value))?.focus()
          }

          const keyMap: EventKeyMap = {
            ArrowLeft() {
              if (orientation === "vertical") return
              goTo(Math.max(index - 1, 0))
            },
            ArrowRight() {
              if (orientation === "vertical") return
              goTo(Math.min(index + 1, reachable.length - 1))
            },
            ArrowUp() {
              if (orientation === "horizontal") return
              goTo(Math.max(index - 1, 0))
            },
            ArrowDown() {
              if (orientation === "horizontal") return
              goTo(Math.min(index + 1, reachable.length - 1))
            },
            Home() {
              goTo(0)
            },
            End() {
              goTo(reachable.length - 1)
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir"), orientation })]
          exec?.(event)
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)
      const isComplete = props.value === COMPLETE
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: itemState.contentId,
        role: isComplete ? undefined : "tabpanel",
        tabIndex: isComplete ? -1 : 0,
        hidden: !itemState.current,
        "data-value": itemState.value,
        "data-state": itemState.current ? "open" : "closed",
        "data-orientation": orientation,
        "data-complete": dataAttr(isComplete ? complete : itemState.completed),
        "aria-labelledby": isComplete ? undefined : itemState.triggerId,
      })
    },

    getIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "aria-hidden": true,
        "data-orientation": orientation,
        ...itemStateAttrs(itemState),
      })
    },

    getSeparatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.separator.attrs(scope.id),
        dir: prop("dir"),
        "data-orientation": orientation,
        ...itemStateAttrs(itemState),
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs(scope.id),
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
        ...parts.prevTrigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        disabled: !hasPrevStep,
        onClick(event) {
          if (event.defaultPrevented) return
          goToPrevStep()
        },
      })
    },

    getSkipTriggerProps() {
      return normalize.button({
        ...parts.skipTrigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        hidden: !canSkip,
        disabled: !canSkip,
        onClick(event) {
          if (event.defaultPrevented) return
          skipStep()
        },
      })
    },

    getProgressProps() {
      return normalize.element({
        ...parts.progress.attrs(scope.id),
        dir: prop("dir"),
        role: "progressbar",
        "aria-valuenow": percent,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-label": translations.progressLabel,
        "aria-valuetext": translations.progressText({
          index: effectiveIndex,
          count,
          percent,
          title: currentItem?.title,
          complete,
        }),
        "data-complete": dataAttr(percent === 100),
      })
    },
  }
}

const itemStateAttrs = (itemState: ItemState) => ({
  "data-value": itemState.value,
  "data-complete": dataAttr(itemState.completed),
  "data-current": dataAttr(itemState.current),
  "data-incomplete": dataAttr(!itemState.disabled && !itemState.completed && !itemState.current && !itemState.skipped),
  "data-skipped": dataAttr(itemState.skipped),
  "data-invalid": dataAttr(itemState.invalid),
  "data-optional": dataAttr(itemState.optional),
  "data-locked": dataAttr(itemState.locked),
  "data-disabled": dataAttr(itemState.disabled),
})
