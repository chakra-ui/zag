import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/react"
import { handlePositions } from "@zag-js/shared"
import { useEffect, useId, useState } from "react"

interface ImageCropperProps extends Omit<imageCropper.Props, "id"> {}

export function ImageCropper(props: ImageCropperProps) {
  const service = useMachine(imageCropper.machine, {
    id: useId(),
    ...props,
  })

  const api = imageCropper.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getViewportProps()}>
        <img
          src="https://placedog.net/500/280?id=2"
          crossOrigin="anonymous"
          {...api.getImageProps()}
        />
        <div {...api.getSelectionProps()}>
          {handlePositions.map((position) => (
            <div key={position} {...api.getHandleProps({ position })}>
              <div />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
