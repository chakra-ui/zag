import signale from "signale"

export function createLogger(scope: string) {
  return signale.scope(scope)
}
