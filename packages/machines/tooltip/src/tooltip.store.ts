import { createStore } from "@zag-js/utils"

export const store = createStore<{ id: string | null; prevId: string | null; instant: boolean }>({
  id: null,
  prevId: null,
  instant: false,
})
