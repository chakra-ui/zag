import signale from "signale"

export function createLogger(scope: string) {
  const fn = signale.scope(scope)
  return {
    ...fn,
    buildComplete(name: string, size?: string) {
      fn.success(`${name}: Build complete.`, `[${size}]`)
    },
    typesGenerated(name: string) {
      fn.success(`${name}: Type generation complete...`)
    },
  }
}
