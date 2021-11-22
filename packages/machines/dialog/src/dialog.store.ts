import { proxy } from "@ui-machines/core"

type StoreItem = { id: string; close: VoidFunction }

type Store = {
  value: StoreItem[]
  add: (item: StoreItem) => void
  remove: (id: string) => void
  isTopMost: (id: string) => boolean
}

export const dialogStore = proxy<Store>({
  value: [],
  isTopMost(id) {
    const lastModal = this.value[this.value.length - 1]
    return lastModal?.id === id
  },
  add(item: StoreItem) {
    this.value.push(item)
  },
  remove(id) {
    const index = this.value.findIndex((item) => item.id === id)
    if (index < this.value.length - 1) {
      this.value.splice(index).forEach((item) => item.close())
    } else {
      this.value = this.value.filter((item) => item.id !== id)
    }
  },
})
