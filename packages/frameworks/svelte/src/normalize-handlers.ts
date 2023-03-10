export function normalizeHandlers(handlers: Record<string, () => void>) {
  const normalizedHandlers: Record<string, () => void> = {}

  for (const [key, value] of Object.entries(handlers)) {
    const eventName = key.replace(/^on/, "").toLowerCase()
    normalizedHandlers[eventName] = value
  }
  return normalizedHandlers
}
