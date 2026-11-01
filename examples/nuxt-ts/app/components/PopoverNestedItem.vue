<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const props = defineProps<{ id: string; nested?: boolean }>()

const service = useMachine(popover.machine, {
  id: props.id,
  modal: false,
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <div data-part="root">
    <button v-if="!nested" data-testid="button-before">Button :before</button>

    <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">
      {{ nested ? "Open Nested" : "Click me" }}
    </button>

    <div v-if="!nested" v-bind="api.getAnchorProps()">anchor</div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
          <div v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>
          <div data-testid="popover-title" v-bind="api.getTitleProps()">Popover Title</div>
          <div data-part="body" data-testid="popover-body">
            <a>Non-focusable Link</a>
            <a href="#" data-testid="focusable-link">Focusable Link</a>
            <input data-testid="input" placeholder="input" />
            <button data-testid="popover-close-button" v-bind="api.getCloseTriggerProps()">
              <XIcon />
            </button>
            <slot />
          </div>
        </div>
      </div>
    </Teleport>
    <span v-if="!nested" data-testid="plain-text">I am just text</span>
    <button v-if="!nested" data-testid="button-after">Button :after</button>
  </div>
</template>
