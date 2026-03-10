import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.data("pinInput", useControls(pinInputControls))
Alpine.plugin(usePlugin("pin-input", pinInput))
Alpine.start()
