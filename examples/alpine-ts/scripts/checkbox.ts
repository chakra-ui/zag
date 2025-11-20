import * as checkbox from "@zag-js/checkbox"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => {
  return (form: HTMLFormElement, options: any) => serialize(form, options)
})
Alpine.plugin(usePlugin("checkbox", checkbox))
Alpine.start()
