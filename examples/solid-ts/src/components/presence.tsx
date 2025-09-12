import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { JSX, createMemo, mergeProps, onMount, splitProps } from "solid-js"

interface PresenceProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function Presence(props: PresenceProps) {
  const [localProps, restProps] = splitProps(props, ["hidden", "ref"])
  const present = createMemo(() => !localProps.hidden)

  const service = useMachine(
    presence.machine,
    createMemo(() => ({ present: present() })),
  )
  const api = createMemo(() => presence.connect(service, normalizeProps))

  let ref: HTMLDivElement | undefined

  onMount(() => {
    if (ref) {
      api().setNode(ref)
    }
  })

  const mergedRef = (el: HTMLDivElement) => {
    ref = el
    if (typeof localProps.ref === "function") {
      localProps.ref(el)
    } else if (localProps.ref) {
      localProps.ref = el
    }
  }

  const mergedProps = createMemo(() =>
    mergeProps(
      {
        ref: mergedRef,
        "data-scope": "presence",
        "data-state": api().skip ? undefined : present() ? "open" : "closed",
        hidden: !api().present,
      },
      restProps,
    ),
  )

  return <div {...mergedProps()} />
}
