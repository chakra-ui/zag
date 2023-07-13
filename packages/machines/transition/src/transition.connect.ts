import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { PublicApi, Send, State, TransitionConfig } from "./transition.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): PublicApi<T> {
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
    status,
    unmount,

    toggle() {
      send("MOUNTED.TOGGLE")
    },

    transition,

    transitionGroup<K extends string>(configs: Record<K, TransitionConfig>): Record<K, Record<string, any>> {
      return Object.keys(configs).reduce((acc, config) => {
        acc[config] = transition(configs[config])
        return acc
      }, {} as any)
    },
  }
}
