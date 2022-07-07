import { remove } from "@zag-js/utils"

export type Scope = {
  node: HTMLElement
  paused: boolean
  pause(): void
  resume(): void
}

export const focusScopeStack = {
  /** A stack of focus scopes, with the active one at the top */
  stack: [] as Scope[],
  active() {
    return this.stack[0]
  },
  add(scope: Scope) {
    // pause the currently active focus scope (at the top of the stack)
    const activeScope = this.active()
    if (scope !== activeScope) {
      activeScope?.pause()
    }
    // remove in case it already exists (because we'll re-add it at the top of the stack)
    this.stack = remove(this.stack, scope)
    this.stack.unshift(scope)
  },
  remove(focusScope: Scope) {
    this.stack = remove(this.stack, focusScope)
    this.stack[0]?.resume()
  },
}

export const createScope = (node: HTMLElement): Scope => ({
  node,
  paused: false,
  pause() {
    this.paused = true
  },
  resume() {
    this.paused = false
  },
})
