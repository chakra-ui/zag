import { createMachine } from "@zag-js/core"

export const machine = (props: { count?: number; onCount?: (count: number) => void }) => {
  return createMachine({
    context: { count: 0, ...props },
    initial: "idle",
    states: {
      idle: {
        on: {
          INCREMENT: {
            actions(ctx) {
              ctx.count += 1
              ctx.onCount?.(ctx.count)
            },
          },
          DECREMENT: {
            actions(ctx) {
              ctx.count -= 1
              ctx.onCount?.(ctx.count)
            },
          },
        },
      },
    },
  })
}
