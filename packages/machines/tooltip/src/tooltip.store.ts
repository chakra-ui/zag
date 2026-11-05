import { createStore } from "@zag-js/utils"

const SKIP_DELAY_WINDOW = 400

export const store = createStore<{ id: string | null; prevId: string | null; instant: boolean; closedAt: number }>({
  id: null,
  prevId: null,
  instant: false,
  closedAt: 0,
})

export const isWarm = () => store.get("id") !== null || Date.now() - store.get("closedAt") < SKIP_DELAY_WINDOW
