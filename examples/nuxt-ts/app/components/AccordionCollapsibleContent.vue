<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineOptions({ inheritAttrs: false })

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ openChange: [open: boolean] }>()
const attrs = useAttrs()

const id = useId()
const service = useMachine(
  collapsible.machine,
  computed(() => ({
    id,
    ids: { content: attrs.id as string | undefined },
    open: props.open,
    // The accordion owns `open`, so route find-in-page reveals back to it
    hiddenUntilFound: true,
    onOpenChange: (details: collapsible.OpenChangeDetails) => emit("openChange", details.open),
  })),
)

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="{ ...attrs, ...api.getContentProps() }">
      <slot />
    </div>
  </div>
</template>
