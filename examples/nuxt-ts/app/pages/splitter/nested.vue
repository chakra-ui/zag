<script setup lang="ts">
import * as splitter from "@zag-js/splitter"
import { SplitterApiKey } from "~/components/Splitter.vue"

const registry = splitter.registry({
  hitAreaMargins: { coarse: 15, fine: 8 },
})
</script>

<template>
  <main>
    <Splitter
      orientation="horizontal"
      :default-size="[20, 60, 20]"
      :panels="[{ id: 'left' }, { id: 'center' }, { id: 'right' }]"
      :registry="registry"
    >
      <template #default="{ api: hApi }">
        <div v-bind="hApi.getPanelProps({ id: 'left' })">
          <div style="background: #f0f8ff; padding: 20px; width: 100%; height: 100%">
            <h3>Left Panel</h3>
          </div>
        </div>
        <div v-bind="hApi.getResizeTriggerProps({ id: 'left:center' })"></div>
        <div v-bind="hApi.getPanelProps({ id: 'center' })">
          <Splitter
            orientation="vertical"
            :panels="[{ id: 'top' }, { id: 'middle' }, { id: 'bottom' }]"
            :registry="registry"
          >
            <template #default="{ api: vApi }">
              <div v-bind="vApi.getPanelProps({ id: 'top' })">
                <div style="background: #fff0f5; padding: 20px; width: 100%; height: 100%">
                  <h3>Top Panel</h3>
                </div>
              </div>
              <div v-bind="vApi.getResizeTriggerProps({ id: 'top:middle' })"></div>
              <div v-bind="vApi.getPanelProps({ id: 'middle' })">
                <div style="background: #f0fff0; padding: 20px; width: 100%; height: 100%">
                  <h3>Middle Panel</h3>
                </div>
              </div>
              <div v-bind="vApi.getResizeTriggerProps({ id: 'middle:bottom' })"></div>
              <div v-bind="vApi.getPanelProps({ id: 'bottom' })">
                <div style="background: #fffacd; padding: 20px; width: 100%; height: 100%">
                  <h3>Bottom Panel</h3>
                </div>
              </div>
            </template>
          </Splitter>
        </div>
        <div v-bind="hApi.getResizeTriggerProps({ id: 'center:right' })"></div>
        <div v-bind="hApi.getPanelProps({ id: 'right' })">
          <div style="background: #f5f5dc; padding: 20px; width: 100%; height: 100%">
            <h3>Right Panel</h3>
          </div>
        </div>
      </template>
    </Splitter>

    <p style="margin-top: 20px">
      Drag at the intersection of resize handles to resize both directions simultaneously.
    </p>
  </main>
</template>
