import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.data("splitter", useControls(splitterControls))
Alpine.plugin(usePlugin("splitter", splitter))
Alpine.start()
