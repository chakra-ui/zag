import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Avatar(
  props: Omit<avatar.Props, "id"> & { src: string; name: string },
) {
  const { src, name } = props

  const service = useMachine(avatar.machine, {
    id: useId(),
    ...props,
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
          <img
            alt={name}
            referrerPolicy="no-referrer"
            src={src}
            {...api.getImageProps()}
          />
        </div>
      </main>
    </>
  )
}
