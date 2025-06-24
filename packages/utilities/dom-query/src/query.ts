type Root = Document | Element | null | undefined

export function queryAll<T extends Element = HTMLElement>(root: Root, selector: string) {
  return Array.from(root?.querySelectorAll<T>(selector) ?? [])
}

export function query<T extends Element = HTMLElement>(root: Root, selector: string) {
  return root?.querySelector<T>(selector) ?? null
}

export type ItemToId<T> = (v: T) => string

interface Item {
  id: string
}

export const defaultItemToId = <T extends Item>(v: T) => v.id

export function itemById<T extends Item>(v: T[], id: string, itemToId: ItemToId<T> = defaultItemToId) {
  return v.find((item) => itemToId(item) === id)
}

export function indexOfId<T extends Item>(v: T[], id: string, itemToId: ItemToId<T> = defaultItemToId) {
  const item = itemById(v, id, itemToId)
  return item ? v.indexOf(item) : -1
}

export function nextById<T extends Item>(v: T[], id: string, loop = true) {
  let idx = indexOfId(v, id)
  idx = loop ? (idx + 1) % v.length : Math.min(idx + 1, v.length - 1)
  return v[idx]
}

export function prevById<T extends Item>(v: T[], id: string, loop = true) {
  let idx = indexOfId(v, id)
  if (idx === -1) return loop ? v[v.length - 1] : null
  idx = loop ? (idx - 1 + v.length) % v.length : Math.max(0, idx - 1)
  return v[idx]
}
