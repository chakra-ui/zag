import { Send, State, TransitionConfig } from "./transition.types"

export function connect(state: State, send: Send) {
  const [status] = state.tags
  const unmount = state.matches("exited")
  const duration = status === "enter" ? state.context.enterDuration : state.context.exitDuration

  function transition(config: TransitionConfig): Record<string, any> {
    const { base, variants } = config
    const properties = [...new Set([...Object.keys(variants.enter), ...Object.keys(variants.exit)])]
    return {
      ...base,
      ...variants[status],
      transitionDuration: `${duration}ms`,
      transitionProperty: properties.join(", "),
    }
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
