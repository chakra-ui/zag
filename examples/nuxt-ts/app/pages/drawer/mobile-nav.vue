<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "../../../../shared/styles/drawer-mobile-nav.module.css"

const NAV_ITEMS = [
  { href: "#", label: "Overview" },
  { href: "#", label: "Components" },
  { href: "#", label: "Utilities" },
  { href: "#", label: "Releases" },
]

const LONG_LIST = Array.from({ length: 50 }, (_, i) => ({
  href: "#",
  label: `Item ${i + 1}`,
}))

const service = useMachine(drawer.machine, { id: useId() })

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main :class="styles.page">
    <header :class="styles.header">
      <button :class="styles.menuButton" v-bind="api.getTriggerProps()">Open mobile menu</button>
    </header>

    <Presence :class="styles.backdrop" v-bind="api.getBackdropProps()" />
    <div :class="styles.positioner" v-bind="api.getPositionerProps()">
      <Presence :class="styles.popup" v-bind="api.getContentProps({ draggable: false })">
        <nav :class="styles.panel">
          <div :class="styles.panelHeader">
            <div aria-hidden :class="styles.headerSpacer" />
            <div :class="styles.handle" v-bind="api.getGrabberProps()">
              <div :class="styles.handleIndicator" v-bind="api.getGrabberIndicatorProps()" />
            </div>
            <button type="button" :class="styles.closeButton" v-bind="api.getCloseTriggerProps()" aria-label="Close menu">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M0.75 0.75L6 6M11.25 11.25L6 6M6 6L0.75 11.25M6 6L11.25 0.75"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <h2 v-bind="api.getTitleProps()" :class="styles.title">Menu</h2>
          <p v-bind="api.getDescriptionProps()" :class="styles.description">
            Scroll the long list. Flick down from the top to dismiss.
          </p>

          <div :class="styles.scrollArea">
            <ul :class="styles.navList">
              <li v-for="item in NAV_ITEMS" :key="item.label" :class="styles.navItem">
                <a :class="styles.navLink" :href="item.href" @click.prevent="api.setOpen(false)">{{ item.label }}</a>
              </li>
            </ul>

            <ul :class="styles.longList" aria-label="Long list">
              <li v-for="item in LONG_LIST" :key="item.label" :class="styles.navItem">
                <a :class="styles.navLink" :href="item.href" @click.prevent="api.setOpen(false)">{{ item.label }}</a>
              </li>
            </ul>
          </div>
        </nav>
      </Presence>
    </div>
  </main>
</template>
