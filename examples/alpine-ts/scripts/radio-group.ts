import * as radio from "@zag-js/radio-group"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => {
  return (form: HTMLFormElement, options: any) => serialize(form, options)
})
Alpine.plugin(usePlugin("radio", radio))
Alpine.start()
