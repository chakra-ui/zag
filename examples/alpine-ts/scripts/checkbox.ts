import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.data("checkbox", useControls(checkboxControls))
Alpine.plugin(usePlugin("checkbox", checkbox))
Alpine.start()
