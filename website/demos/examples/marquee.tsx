import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/marquee.module.css"
import { Button, Log, Row, Stack } from "./shared"

const logos = [
  { name: "Apple", logo: "🍎" },
  { name: "Banana", logo: "🍌" },
  { name: "Cherry", logo: "🍒" },
  { name: "Grape", logo: "🍇" },
  { name: "Watermelon", logo: "🍉" },
  { name: "Strawberry", logo: "🍓" },
]

function useMarquee(props: Partial<marquee.Props> = {}) {
  const service = useMachine(marquee.machine, {
    id: useId(),
    spacing: "1rem",
    speed: 60,
    autoFill: true,
    ...props,
  })
  return marquee.connect(service, normalizeProps)
}

function Track(props: { api: marquee.Api; edges?: boolean; link?: boolean }) {
  const { api } = props
  const vertical = api.orientation === "vertical"
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      {props.edges && (
        <div
          className={styles.Edge}
          {...api.getEdgeProps({ side: vertical ? "top" : "start" })}
        />
      )}
      <div {...api.getViewportProps()}>
        {Array.from({ length: api.contentCount }).map((_, index) => (
          <div
            key={index}
            className={styles.Content}
            {...api.getContentProps({ index })}
          >
            {logos.map((item, i) =>
              props.link ? (
                <a
                  key={i}
                  href="#"
                  className={styles.Item}
                  onClick={(event) => event.preventDefault()}
                  {...api.getItemProps()}
                >
                  <span className={styles.Logo}>{item.logo}</span>
                  <span className={styles.Name}>{item.name}</span>
                </a>
              ) : (
                <div key={i} className={styles.Item} {...api.getItemProps()}>
                  <span className={styles.Logo}>{item.logo}</span>
                  <span className={styles.Name}>{item.name}</span>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
      {props.edges && (
        <div
          className={styles.Edge}
          {...api.getEdgeProps({ side: vertical ? "bottom" : "end" })}
        />
      )}
    </div>
  )
}

function Basic(props: Partial<marquee.Props>) {
  const api = useMarquee(props)
  return <Track api={api} edges />
}

export function MarqueeAutoFill() {
  const api = useMarquee({ autoFill: true })
  return (
    <Stack>
      <Track api={api} edges />
      <Log label="contentCount" value={api.contentCount} />
    </Stack>
  )
}

const sides: marquee.Props["side"][] = ["start", "end", "top", "bottom"]

export function MarqueeSide() {
  const [side, setSide] = useState<marquee.Props["side"]>("end")
  return (
    <Stack>
      <Row>
        {sides.map((value) => (
          <Button
            key={value}
            aria-pressed={side === value}
            onClick={() => setSide(value)}
          >
            {value}
          </Button>
        ))}
      </Row>
      <Basic key={side} side={side} />
      <Log label="side" value={side} />
    </Stack>
  )
}

const speeds = [30, 100, 200]

export function MarqueeSpeed() {
  const [speed, setSpeed] = useState(100)
  return (
    <Stack>
      <Row>
        {speeds.map((value) => (
          <Button
            key={value}
            aria-pressed={speed === value}
            onClick={() => setSpeed(value)}
          >
            {value}px/s
          </Button>
        ))}
      </Row>
      <Basic key={speed} speed={speed} />
      <Log label="speed" value={`${speed}px/s`} />
    </Stack>
  )
}

export function MarqueeSpacing() {
  return <Basic spacing="2rem" />
}

export function MarqueeReverse() {
  return <Basic reverse />
}

export function MarqueePauseOnInteraction() {
  const api = useMarquee({ pauseOnInteraction: true })
  return (
    <Stack>
      <Track api={api} edges link />
      <Log label="paused" value={String(api.paused)} />
    </Stack>
  )
}

export function MarqueeDefaultPaused() {
  const api = useMarquee({ defaultPaused: true })
  return (
    <Stack>
      <Track api={api} edges />
      <Button onClick={api.togglePause}>
        {api.paused ? "Resume" : "Pause"}
      </Button>
    </Stack>
  )
}

export function MarqueeControlled() {
  const [paused, setPaused] = useState(false)
  const api = useMarquee({
    paused,
    onPauseChange(details) {
      setPaused(details.paused)
    },
  })
  return (
    <Stack>
      <Track api={api} edges />
      <Row>
        <Button onClick={() => setPaused((current) => !current)}>
          {paused ? "Play" : "Pause"} from outside
        </Button>
      </Row>
      <Log label="paused" value={String(paused)} />
    </Stack>
  )
}

export function MarqueeDelay() {
  const api = useMarquee({ delay: 2 })
  return (
    <Stack>
      <Track api={api} edges />
      <Button onClick={api.restart}>Restart</Button>
    </Stack>
  )
}

export function MarqueeLoopCount() {
  const api = useMarquee({ loopCount: 3, speed: 150 })
  return (
    <Stack>
      <Track api={api} edges />
      <Button onClick={api.restart}>Restart</Button>
    </Stack>
  )
}

export function MarqueeLoopComplete() {
  const [loops, setLoops] = useState(0)
  const api = useMarquee({
    speed: 150,
    onLoopComplete() {
      setLoops((n) => n + 1)
    },
  })
  return (
    <Stack>
      <Track api={api} edges />
      <Log label="onLoopComplete" value={`${loops} loops`} />
    </Stack>
  )
}

export function MarqueeComplete() {
  const [done, setDone] = useState(false)
  const api = useMarquee({
    loopCount: 3,
    speed: 150,
    onComplete() {
      setDone(true)
    },
  })
  return (
    <Stack>
      <Track api={api} edges />
      <Row>
        <Button
          onClick={() => {
            setDone(false)
            api.restart()
          }}
        >
          Restart
        </Button>
      </Row>
      <Log label="onComplete" value={done ? "finished" : "running"} />
    </Stack>
  )
}

export function MarqueeProgrammatic() {
  const api = useMarquee()
  return (
    <Stack>
      <Track api={api} edges />
      <Row>
        <Button onClick={api.pause}>Pause</Button>
        <Button onClick={api.resume}>Resume</Button>
        <Button onClick={api.togglePause}>Toggle</Button>
        <Button onClick={api.restart}>Restart</Button>
      </Row>
    </Stack>
  )
}

export function MarqueePauseChange() {
  const [status, setStatus] = useState("playing")
  const api = useMarquee({
    pauseOnInteraction: true,
    onPauseChange(details) {
      setStatus(details.paused ? "paused" : "playing")
    },
  })
  return (
    <Stack>
      <Track api={api} edges />
      <Log label="onPauseChange" value={status} />
    </Stack>
  )
}

export function MarqueeEdges() {
  const api = useMarquee()
  return <Track api={api} edges />
}

export const marqueeExamples = {
  MarqueeAutoFill,
  MarqueeSide,
  MarqueeSpeed,
  MarqueeSpacing,
  MarqueeReverse,
  MarqueePauseOnInteraction,
  MarqueeDefaultPaused,
  MarqueeControlled,
  MarqueeDelay,
  MarqueeLoopCount,
  MarqueeLoopComplete,
  MarqueeComplete,
  MarqueeProgrammatic,
  MarqueePauseChange,
  MarqueeEdges,
}
