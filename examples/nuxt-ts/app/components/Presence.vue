<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { VNodeRef } from "vue"
import { computed, mergeProps, ref, watch } from "vue"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    lazyMount?: boolean
    skipAnimationOnMount?: boolean
    unmountOnExit?: boolean
  }>(),
  {
    lazyMount: false,
    skipAnimationOnMount: false,
    unmountOnExit: false,
  },
)

const attrs = useAttrs()
const present = computed(() => !attrs.hidden)

const service = useMachine(
  presence.machine,
  computed(() => ({ present: present.value })),
)

const api = computed(() => presence.connect(service, normalizeProps))

const wasEverPresent = ref(false)
const nodeRef = ref<VNodeRef | null>(null)

watch(
  () => api.value.present,
  (isPresent) => {
    if (isPresent) wasEverPresent.value = true
  },
)

watch(nodeRef, () => {
  if (nodeRef.value) {
    api.value.setNode(nodeRef.value)
  }
})

// Restart CSS animations when element transitions from display:none to visible.
// Vue's synchronous send applies hidden=false and data-state="open" in the same paint,
// so the browser doesn't trigger the animation for elements coming out of display:none.
watch(present, (isPresent) => {
  if (isPresent) {
    const node = nodeRef.value as HTMLElement | null
    if (!node) return
    node.style.animation = "none"
    void node.offsetHeight
    node.style.animation = ""
  }
}, { flush: "post" })

const unmounted = computed(() => {
  if (!api.value.present && !wasEverPresent.value && props.lazyMount) return true
  if (props.unmountOnExit && !api.value.present && wasEverPresent.value) return true
  return false
})

const mergedProps = computed(() =>
  mergeProps({ "data-scope": "presence" }, attrs, {
    hidden: !api.value.present,
    "data-state": api.value.skip && props.skipAnimationOnMount ? undefined : present.value ? "open" : "closed",
    ref: nodeRef,
  }),
)
</script>

<template>
  <div v-if="!unmounted" v-bind="mergedProps">
    <slot />
  </div>
</template>
