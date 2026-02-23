import { JSX, ParentProps, children, createSignal, createUniqueId, onCleanup, onMount, splitProps } from "solid-js"
import { render } from "solid-js/web"

type Props = ParentProps<JSX.IntrinsicElements["iframe"]>

export const IFrame = (props: Props) => {
  const [ref, setRef] = createSignal<HTMLIFrameElement>()
  const [childrenProps, localProps] = splitProps(props, ["children"])

  onMount(() => {
    const _node = children(() => childrenProps.children)
    let timer: NodeJS.Timeout | null

    const flush = () => {
      const body = ref()?.contentDocument?.body

      if (body?.hasChildNodes()) {
        timer && clearInterval(timer)
        return
      }

      render(_node, body!)
    }

    flush()

    timer = setInterval(flush, 0)

    onCleanup(() => {
      timer && clearInterval(timer)
    })
  })

  return <iframe title={createUniqueId()} ref={setRef} {...localProps} />
}
