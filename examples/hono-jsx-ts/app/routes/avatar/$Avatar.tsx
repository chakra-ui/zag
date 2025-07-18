import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/hono-jsx"
import { useId } from "hono/jsx"

interface AvatarProps extends Omit<avatar.Props, "id"> {
  src: string
  name: string
}

export default function Avatar(props: AvatarProps) {
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
    <>
      <main className="avatar">
        <div {...api.getRootProps()}>
          <div {...api.getFallbackProps()}>
            <div>{initial}</div>
          </div>
          <img alt={name} referrerPolicy="no-referrer" src={src} {...api.getImageProps()} />
        </div>
      </main>
    </>
  )
}
