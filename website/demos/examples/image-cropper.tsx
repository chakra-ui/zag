import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useState } from "react"
import styles from "../../styles/machines/image-cropper.module.css"
import { Button, Log, Row, Stack } from "./shared"

type Rect = { x: number; y: number; width: number; height: number }

const round = (rect: Rect) =>
  [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(", ")

function useCropper(props: Partial<imageCropper.Props> = {}) {
  const service = useMachine(imageCropper.machine, {
    id: useId(),
    initialCrop: { x: 150, y: 50, width: 180, height: 180 },
    ...props,
  })
  return imageCropper.connect(service, normalizeProps)
}

function Cropper(props: { api: imageCropper.Api }) {
  const { api } = props
  return (
    <div className={styles.Container}>
      <div className={styles.Root} {...api.getRootProps()}>
        <div className={styles.Viewport} {...api.getViewportProps()}>
          <img
            src="/image-cropper-demo.jpg"
            alt="Dog to be cropped"
            width={500}
            height={280}
            className={styles.Image}
            {...api.getImageProps()}
          />
          <div className={styles.Selection} {...api.getSelectionProps()}>
            {imageCropper.placements.map((placement) => (
              <div
                key={placement}
                className={styles.Handle}
                {...api.getHandleProps({ placement })}
              >
                <div />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImageCropperInitialCrop() {
  const api = useCropper({
    initialCrop: { x: 40, y: 40, width: 240, height: 240 },
    aspectRatio: 1,
  })
  return <Cropper api={api} />
}

export function ImageCropperFixed() {
  const api = useCropper({ fixedCropArea: true })
  return (
    <Stack>
      <Cropper api={api} />
      <Log label="zoom" value={api.zoom.toFixed(2)} />
    </Stack>
  )
}

export function ImageCropperCircle() {
  const api = useCropper({ cropShape: "circle", aspectRatio: 1 })
  return <Cropper api={api} />
}

export function ImageCropperTransform() {
  const api = useCropper({
    defaultZoom: 1.25,
    minZoom: 1,
    maxZoom: 5,
    defaultRotation: 0,
    defaultFlip: { horizontal: false, vertical: false },
  })
  return (
    <Stack>
      <Cropper api={api} />
      <Row>
        <Button onClick={() => api.setZoom(2)}>Zoom 2x</Button>
        <Button onClick={() => api.setRotation((api.rotation + 90) % 360)}>
          Rotate 90°
        </Button>
        <Button onClick={() => api.flipHorizontally()}>Flip horizontal</Button>
        <Button onClick={() => api.setFlip({ vertical: !api.flip.vertical })}>
          Flip vertical
        </Button>
        <Button onClick={() => api.reset()}>Reset</Button>
      </Row>
    </Stack>
  )
}

export function ImageCropperControlled() {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flip, setFlip] = useState({ horizontal: false, vertical: false })
  const api = useCropper({
    zoom,
    rotation,
    flip,
    onZoomChange(details) {
      setZoom(details.zoom)
    },
    onRotationChange(details) {
      setRotation(details.rotation)
    },
    onFlipChange(details) {
      setFlip(details.flip)
    },
  })
  return (
    <Stack>
      <Cropper api={api} />
      <Row>
        <Button onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>
          Zoom out
        </Button>
        <Button onClick={() => setZoom((z) => Math.min(5, z + 0.25))}>
          Zoom in
        </Button>
        <Button onClick={() => setRotation((r) => (r + 90) % 360)}>
          Rotate
        </Button>
        <Button
          onClick={() => setFlip((f) => ({ ...f, horizontal: !f.horizontal }))}
        >
          Flip
        </Button>
      </Row>
      <Log
        label="state"
        value={`zoom ${zoom.toFixed(2)} · rotation ${rotation}° · flip ${flip.horizontal}`}
      />
    </Stack>
  )
}

export function ImageCropperCropChange() {
  const [crop, setCrop] = useState<Rect | null>(null)
  const api = useCropper({
    onCropChange(details) {
      setCrop(details.crop)
    },
  })
  return (
    <Stack>
      <Cropper api={api} />
      <Log label="onCropChange" value={crop ? round(crop) : "—"} />
    </Stack>
  )
}

export function ImageCropperResize() {
  const api = useCropper()
  return (
    <Stack>
      <Cropper api={api} />
      <Row>
        <Button onClick={() => api.resize("e", 8)}>Grow right edge</Button>
        <Button onClick={() => api.resize("nw", -4)}>Shrink top-left</Button>
      </Row>
      <Log label="crop" value={round(api.crop)} />
    </Stack>
  )
}

export function ImageCropperSetCrop() {
  const api = useCropper({
    initialCrop: { x: 20, y: 20, width: 160, height: 120 },
  })
  return (
    <Stack>
      <Cropper api={api} />
      <Row>
        <Button
          onClick={() => {
            const { crop, viewportRect } = api
            api.setCrop({
              ...crop,
              x: (viewportRect.width - crop.width) / 2,
              y: (viewportRect.height - crop.height) / 2,
            })
          }}
        >
          Center
        </Button>
        <Button
          onClick={() => api.setCrop({ x: 0, y: 0, width: 200, height: 200 })}
        >
          Top-left square
        </Button>
      </Row>
    </Stack>
  )
}

export function ImageCropperExport() {
  const [url, setUrl] = useState<string | null>(null)
  const api = useCropper()

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return (
    <Stack>
      <Cropper api={api} />
      <Button
        onClick={async () => {
          const blob = await api.getCroppedImage({
            type: "image/png",
            quality: 0.92,
          })
          if (blob instanceof Blob) setUrl(URL.createObjectURL(blob))
        }}
      >
        Get cropped image
      </Button>
      {url && (
        <img className={styles.PreviewImage} src={url} alt="Cropped preview" />
      )}
    </Stack>
  )
}

export function ImageCropperCoordinates() {
  const api = useCropper()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const data = mounted ? api.getCropData() : null
  return (
    <Stack>
      <Cropper api={api} />
      <Log label="api.crop" value={round(api.crop)} />
      <Log label="getCropData()" value={data ? round(data) : "—"} />
    </Stack>
  )
}

export function ImageCropperNudge() {
  const api = useCropper({
    nudgeStep: 1,
    nudgeStepShift: 10,
    nudgeStepCtrl: 50,
  })
  return (
    <Stack>
      <Cropper api={api} />
      <Log label="crop" value={round(api.crop)} />
    </Stack>
  )
}

export const imageCropperExamples = {
  ImageCropperInitialCrop,
  ImageCropperFixed,
  ImageCropperCircle,
  ImageCropperTransform,
  ImageCropperControlled,
  ImageCropperCropChange,
  ImageCropperResize,
  ImageCropperSetCrop,
  ImageCropperExport,
  ImageCropperCoordinates,
  ImageCropperNudge,
}
