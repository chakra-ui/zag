import { createStore } from "@zag-js/utils"

export const store = createStore<{ id: string | null }>({ id: null })
