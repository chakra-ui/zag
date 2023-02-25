import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Send, State, TransitionConfig } from "./transition.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const [status] = state.tags
  const unmount = state.matches("exited")
  const duration = status === "enter" ? state.context.enterDuration : state.context.exitDuration

  function transition(config: TransitionConfig): T["style"] {
    const { base, variants } = config
    const properties = [...new Set([...Object.keys(variants.enter), ...Object.keys(variants.exit)])]
    const { style } = normalize.element({
      style: {
        ...base,
        ...variants[status],
        transitionDuration: `${duration}ms`,
        transitionProperty: properties.join(", "),
      },
    })
    return style
  }

  return {
    /**
     * The current status of the transition.
     */
    status,
    /**
     * Whether to unmount the element
     */
    unmount,
    /**
     * Function to toggle the transition.
     */
    toggle() {
      send("MOUNTED.TOGGLE")
    },
    /**
     * Returns the transition styles to apply to the element.
     */
    transition,
    /**
     * Returns the transition styles to apply to a group of elements.
     */
    transitionGroup<K extends string>(configs: Record<K, TransitionConfig>): Record<K, Record<string, any>> {
      return Object.keys(configs).reduce((acc, config) => {
        acc[config] = transition(configs[config])
        return acc
      }, {} as any)
    },
  }
}
