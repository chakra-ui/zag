import { snapshot, subscribe } from "./proxy"

export type CompareFn<T = any> = (prev: T, next: T) => boolean

const defaultCompareFn: CompareFn = (prev, next) => Object.is(prev, next)

export function subscribeKey<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  fn: (value: T[K]) => void,
  sync?: boolean,
  compareFn?: (prev: T[K], next: T[K]) => boolean,
) {
  let prev: any = Reflect.get(snapshot(obj), key)
  const isEqual = compareFn || defaultCompareFn
  function onSnapshotChange() {
    const snap = snapshot(obj) as T
    if (isEqual(prev, snap[key])) return
    fn(snap[key])
    prev = Reflect.get(snap, key)
  }
  return subscribe(obj, onSnapshotChange, sync)
}
