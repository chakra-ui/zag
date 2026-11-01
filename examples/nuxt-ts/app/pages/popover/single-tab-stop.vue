<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/popover.css"

const service = useMachine(popover.machine, {
  id: useId(),
  modal: true,
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main class="popover">
    <div data-part="root">
      <button data-testid="button-before">Button :before</button>

      <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">Sort by</button>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <Presence data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
            <fieldset style="border: none; padding: 0">
              <label>
                <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" checked /> Name (A to Z)
              </label>
              <label>
                <input data-testid="radio-name-desc" type="radio" name="sort" value="name-desc" /> Name (Z to A)
              </label>
              <label> <input data-testid="radio-hours" type="radio" name="sort" value="hours" /> Hours </label>
            </fieldset>
          </Presence>
        </div>
      </Teleport>

      <button data-testid="button-after">Button :after</button>
    </div>
  </main>
</template>
