<script lang="ts" setup>
import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card-viewport.css"

const people = [
  { value: "ada", name: "Ada Lovelace", bio: "Wrote the first published program." },
  { value: "grace", name: "Grace Hopper", bio: "Built the first compiler, and popularized the word bug in computing." },
  { value: "alan", name: "Alan Turing", bio: "Defined computation." },
]

const getPerson = (value: string) => people.find((person) => person.value === value)!

const service = useMachine(hoverCard.machine, {
  id: useId(),
  positioning: { placement: "bottom" },
})

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card animated-triggers">
    <p>
      Early computing owes a lot to
      <span v-for="(person, index) in people" :key="person.value">
        <a href="#" v-bind="api.getTriggerProps({ value: person.value })">{{ person.name }}</a
        >{{ index < people.length - 1 ? ", " : "." }}
      </span>
    </p>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </Presence>
        <Presence v-bind="api.getViewportProps()">
          <Presence v-for="value in api.getContentValues()" :key="value" v-bind="api.getContentProps({ value })">
            <strong>{{ getPerson(value).name }}</strong>
            <p>{{ getPerson(value).bio }}</p>
          </Presence>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
