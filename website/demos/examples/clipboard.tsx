import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { HiCheck, HiOutlineClipboard } from "react-icons/hi"
import styles from "../../styles/machines/clipboard.module.css"
import { Button, Log, Row, Stack } from "./shared"

function useClipboard(props: Partial<clipboard.Props> = {}) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    defaultValue: "https://zagjs.com",
    ...props,
  })
  return clipboard.connect(service, normalizeProps)
}

function Copy(props: { api: clipboard.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Copy this link
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          <span {...api.getIndicatorProps({ copied: true })}>
            <HiCheck />
          </span>
          <span {...api.getIndicatorProps({ copied: false })}>
            <HiOutlineClipboard />
          </span>
        </button>
      </div>
    </div>
  )
}

export function ClipboardValue() {
  const api = useClipboard({ value: "Hello, world!" })
  return <Copy api={api} />
}

export function ClipboardDefaultValue() {
  const api = useClipboard({ defaultValue: "Hello, world!" })
  return <Copy api={api} />
}

const values = ["https://zagjs.com", "https://ark-ui.com"]

export function ClipboardValueChange() {
  const [value, setValue] = useState("—")
  const api = useClipboard({
    onValueChange(details) {
      setValue(details.value)
    },
  })
  return (
    <Stack>
      <Copy api={api} />
      <Row>
        {values.map((item) => (
          <Button key={item} onClick={() => api.setValue(item)}>
            {new URL(item).hostname}
          </Button>
        ))}
      </Row>
      <Log label="onValueChange" value={value} />
    </Stack>
  )
}

export function ClipboardStatus() {
  const [copied, setCopied] = useState(false)
  const api = useClipboard({
    onStatusChange: (details) => {
      setCopied(details.copied)
    },
  })
  return (
    <Stack>
      <Copy api={api} />
      <Log label="copied" value={String(copied)} />
    </Stack>
  )
}

export function ClipboardCopied() {
  const api = useClipboard()
  return (
    <Stack>
      <Copy api={api} />
      <span className={styles.Status} data-copied={api.copied || undefined}>
        {api.copied ? "Copied to clipboard" : "Not copied yet"}
      </span>
    </Stack>
  )
}

export function ClipboardTimeout() {
  const [copied, setCopied] = useState(false)
  const api = useClipboard({
    timeout: 5000,
    onStatusChange(details) {
      setCopied(details.copied)
    },
  })
  return (
    <Stack>
      <Copy api={api} />
      <Log label="copied" value={String(copied)} />
    </Stack>
  )
}

export const clipboardExamples = {
  ClipboardValue,
  ClipboardDefaultValue,
  ClipboardValueChange,
  ClipboardStatus,
  ClipboardCopied,
  ClipboardTimeout,
}
