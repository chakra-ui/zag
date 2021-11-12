import { proxy } from "valtio"

type Id = string | null

type Store = {
  id: Id
  prevId: Id
  setId: (val: Id) => void
}

export const tooltipStore = proxy<Store>({
  id: null,
  prevId: null,
  setId(val) {
    this.prevId = this.id
    this.id = val
  },
})
