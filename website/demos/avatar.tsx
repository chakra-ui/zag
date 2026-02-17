import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/avatar.module.css"

interface AvatarProps extends Omit<avatar.Props, "id"> {
  src: string
  name: string
}

export function Avatar(props: AvatarProps) {
  const [avatarProps, restProps] = avatar.splitProps(props)
  const { src, name } = restProps

  const service = useMachine(avatar.machine, {
    id: useId(),
    ...avatarProps,
  })

  const api = avatar.connect(service, normalizeProps)

  const initial = name
    .split(" ")
    .map((s) => s[0])
    .join("")

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Fallback} {...api.getFallbackProps()}>
        <div>{initial}</div>
      </div>
      <img
        alt={name}
        className={styles.Image}
        referrerPolicy="no-referrer"
        src={src}
        {...api.getImageProps()}
      />
    </div>
  )
}
