import signale from "signale"

const fn = signale.scope("build")

export const logger = {
  ...fn,
  watching() {
    fn.info("Watching packages...")
  },
  buildComplete(name: string) {
    fn.success(`${name}: Build complete.`)
  },
  typesGenerated(name: string) {
    fn.success(`${name}: Type generation complete...`)
  },
}
