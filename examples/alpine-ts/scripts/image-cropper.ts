import * as imageCropper from "@zag-js/image-cropper"
import { imageCropperControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("imageCropper", useControls(imageCropperControls))
Alpine.plugin(usePlugin("image-cropper", imageCropper))
Alpine.start()
