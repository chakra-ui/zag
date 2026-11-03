import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/number-flow.module.css"
import { Button, Ghost, Log, Row, Stack, show } from "./shared"

function useNumberFlow(props: Partial<numberFlow.Props> = {}) {
  const service = useMachine(numberFlow.machine, { id: useId(), ...props })
  return numberFlow.connect(service, normalizeProps)
}

function NumberView(props: { api: numberFlow.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      {api.segments.map((segment) =>
        segment.kind === "digit" ? (
          <span
            key={segment.key}
            className={styles.Digit}
            {...api.getDigitProps({ segment })}
          >
            <span {...api.getDigitTrackProps({ segment })}>
              {api.digitCells.map((cell) => (
                <span
                  key={cell.index}
                  className={styles.Cell}
                  {...api.getDigitCellProps({ segment, cell })}
                >
                  {cell.glyph}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span
            key={segment.key}
            className={styles.Symbol}
            {...api.getSymbolProps({ segment })}
          >
            {segment.value}
          </span>
        ),
      )}
      <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
    </div>
  )
}

function Steps(props: { api: numberFlow.Api; step?: number }) {
  const { api, step = 1 } = props
  return (
    <Row>
      <Button onClick={() => api.setValue(api.value - step)}>−{step}</Button>
      <Button onClick={() => api.setValue(api.value + step)}>+{step}</Button>
      <Ghost onClick={() => api.setValue(Math.round(Math.random() * 99999))}>
        Random
      </Ghost>
    </Row>
  )
}

export function NumberFlowInitialValue() {
  const api = useNumberFlow({ defaultValue: 1234 })
  return (
    <Stack>
      <NumberView api={api} />
      <Steps api={api} step={111} />
    </Stack>
  )
}

export function NumberFlowControlled() {
  const [price, setPrice] = useState(49)
  const api = useNumberFlow({
    value: price,
    onValueChange: (details) => setPrice(details.value),
    formatOptions: { style: "currency", currency: "USD" },
  })
  return (
    <Stack>
      <NumberView api={api} />
      <Row>
        <Button onClick={() => setPrice(49)}>Monthly</Button>
        <Button onClick={() => setPrice(490)}>Yearly</Button>
        <Button onClick={() => setPrice(1290)}>Lifetime</Button>
      </Row>
      <Log label="price" value={price} />
    </Stack>
  )
}

export function NumberFlowFormat() {
  const euro = useNumberFlow({
    defaultValue: 1234.56,
    locale: "de-DE",
    formatOptions: { style: "currency", currency: "EUR" },
  })
  const arabic = useNumberFlow({ defaultValue: 1234, locale: "ar-EG" })
  return (
    <Stack>
      <NumberView api={euro} />
      <NumberView api={arabic} />
      <Row>
        <Button
          onClick={() => {
            euro.setValue(euro.value + 98.76)
            arabic.setValue(arabic.value + 87)
          }}
        >
          Increase
        </Button>
      </Row>
    </Stack>
  )
}

export function NumberFlowAffix() {
  const api = useNumberFlow({
    defaultValue: 820,
    prefix: "~",
    suffix: " req/s",
  })
  return (
    <Stack>
      <NumberView api={api} />
      <Steps api={api} step={45} />
    </Stack>
  )
}

export function NumberFlowTrend() {
  const [trend, setTrend] = useState(true)
  const api = useNumberFlow({ defaultValue: 199, trend })
  return (
    <Stack>
      <NumberView api={api} />
      <Row>
        <Steps api={api} step={1} />
        <Ghost aria-pressed={trend} onClick={() => setTrend((v) => !v)}>
          trend: {String(trend)}
        </Ghost>
      </Row>
    </Stack>
  )
}

export function NumberFlowContinuous() {
  const [continuous, setContinuous] = useState(true)
  const api = useNumberFlow({ defaultValue: 0, continuous })
  return (
    <Stack>
      <NumberView api={api} />
      <Row>
        <Button onClick={() => api.setValue(api.value === 0 ? 12 : 0)}>
          {api.value === 0 ? "Go to 12" : "Back to 0"}
        </Button>
        <Ghost
          aria-pressed={continuous}
          onClick={() => setContinuous((v) => !v)}
        >
          continuous: {String(continuous)}
        </Ghost>
      </Row>
    </Stack>
  )
}

export function NumberFlowTiming() {
  const api = useNumberFlow({
    defaultValue: 4210,
    spinTiming: { duration: "500ms", easing: "ease-out" },
    transformTiming: { duration: "300ms", easing: "ease-out" },
  })
  return (
    <Stack>
      <NumberView api={api} />
      <Steps api={api} step={5000} />
    </Stack>
  )
}

export function NumberFlowStagger() {
  const api = useNumberFlow({ defaultValue: 11111, stagger: "25ms" })
  return (
    <Stack>
      <NumberView api={api} />
      <Steps api={api} step={11111} />
    </Stack>
  )
}

export function NumberFlowAnimationEvents() {
  const [started, setStarted] = useState<number[]>()
  const [settled, setSettled] = useState<number[]>()
  const api = useNumberFlow({
    defaultValue: 3.14,
    formatOptions: { maximumFractionDigits: 2 },
    onAnimationStart: (details) => setStarted(details.places),
    onAnimationComplete: (details) => setSettled(details.places),
  })
  return (
    <Stack>
      <NumberView api={api} />
      <Steps api={api} step={1.11} />
      <Log label="onAnimationStart" value={show(started)} />
      <Log label="onAnimationComplete" value={show(settled)} />
    </Stack>
  )
}
