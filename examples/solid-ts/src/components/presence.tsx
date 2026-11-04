import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, merge, onSettled, omit } from "solid-js"
import type { JSX } from "@solidjs/web"

interface PresenceProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to enable lazy mounting.
   */
  lazyMount?: boolean
  /**
   * Whether to skip the initial mount animation.
   */
  skipAnimationOnMount?: boolean
  /**
   * Whether to unmount the component when it's not present.
   */
  unmountOnExit?: boolean
}

export function Presence(props: PresenceProps) {
  const restProps = omit(props, "hidden", "ref", "lazyMount", "skipAnimationOnMount", "unmountOnExit")
  const present = createMemo(() => !props.hidden)

  const service = useMachine(
    presence.machine,
    createMemo(() => ({ present: present() })),
  )
  const api = createMemo(() => presence.connect(service, normalizeProps))

  const [wasEverPresent, setWasEverPresent] = createSignal(false)

  createMemo(() => {
    if (api().present) setWasEverPresent(true)
  })

  let ref: HTMLDivElement | undefined

  onSettled(() => {
    if (ref) {
      api().setNode(ref)
    }
  })

  const mergedRef = (el: HTMLDivElement) => {
    ref = el
    if (typeof props.ref === "function") {
      props.ref(el)
    } else if (props.ref) {
      props.ref = el
    }
  }

  const unmounted = createMemo(() => {
    if (!api().present && !wasEverPresent() && props.lazyMount) return true
    if (props.unmountOnExit && !api().present && wasEverPresent()) return true
    return false
  })

  const mergedProps = createMemo(() =>
    merge(
      {
        ref: mergedRef,
        "data-scope": "presence",
        "data-state": api().skip && props.skipAnimationOnMount ? undefined : present() ? "open" : "closed",
        hidden: !api().present,
      },
      restProps,
    ),
  )

  return <>{!unmounted() && <div {...mergedProps()} />}</>
}
