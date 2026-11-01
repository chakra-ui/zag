<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const service1 = useMachine(popover.machine, {
  id: useId(),
  modal: false,
})
const api1 = computed(() => popover.connect(service1, normalizeProps))

const service2 = useMachine(popover.machine, {
  id: useId(),
  modal: false,
})
const api2 = computed(() => popover.connect(service2, normalizeProps))

const service3 = useMachine(popover.machine, {
  id: useId(),
  modal: false,
})
const api3 = computed(() => popover.connect(service3, normalizeProps))
</script>

<template>
  <div>
    <button data-testid="popover-trigger-1" v-bind="api1.getTriggerProps()">Open First Popover</button>

    <Teleport to="#teleports">
      <div v-bind="api1.getPositionerProps()">
        <div data-testid="popover-content-1" class="popover-content" v-bind="api1.getContentProps()">
          <div v-bind="api1.getArrowProps()">
            <div v-bind="api1.getArrowTipProps()" />
          </div>
          <div data-testid="popover-title-1" v-bind="api1.getTitleProps()">First Popover</div>
          <div data-part="body" data-testid="popover-body-1">
            <p>This is the first level popover in the dialog.</p>
            <button data-testid="popover-trigger-2" v-bind="api2.getTriggerProps()">Open Second Popover</button>
            <button data-testid="popover-close-button-1" v-bind="api1.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="api2.getPositionerProps()">
        <div data-testid="popover-content-2" class="popover-content" v-bind="api2.getContentProps()">
          <div v-bind="api2.getArrowProps()">
            <div v-bind="api2.getArrowTipProps()" />
          </div>
          <div data-testid="popover-title-2" v-bind="api2.getTitleProps()">Second Popover</div>
          <div data-part="body" data-testid="popover-body-2">
            <p>This is the second level popover.</p>
            <input data-testid="input-2" placeholder="Enter text here" />
            <button data-testid="popover-trigger-3" v-bind="api3.getTriggerProps()">Open Third Popover</button>
            <button data-testid="popover-close-button-2" v-bind="api2.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="api3.getPositionerProps()">
        <div data-testid="popover-content-3" class="popover-content" v-bind="api3.getContentProps()">
          <div v-bind="api3.getArrowProps()">
            <div v-bind="api3.getArrowTipProps()" />
          </div>
          <div data-testid="popover-title-3" v-bind="api3.getTitleProps()">Third Popover</div>
          <div data-part="body" data-testid="popover-body-3">
            <p>This is the deepest level popover.</p>
            <a href="#" data-testid="focusable-link-3">Focusable Link</a>
            <button data-testid="popover-close-button-3" v-bind="api3.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
