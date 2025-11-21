import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => {
  return (form: HTMLFormElement, options: any) => serialize(form, options)
})
Alpine.magic("selectData", () => selectData)
Alpine.plugin(usePlugin("select", select))
Alpine.start()
