import { Teleport, computed, defineComponent, ref } from "vue"

export const IFrame = defineComponent({
  setup(_, { attrs, slots }) {
    const frameRef = ref<HTMLIFrameElement>()
    const mountNodeRef = computed(() => frameRef.value?.contentWindow?.document.body)
    return () => {
      const mountNode = mountNodeRef.value
      return (
        <iframe title="frame" ref={frameRef} {...attrs}>
          {mountNode ? <Teleport to={mountNode}>{slots.default?.()}</Teleport> : null}
        </iframe>
      )
    }
  },
})
