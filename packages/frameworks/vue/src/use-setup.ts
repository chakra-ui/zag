import { StateMachine as S } from "@zag-js/core"
import { ComputedRef, isRef, onMounted, ref, Ref } from "vue"

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type MaybeElementRef<T> = MaybeRef<T | null>

export type UseSetupProps = {
  id: ComputedRef<string> | string
  send: (evt: S.Event<S.AnyEventObject>) => void
}

export function useSetup<T extends HTMLElement = HTMLDivElement>(props: UseSetupProps) {
  const { id, send } = props
  const nodeRef = ref<MaybeElementRef<T>>(null)

  onMounted(() => {
    const el = nodeRef.value

    const doc = el?.ownerDocument
    const root = el?.getRootNode()
    const uid = isRef(id) ? id.value : id

    send({ type: "SETUP", doc, root, id: uid })
  })

  return nodeRef
}
