import { defineComponent, type PropType, type VNode } from "vue"

export const Show = defineComponent({
  name: "Show",
  props: {
    when: Boolean as PropType<boolean>,
  },
  setup(props, { slots }) {
    return () => (props.when ? slots.default?.() : null)
  },
})
