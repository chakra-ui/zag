import { proxy } from "@zag-js/core"

type Id = string | null

interface TooltipStore {
  id: Id
  prevId: Id
  setId: (val: Id) => void
}

export const store = proxy<TooltipStore>({
  id: null,
  prevId: null,
  setId(val) {
    this.prevId = this.id
    this.id = val
  },
})
