import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { useControls } from "./use-controls"

Alpine.data("progress", useControls(progressControls))
Alpine.plugin(usePlugin("progress", progress))
Alpine.start()
