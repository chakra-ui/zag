import { proxy } from "@zag-js/core"

type Id = string | null

type Store = {
  id: Id
  prevId: Id
  setId: (val: Id) => void
}

export const store = proxy<Store>({
  id: null,
  prevId: null,
  setId(val) {
    this.prevId = this.id
    this.id = val
  },
})
