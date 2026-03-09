import * as radio from "@zag-js/radio-group"
import { radioControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.data("radio", useData(radioControls))
Alpine.plugin(usePlugin("radio", radio))
Alpine.start()
