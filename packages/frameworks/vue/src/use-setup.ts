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
    Promise.resolve().then(() => {
      const doc = nodeRef.value?.getRootNode() ?? document
      send({ type: "SETUP", doc, id: isRef(id) ? id.value : id })
    })
  })

  return nodeRef
}
