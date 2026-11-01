<script setup lang="ts">
import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/avatar.css"
import "@styles/tooltip.css"

const triggerStyle = {
  border: "none",
  background: "none",
  padding: 0,
  borderRadius: "9999px",
  cursor: "pointer",
}

const avatarService = useMachine(avatar.machine, { id: useId() })
const avatarApi = computed(() => avatar.connect(avatarService, normalizeProps))

const tooltipService = useMachine(tooltip.machine, { id: useId() })
const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main class="avatar">
    <!-- The button is both the tooltip trigger and the avatar root -->
    <button
      v-bind="mergeProps(tooltipApi.getTriggerProps(), avatarApi.getRootProps())"
      data-size="sm"
      :style="triggerStyle"
    >
      <span v-bind="avatarApi.getFallbackProps()">PA</span>
      <img alt="" referrerPolicy="no-referrer" :src="avatarData.full[0]" v-bind="avatarApi.getImageProps()" />
    </button>

    <Teleport to="#teleports">
      <div v-bind="tooltipApi.getPositionerProps()">
        <Presence class="tooltip-content" v-bind="tooltipApi.getContentProps()">Naruto Uzumaki</Presence>
      </div>
    </Teleport>
  </main>
</template>
