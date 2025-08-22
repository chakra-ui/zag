<script lang="ts" setup>
import { createMachine } from "@zag-js/core"
import { useMachine } from "@zag-js/vue"

const service = useMachine(
  createMachine<any>({
    props({ props }) {
      return {
        ...props,
        value: 10,
      }
    },
    context({ bindable, prop }) {
      return {
        count: bindable<number>(() => ({
          defaultValue: prop("value"),
        })),
      }
    },

    watch({ track, context }) {
      track([() => context.get("count")], () => {
        console.log("count changed", context.get("count"))
      })
    },

    initialState() {
      return "closed"
    },
    states: {
      closed: {
        on: {
          INC: {
            actions: ["increment"],
          },
        },
      },
    },
    implementations: {
      actions: {
        increment({ context }) {
          context.set("count", (prev: number) => prev + 1)
        },
      },
    },
  }),
)
</script>

<template>
  <main>
    <button @click="service.send({ type: 'INC' })">Increment</button>
    <p>{{ service.context.get("count") }}</p>
  </main>
</template>
