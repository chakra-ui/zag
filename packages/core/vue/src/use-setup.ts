import { AnyFunction } from "@core-foundation/utils"
import { ComputedRef, defineComponent, onMounted, ref, Ref } from "vue"

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type ComponentInstance = InstanceType<ReturnType<typeof defineComponent>>
type MaybeElementRef = MaybeRef<Element | ComponentInstance | null>

export type UseSetupProps = {
  id: ComputedRef<string>
  send: AnyFunction
}

export function useMount(props: UseSetupProps) {
  const { id, send } = props
  const nodeRef = ref<null | MaybeElementRef>(null)

  onMounted(() => {
    send({ type: "SETUP", doc: nodeRef.value?.$el?.ownerDocument || nodeRef.value?.ownerDocument, id: id.value })
  })

  return nodeRef
}
