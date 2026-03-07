import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("fileUpload", useData(fileUploadControls))
Alpine.plugin(usePlugin("file-upload", fileUpload))
Alpine.start()
