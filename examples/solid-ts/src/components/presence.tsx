import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { JSX, createMemo, createSignal, mergeProps, onMount, splitProps } from "solid-js"

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
  const [localProps, restProps] = splitProps(props, [
    "hidden",
    "ref",
    "lazyMount",
    "skipAnimationOnMount",
    "unmountOnExit",
  ])
  const present = createMemo(() => !localProps.hidden)

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

  const unmounted = createMemo(() => {
    if (!api().present && !wasEverPresent() && localProps.lazyMount) return true
    if (localProps.unmountOnExit && !api().present && wasEverPresent()) return true
    return false
  })

  const mergedProps = createMemo(() =>
    mergeProps(
      {
        ref: mergedRef,
        "data-scope": "presence",
        "data-state": api().skip && localProps.skipAnimationOnMount ? undefined : present() ? "open" : "closed",
        hidden: !api().present,
      },
      restProps,
    ),
  )

  return <>{!unmounted() && <div {...mergedProps()} />}</>
}
