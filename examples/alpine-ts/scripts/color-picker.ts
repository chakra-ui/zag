import * as colorPicker from "@zag-js/color-picker"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => {
  return (form: HTMLFormElement, options: any) => serialize(form, options)
})
Alpine.magic("parse", () => {
  return (colorString: string) => colorPicker.parse(colorString)
})
Alpine.plugin(usePlugin("color-picker", colorPicker))
Alpine.start()
