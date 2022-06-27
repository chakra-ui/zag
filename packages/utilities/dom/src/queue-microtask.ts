export function queueMicrotask(fn: VoidFunction) {
  if (typeof globalThis.queueMicrotask === "function") {
    globalThis.queueMicrotask(fn)
  } else {
    Promise.resolve().then(fn)
  }
}
