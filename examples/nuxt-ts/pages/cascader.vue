<script setup lang="ts">
import * as cascader from "@zag-js/cascader"
import { cascaderControls, cascaderData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(cascader.machine({ id: "1" }))

const api = computed(() => cascader.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="cascader">
    <div v-bind="api.getRootProps()">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
