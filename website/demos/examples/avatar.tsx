import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/avatar.module.css"
import { Button, Log, Row, Stack } from "./shared"

const sources = {
  segun: "https://avatars.githubusercontent.com/u/6916170?v=4",
  chakra: "https://avatars.githubusercontent.com/u/54212428?v=4",
  broken: "data:image/png;base64,broken",
}

function Avatar(props: {
  src: string
  name: string
  onStatusChange?: avatar.Props["onStatusChange"]
}) {
  const service = useMachine(avatar.machine, {
    id: useId(),
    onStatusChange: props.onStatusChange,
  })
  const api = avatar.connect(service, normalizeProps)
  const initials = props.name
    .split(" ")
    .map((part) => part[0])
    .join("")
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <span className={styles.Fallback} {...api.getFallbackProps()}>
        {initials}
      </span>
      <img
        alt={props.name}
        className={styles.Image}
        referrerPolicy="no-referrer"
        src={props.src}
        {...api.getImageProps()}
      />
    </div>
  )
}

export function AvatarStatus() {
  const [status, setStatus] = useState("loading")
  const [src, setSrc] = useState(sources.segun)
  return (
    <Stack>
      <Avatar
        src={src}
        name="Segun Adebayo"
        onStatusChange={(details) => setStatus(details.status)}
      />
      <Row>
        <Button onClick={() => setSrc(sources.segun)}>Valid image</Button>
        <Button onClick={() => setSrc(sources.broken)}>Broken image</Button>
      </Row>
      <Log label="onStatusChange" value={status} />
    </Stack>
  )
}

export function AvatarSource() {
  const [src, setSrc] = useState(sources.segun)
  return (
    <Stack>
      <Avatar src={src} name="Segun Adebayo" />
      <Row>
        <Button onClick={() => setSrc(sources.segun)}>Segun</Button>
        <Button onClick={() => setSrc(sources.chakra)}>Chakra</Button>
        <Button onClick={() => setSrc(sources.broken)}>Broken</Button>
      </Row>
    </Stack>
  )
}

export const avatarExamples = {
  AvatarStatus,
  AvatarSource,
}
