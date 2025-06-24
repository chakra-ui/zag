import { proxy } from "@zag-js/store"

export const panelStack = proxy({
  stack: [] as string[],
  count() {
    return this.stack.length
  },
  add(panelId: string) {
    if (this.stack.includes(panelId)) return
    this.stack.push(panelId)
  },
  remove(panelId: string) {
    const index = this.stack.indexOf(panelId)
    if (index < 0) return
    this.stack.splice(index, 1)
  },
  bringToFront(id: string) {
    this.remove(id)
    this.add(id)
  },
  isTopmost(id: string) {
    return this.stack[this.stack.length - 1] === id
  },
  indexOf(id: string) {
    return this.stack.indexOf(id)
  },
})
