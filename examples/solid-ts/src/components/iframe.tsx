import { ParentProps, Show, createSignal, createUniqueId, onSettled, omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Portal } from "@solidjs/web"

type Props = ParentProps<JSX.IntrinsicElements["iframe"]>

export const IFrame = (props: Props) => {
  const [ref, setRef] = createSignal<HTMLIFrameElement>()
  const [body, setBody] = createSignal<HTMLElement>()
  const localProps = omit(props, "children")

  onSettled(() => {
    const timer = setInterval(() => {
      const el = ref()?.contentDocument?.body
      if (!el) return
      clearInterval(timer)
      setBody(el)
    }, 0)
    return () => clearInterval(timer)
  })

  return (
    <>
      <iframe title={createUniqueId()} ref={setRef} {...localProps} />
      <Show when={body()}>{(el) => <Portal mount={el()}>{props.children}</Portal>}</Show>
    </>
  )
}
