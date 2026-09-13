export interface ReplaceTracker {
  claim: (key: string) => symbol
  isReplaced: (key: string, token: symbol) => boolean
}

// Tracks the newest queued event per key, so an event replaced before it ran can be dropped
export function createReplaceTracker(): ReplaceTracker {
  const newest = new Map<string, symbol>()
  return {
    claim(key) {
      const token = Symbol(key)
      newest.set(key, token)
      return token
    },
    isReplaced(key, token) {
      return newest.get(key) !== token
    },
  }
}
