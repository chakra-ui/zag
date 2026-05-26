<script setup lang="ts"></script>

<template>
  <main>
    <div>
      <!-- Parent menu -->
      <NestedMenu v-slot="{ api: root }">
        <button v-bind="root.getTriggerProps()">File <span v-bind="root.getIndicatorProps()">▾</span></button>

        <Teleport to="#teleports">
          <div v-bind="root.getPositionerProps()">
            <ul data-testid="menu" v-bind="root.getContentProps()">
              <li v-bind="root.getItemProps({ value: 'new-file' })">New File</li>
              <li v-bind="root.getItemProps({ value: 'open' })">Open...</li>

              <!-- Submenu: Share -->
              <NestedMenu v-slot="{ api: share, triggerItemProps }">
                <li v-bind="triggerItemProps">Share →</li>
                <Teleport to="#teleports">
                  <div v-bind="share.getPositionerProps()">
                    <ul data-testid="share-submenu" v-bind="share.getContentProps()">
                      <li v-bind="share.getItemProps({ value: 'email' })">Email</li>
                      <li v-bind="share.getItemProps({ value: 'message' })">Message</li>
                      <li v-bind="share.getItemProps({ value: 'airdrop' })">AirDrop</li>
                    </ul>
                  </div>
                </Teleport>
              </NestedMenu>

              <!-- Submenu: Export -->
              <NestedMenu v-slot="{ api: exp, triggerItemProps: exportTrigger }">
                <li v-bind="exportTrigger">Export →</li>
                <Teleport to="#teleports">
                  <div v-bind="exp.getPositionerProps()">
                    <ul data-testid="export-submenu" v-bind="exp.getContentProps()">
                      <li v-bind="exp.getItemProps({ value: 'pdf' })">PDF</li>
                      <li v-bind="exp.getItemProps({ value: 'png' })">PNG</li>
                      <li v-bind="exp.getItemProps({ value: 'svg' })">SVG</li>
                    </ul>
                  </div>
                </Teleport>
              </NestedMenu>

              <li v-bind="root.getItemProps({ value: 'print' })">Print...</li>
            </ul>
          </div>
        </Teleport>
      </NestedMenu>
    </div>
  </main>
</template>
