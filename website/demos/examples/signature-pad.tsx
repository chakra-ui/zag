import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId, useState } from "react"
import { BiRotateRight } from "react-icons/bi"
import styles from "../../styles/machines/signature-pad.module.css"
import { Button, Log, Row, Stack } from "./shared"

function useSignaturePad(props: Partial<signaturePad.Props> = {}) {
  const service = useMachine(signaturePad.machine, { id: useId(), ...props })
  return signaturePad.connect(service, normalizeProps)
}

function Pad(props: { api: signaturePad.Api; clearTrigger?: boolean }) {
  const { api, clearTrigger = true } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Sign here
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <svg className={styles.Segment} {...api.getSegmentProps()}>
          {api.paths.map((path, i) => (
            <path key={i} {...api.getSegmentPathProps({ path })} />
          ))}
          {api.currentPath && (
            <path {...api.getSegmentPathProps({ path: api.currentPath })} />
          )}
        </svg>
        {clearTrigger && (
          <button
            className={styles.ClearTrigger}
            {...api.getClearTriggerProps()}
          >
            <BiRotateRight />
          </button>
        )}
        <div className={styles.Guide} {...api.getGuideProps()} />
      </div>
    </div>
  )
}

export function SignaturePadDrawEvents() {
  const [drawing, setDrawing] = useState("—")
  const [ended, setEnded] = useState("—")
  const api = useSignaturePad({
    onDraw(details) {
      setDrawing(`${details.paths.length} paths`)
    },
    onDrawEnd(details) {
      setEnded(`${details.paths.length} paths`)
    },
  })
  return (
    <Stack>
      <Pad api={api} />
      <Log label="onDraw" value={drawing} />
      <Log label="onDrawEnd" value={ended} />
    </Stack>
  )
}

export function SignaturePadClear() {
  const api = useSignaturePad()
  return (
    <Stack>
      <Pad api={api} clearTrigger={false} />
      <Button onClick={() => api.clear()} disabled={api.empty}>
        Clear
      </Button>
    </Stack>
  )
}

export function SignaturePadPreview() {
  const [imageURL, setImageURL] = useState("")
  const api = useSignaturePad({
    onDrawEnd(details) {
      details.getDataUrl("image/png").then((url) => {
        setImageURL(url)
      })
    },
  })
  return (
    <Stack>
      <Pad api={api} />
      {imageURL && !api.empty && (
        <img className={styles.Preview} src={imageURL} alt="Signature" />
      )}
    </Stack>
  )
}

export function SignaturePadControlled() {
  const [paths, setPaths] = useState<string[]>([])
  const api = useSignaturePad({
    paths,
    onDraw(details) {
      setPaths(details.paths)
    },
  })
  return (
    <Stack>
      <Pad api={api} />
      <Row>
        <Button
          disabled={!paths.length}
          onClick={() => setPaths((current) => current.slice(0, -1))}
        >
          Undo stroke
        </Button>
        <Button disabled={!paths.length} onClick={() => setPaths([])}>
          Clear from outside
        </Button>
      </Row>
      <Log label="paths" value={paths.length} />
    </Stack>
  )
}

export function SignaturePadColor() {
  const api = useSignaturePad({ drawing: { fill: "red" } })
  return <Pad api={api} />
}

export function SignaturePadSize() {
  const api = useSignaturePad({ drawing: { size: 5 } })
  return <Pad api={api} />
}

export function SignaturePadPressure() {
  const [simulatePressure, setSimulatePressure] = useState(false)
  const api = useSignaturePad({ drawing: { size: 4, simulatePressure } })
  return (
    <Stack>
      <Pad api={api} />
      <Button onClick={() => setSimulatePressure((value) => !value)}>
        simulatePressure: {String(simulatePressure)}
      </Button>
    </Stack>
  )
}

export const signaturePadExamples = {
  SignaturePadDrawEvents,
  SignaturePadClear,
  SignaturePadPreview,
  SignaturePadControlled,
  SignaturePadColor,
  SignaturePadSize,
  SignaturePadPressure,
}
