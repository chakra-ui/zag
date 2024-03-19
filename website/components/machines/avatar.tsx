import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Avatar(props: { controls: { src: string; name: string } }) {
  const { src, name } = props.controls

  const [state, send] = useMachine(avatar.machine({ id: useId() }))
  const api = avatar.connect(state, send, normalizeProps)

  const initial = name
    .split(" ")
    .map((s) => s[0])
    .join("")

  return (
    <>
      <main className="avatar">
        <div {...api.rootProps}>
          <div {...api.fallbackProps}>
            <div>{initial}</div>
          </div>
          <img
            alt={name}
            referrerPolicy="no-referrer"
            src={src}
            {...api.imageProps}
          />
        </div>
      </main>
    </>
  )
}
