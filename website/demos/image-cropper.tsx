import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

interface ImageCropperProps extends Omit<imageCropper.Props, "id"> {}

export function ImageCropper(props: ImageCropperProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const service = useMachine(imageCropper.machine, {
    id: useId(),
    initialCrop: { x: 120, y: 40, width: 120, height: 120 },
    ...props,
  })

  const api = imageCropper.connect(service, normalizeProps)

  const handleShowPreview = async () => {
    const result = await api.getCroppedImage()
    let url: string | null = null
    if (result instanceof Blob) {
      // Revoke previous URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      url = URL.createObjectURL(result)
    } else if (typeof result === "string") {
      url = result
    }
    setPreviewUrl(url)
  }

  const revokePreview = () => {
    // Revoke URL after image loads for performance
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="image-cropper-container">
      <div {...api.getRootProps()}>
        <div {...api.getViewportProps()}>
          <img
            src="https://placedog.net/500/280?id=2"
            alt="Dog to be cropped"
            crossOrigin="anonymous"
            width={500}
            height={280}
            {...api.getImageProps()}
          />
          <div {...api.getSelectionProps()}>
            {imageCropper.handles.map((position) => (
              <div key={position} {...api.getHandleProps({ position })}>
                <div />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="preview-button" onClick={handleShowPreview}>
        Show Preview
      </button>

      {previewUrl && (
        <div>
          <h3>Cropped Image Preview</h3>
          <img
            className="preview-image"
            src={previewUrl}
            alt="Cropped preview"
            onLoad={revokePreview}
          />
        </div>
      )}
    </div>
  )
}
