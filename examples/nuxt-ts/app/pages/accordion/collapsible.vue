<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"
import "@styles/accordion.css"
import "@styles/collapsible.css"

const items = [
  {
    value: "home",
    title: "Lorem Ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Proin in nisi elementum, egestas libero sed, pretium mi.",
  },
  {
    value: "about",
    title: "Cake Ipsum",
    description:
      "Cake icing topping. I love sugar plum I love oat cake sweet. I love oat cake sweet. I love oat cake sweet.",
  },
  {
    value: "contact",
    title: "Hummingbird Ipsum",
    description:
      "The humble cupcake. Tiramisu gingerbread jujubes sugar plum. Sweet roll sweet roll I love marzipan I love fruitcake.",
  },
]

const service = useMachine(accordion.machine, {
  id: useId(),
  multiple: true,
  defaultValue: ["home"],
})

const api = computed(() => accordion.connect(service, normalizeProps))

const getContentProps = (value: string) => {
  const { hidden: _, ...rest } = api.value.getItemContentProps({ value })
  return rest
}
</script>

<template>
  <main class="accordion">
    <div v-bind="api.getRootProps()">
      <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
        <h3 v-bind="api.getItemHeaderProps({ value: item.value })">
          <button v-bind="api.getItemTriggerProps({ value: item.value })">
            {{ item.title }}
            <div v-bind="api.getItemIndicatorProps({ value: item.value })">
              <ArrowRight />
            </div>
          </button>
        </h3>
        <AccordionCollapsibleContent
          v-bind="getContentProps(item.value)"
          :open="api.getItemState({ value: item.value }).expanded"
        >
          <p>{{ item.description }}</p>
        </AccordionCollapsibleContent>
      </div>
    </div>
  </main>
</template>
