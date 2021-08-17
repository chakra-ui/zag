import { ConcreteComponent, onMounted, ref, defineComponent, ComputedRef, Ref, UnwrapRef, unref } from "vue"
import { StateMachine } from "@ui-machines/core"
import { useId } from "./use-id"

/** Vue Component HTML Element Instance */
export type VueComponentInstance = InstanceType<ReturnType<typeof defineComponent>>

/** Ref may or may not be an HTML Element or VueComponent instance */
export type MaybeElementRef = MaybeRef<Element | VueComponentInstance | null>

/**
 * Value may or may not be a `ref`.
 *
 * ```ts
 * type MaybeRef<T> = T | Ref<T>
 * ```
 */
export type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

/**
 * Unwraps element from ref
 * @param elementRef Ref of template node
 */
export function unrefElement(elementRef: MaybeElementRef): UnwrapRef<MaybeElementRef> {
  const node = unref(elementRef)
  return ((node as VueComponentInstance)?.$el ?? node) as HTMLElement | null
}

export function useMount(send: (evt: StateMachine.Event<StateMachine.AnyEventObject>) => void | Promise<void>) {
  const nodeRef = ref<null | MaybeElementRef>(null)
  const id = useId()

  onMounted(() => {
    send({ type: "SETUP", doc: nodeRef.value?.$el?.ownerDocument || nodeRef.value?.ownerDocument, id: id.value })
  })

  return nodeRef
}
