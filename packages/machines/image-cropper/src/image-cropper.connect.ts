import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { ImageCropperService } from "./image-cropper.types"

export function connect<T extends PropTypes>(service: ImageCropperService, normalize: NormalizeProps<T>) {
  return {
    getRootProps() {
      return normalize.element({})
    },
  }
}
