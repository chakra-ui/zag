import { createMachine } from "@zag-js/core"
import { isNumber } from "@zag-js/utils"
import { MachineContext, MachineState, UserDefinedContext } from "./transition.types"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      initial: ctx.mounted ? "entered" : "exited",
      context: {
        mounted: false,
        duration: 250,
        ...ctx,
      },
      computed: {
        enterDuration(ctx) {
          if (ctx.reduceMotion) return 0
          return isNumber(ctx.duration) ? ctx.duration : ctx.duration?.enter
        },
        exitDuration(ctx) {
          if (ctx.reduceMotion) return 0
          return isNumber(ctx.duration) ? ctx.duration : ctx.duration.exit
        },
      },
      on: {
        "MOUNTED.TOGGLE": {
          actions: ["togglePresence"],
        },
      },
      watch: {
        mounted: ["updatePresence"],
      },
      states: {
        exited: {
          tags: "exit",
          on: {
            MOUNT: {
              target: "pre-entering",
              actions: ["invokeOnEnter"],
            },
          },
        },
        "pre-entering": {
          tags: "exit",
          after: {
            NEXT_FRAME: "entering",
          },
        },
        entering: {
          tags: "enter",
          after: {
            ENTER_DURATION: {
              target: "entered",
              actions: ["invokeOnEntered"],
            },
          },
          on: {
            UNMOUNT: {
              target: "exited",
              actions: ["invokeOnExited"],
            },
          },
        },
        entered: {
          tags: "enter",
          on: {
            UNMOUNT: {
              target: "pre-exiting",
              actions: ["invokeOnExit"],
            },
          },
        },
        "pre-exiting": {
          tags: "exit",
          after: {
            NEXT_FRAME: "exiting",
          },
        },
        exiting: {
          tags: "exit",
          after: {
            EXIT_DURATION: {
              target: "exited",
              actions: ["invokeOnExited"],
            },
          },
          on: {
            MOUNT: {
              target: "entered",
              actions: ["invokeOnEntered"],
            },
          },
        },
      },
    },
    {
      delays: {
        ENTER_DURATION(ctx) {
          return ctx.enterDuration
        },
        EXIT_DURATION(ctx) {
          return ctx.exitDuration
        },
        NEXT_FRAME: 16.667,
      },
      actions: {
        updatePresence(ctx, _evt, { send }) {
          send(ctx.mounted ? "MOUNT" : "UNMOUNT")
        },
        togglePresence(ctx) {
          ctx.mounted = !ctx.mounted
        },
        invokeOnEnter(ctx) {
          ctx.onEnter?.()
        },
        invokeOnExit(ctx) {
          ctx.onExit?.()
        },
        invokeOnEntered(ctx) {
          ctx.onEntered?.()
        },
        invokeOnExited(ctx) {
          ctx.onExited?.()
        },
      },
    },
  )
}
