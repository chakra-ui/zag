<script lang="ts">
import * as menu from "@zag-js/menu"
import type { InjectionKey, ComputedRef } from "vue"

type MenuApi = menu.Api<any>

// Module-level keys — shared across all NestedMenu instances
const MenuApiKey: InjectionKey<ComputedRef<MenuApi>> = Symbol("MenuApi") as any
const MenuServiceKey: InjectionKey<menu.Service> = Symbol("MenuService") as any
</script>

<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, onMounted, useId, provide, inject } from "vue"

const parentApi = inject(MenuApiKey, undefined)
const parentService = inject(MenuServiceKey, undefined)

const service = useMachine(menu.machine, { id: useId() })
const api = computed(() => menu.connect(service, normalizeProps))

onMounted(() => {
  if (!parentService || !parentApi) return
  parentApi.value.setChild(service)
  api.value.setParent(parentService)
})

provide(MenuApiKey, api)
provide(MenuServiceKey, service)

const triggerItemProps = computed(() => {
  if (!parentApi) return undefined
  return parentApi.value.getTriggerItemProps(api.value)
})

const isSubmenu = !!parentApi
</script>

<template>
  <slot :api="api" :trigger-item-props="triggerItemProps" :is-submenu="isSubmenu" />
</template>
