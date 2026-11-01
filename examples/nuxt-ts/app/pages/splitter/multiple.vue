<script setup lang="ts">
import "@styles/splitter.css"
</script>

<template>
  <main>
    <Splitter
      orientation="horizontal"
      :default-size="[20, 60, 20]"
      :panels="[
        { id: 'a', order: 0, minSize: 20 },
        { id: 'b', order: 1, collapsible: true },
        { id: 'c', order: 2, minSize: 20 },
      ]"
    >
      <template #default="{ api: a }">
        <div v-bind="a.getPanelProps({ id: 'a' })">Left</div>
        <div v-bind="a.getResizeTriggerProps({ id: 'a:b' })" />
        <div v-bind="a.getPanelProps({ id: 'b' })">
          <Splitter
            orientation="vertical"
            :panels="[
              { id: 'b1', order: 0 },
              { id: 'b2', order: 1, collapsible: true },
            ]"
          >
            <template #default="{ api: b }">
              <div v-bind="b.getPanelProps({ id: 'b1' })">top</div>
              <div v-bind="b.getResizeTriggerProps({ id: 'b1:b2' })" />
              <div v-bind="b.getPanelProps({ id: 'b2' })">
                <Splitter
                  orientation="horizontal"
                  :panels="[
                    { id: 'b21', order: 0 },
                    { id: 'b22', order: 1, collapsible: true },
                  ]"
                >
                  <template #default="{ api: c }">
                    <div v-bind="c.getPanelProps({ id: 'b21' })">left</div>
                    <div v-bind="c.getResizeTriggerProps({ id: 'b21:b22' })" />
                    <div v-bind="c.getPanelProps({ id: 'b22' })">right</div>
                  </template>
                </Splitter>
              </div>
            </template>
          </Splitter>
        </div>
        <div v-bind="a.getResizeTriggerProps({ id: 'b:c' })" />
        <div v-bind="a.getPanelProps({ id: 'c' })">right</div>
      </template>
    </Splitter>
  </main>
</template>
