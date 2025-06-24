const nameMap: Record<string, string> = {
  "context-menu": "menu",
  "nested-menu": "menu",
  "progress-linear": "progress",
  "progress-circular": "progress",
  "range-slider": "slider",
  "timer-countdown": "timer",
}

export function normalizeComponentName(component: string) {
  return nameMap[component] || component
}
