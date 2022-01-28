import { StateMachine as S } from "@ui-machines/core"
import { ComputedRef, defineComponent, isRef, onMounted, ref, Ref } from "vue"

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type ComponentInstance = InstanceType<ReturnType<typeof defineComponent>>
type MaybeElementRef = MaybeRef<Element | ComponentInstance | null>

export type UseSetupProps = {
  id: ComputedRef<string> | string
  send: (evt: S.Event<S.AnyEventObject>) => void
}

export function useSetup(props: UseSetupProps) {
  const { id, send } = props
  const nodeRef = ref<null | MaybeElementRef>(null)

  onMounted(() => {
    Promise.resolve().then(() => {
      const doc = nodeRef.value?.$el?.ownerDocument || nodeRef.value?.ownerDocument
      send({ type: "SETUP", doc, id: isRef(id) ? id.value : id })
    })
  })

  return nodeRef
}
