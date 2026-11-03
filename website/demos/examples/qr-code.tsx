import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/qr-code.module.css"
import { Button, Log, Row, Stack } from "./shared"

const logo = "https://avatars.githubusercontent.com/u/54212428?s=88&v=4"

function useQrCode(props: Partial<qrCode.Props> = {}) {
  const service = useMachine(qrCode.machine, {
    id: useId(),
    defaultValue: "https://zagjs.com",
    ...props,
  })
  return qrCode.connect(service, normalizeProps)
}

function Code(props: {
  api: qrCode.Api
  overlay?: boolean
  frameClassName?: string
  patternClassName?: string
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <svg
        className={props.frameClassName ?? styles.Frame}
        {...api.getFrameProps()}
      >
        <path
          className={props.patternClassName ?? styles.Pattern}
          {...api.getPatternProps()}
        />
      </svg>
      {props.overlay && (
        <div className={styles.Overlay} {...api.getOverlayProps()}>
          <img src={logo} alt="" crossOrigin="anonymous" />
        </div>
      )}
    </div>
  )
}

export function QrCodeValue() {
  const [value, setValue] = useState("https://example.com")
  const api = useQrCode({ value })
  return (
    <Stack>
      <Code api={api} />
      <input
        className={styles.Input}
        aria-label="Value"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Stack>
  )
}

export function QrCodeDefaultValue() {
  const api = useQrCode({ defaultValue: "https://example.com" })
  return <Code api={api} />
}

const links = [
  "https://zagjs.com",
  "https://chakra-ui.com",
  "https://ark-ui.com",
]

export function QrCodeValueChange() {
  const [value, setValue] = useState("—")
  const api = useQrCode({
    onValueChange(details) {
      setValue(details.value)
    },
  })
  return (
    <Stack>
      <Code api={api} />
      <Row>
        {links.map((link) => (
          <Button key={link} onClick={() => api.setValue(link)}>
            {new URL(link).hostname}
          </Button>
        ))}
      </Row>
      <Log label="onValueChange" value={value} />
    </Stack>
  )
}

const pixelSizes = [4, 8, 12]

export function QrCodePixelSize() {
  const [pixelSize, setPixelSize] = useState(8)
  const api = useQrCode({ value: "https://example.com", pixelSize })
  return (
    <Stack>
      <Code api={api} frameClassName={styles.FrameNatural} />
      <Row>
        {pixelSizes.map((size) => (
          <Button
            key={size}
            aria-pressed={pixelSize === size}
            onClick={() => setPixelSize(size)}
          >
            {size}
          </Button>
        ))}
      </Row>
      <Log label="pixelSize" value={pixelSize} />
    </Stack>
  )
}

const levels = ["L", "M", "Q", "H"] as const

export function QrCodeEcc() {
  const [ecc, setEcc] = useState<(typeof levels)[number]>("H")
  const api = useQrCode({ encoding: { ecc } })
  return (
    <Stack>
      <Code api={api} />
      <Row>
        {levels.map((level) => (
          <Button
            key={level}
            aria-pressed={ecc === level}
            onClick={() => setEcc(level)}
          >
            {level}
          </Button>
        ))}
      </Row>
      <Log label="ecc" value={ecc} />
    </Stack>
  )
}

export function QrCodeOverlay() {
  const api = useQrCode({ encoding: { ecc: "H" } })
  return <Code api={api} overlay />
}

export function QrCodeColor() {
  const api = useQrCode()
  return <Code api={api} patternClassName={styles.PatternGreen} />
}

export function QrCodeExport() {
  const [url, setUrl] = useState<string | null>(null)
  const api = useQrCode({
    value: "https://github.com/chakra-ui",
    encoding: { ecc: "H" },
  })
  return (
    <Stack>
      <Code api={api} overlay />
      <Row>
        <button
          className={styles.Download}
          {...api.getDownloadTriggerProps({
            mimeType: "image/png",
            fileName: "qr-code.png",
          })}
        >
          Download
        </button>
        <Button
          onClick={() => {
            api.getDataUrl("image/png").then(setUrl)
          }}
        >
          Get data URL
        </Button>
      </Row>
      {url && (
        <img className={styles.Preview} src={url} alt="Exported QR code" />
      )}
    </Stack>
  )
}

export const qrCodeExamples = {
  QrCodeValue,
  QrCodeDefaultValue,
  QrCodeValueChange,
  QrCodePixelSize,
  QrCodeEcc,
  QrCodeOverlay,
  QrCodeColor,
  QrCodeExport,
}
