import * as fileUpload from "@zag-js/file-upload"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("file-upload", fileUpload))
Alpine.start()
