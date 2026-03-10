import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("fileUpload", useControls(fileUploadControls))
Alpine.plugin(usePlugin("file-upload", fileUpload))
Alpine.start()
