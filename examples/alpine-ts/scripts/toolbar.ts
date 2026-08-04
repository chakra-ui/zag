import { dataAttr } from "@zag-js/dom-query"
import Alpine from "alpinejs"

Alpine.magic("dataAttr", () => {
  return (guard: boolean | undefined) => dataAttr(guard)
})
