import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/hover-card.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const users = [
  {
    id: "zag",
    name: "Zag JS",
    handle: "@zag_js",
    bio: "UI components powered by state machines.",
  },
  {
    id: "chakra",
    name: "Chakra UI",
    handle: "@chakra_ui",
    bio: "Accessible components for React apps.",
  },
]

function useHoverCard(props: Partial<hoverCard.Props> = {}) {
  const service = useMachine(hoverCard.machine, { id: useId(), ...props })
  return hoverCard.connect(service, normalizeProps)
}

function Trigger(props: {
  api: hoverCard.Api
  value?: string
  label?: string
}) {
  return (
    <a
      href="#hover-card"
      className={styles.Trigger}
      onClick={(event) => event.preventDefault()}
      {...props.api.getTriggerProps({ value: props.value })}
    >
      {props.label ?? "@zag_js"}
    </a>
  )
}

function Card(props: { api: hoverCard.Api; user?: (typeof users)[number] }) {
  const { api } = props
  const user = props.user ?? users[0]
  if (!api.open) return null
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          <div className={styles.Arrow} {...api.getArrowProps()}>
            <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
          </div>
          <div className={styles.CardWrapper}>
            <img
              alt=""
              src="/favicon/apple-touch-icon.png"
              className={styles.Avatar}
            />
            <div className={styles.CardContent}>
              <div className={styles.Header}>
                <span>{user.name}</span>
                <span>{user.handle}</span>
              </div>
              <p>{user.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export function HoverCardControlled() {
  const [open, setOpen] = useState(false)
  const api = useHoverCard({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setOpen((current) => !current)}>
          {open ? "Close" : "Open"} from outside
        </Ghost>
      </Row>
      <Card api={api} />
    </Stack>
  )
}

export function HoverCardDelays() {
  const api = useHoverCard({ openDelay: 300, closeDelay: 150 })
  return (
    <Stack>
      <Trigger api={api} />
      <Card api={api} />
    </Stack>
  )
}

export function HoverCardPositioning() {
  const api = useHoverCard({
    positioning: {
      placement: "bottom-start",
      offset: { mainAxis: 8, crossAxis: 4 },
    },
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Card api={api} />
    </Stack>
  )
}

export function HoverCardMultipleTriggers() {
  const [activeUser, setActiveUser] = useState(users[0])
  const api = useHoverCard({
    onTriggerValueChange({ value }) {
      setActiveUser(users.find((user) => user.id === value) ?? users[0])
    },
  })
  return (
    <Stack>
      <Row>
        {users.map((user) => (
          <Trigger
            key={user.id}
            api={api}
            value={user.id}
            label={user.handle}
          />
        ))}
      </Row>
      <Card api={api} user={activeUser} />
      <Log label="triggerValue" value={show(api.triggerValue)} />
    </Stack>
  )
}

export function HoverCardDisabled() {
  const api = useHoverCard({ disabled: true })
  return (
    <Stack>
      <Trigger api={api} />
      <Card api={api} />
      <Log label="open" value={String(api.open)} />
    </Stack>
  )
}

export function HoverCardOpenChange() {
  const [details, setDetails] = useState<hoverCard.OpenChangeDetails | null>(
    null,
  )
  const api = useHoverCard({ onOpenChange: setDetails })
  return (
    <Stack>
      <Trigger api={api} />
      <Card api={api} />
      <Log
        label="open"
        value={details ? `${details.open} · ${details.reason ?? "—"}` : "—"}
      />
    </Stack>
  )
}
