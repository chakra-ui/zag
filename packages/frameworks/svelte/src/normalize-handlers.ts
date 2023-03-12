export function normalizeHandlers(handlers: Record<string, EventListener>) {
  const normalizedHandlers: Record<string, EventListener> = {}

  for (const [key, value] of Object.entries(handlers)) {
    const eventName = key.replace(/^on/, "").toLowerCase()
    normalizedHandlers[eventName] = value
  }
  return normalizedHandlers
}
