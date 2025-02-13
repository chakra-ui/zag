import { proxy } from "@zag-js/store"

export const store = proxy<{ id: string | null }>({ id: null })
