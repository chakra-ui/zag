import type { Alpine } from "alpinejs"
import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { ListCollection, CollectionItem, CollectionOptions } from "@zag-js/collection"
import { AlpineMachine } from "./machine"
import { normalizeProps } from "./normalize-props"

// Dev only
import { highlightState } from "@zag-js/stringify-state"

export function createZagPlugin<T extends MachineSchema>(
  name: string,
  component: {
    machine: Machine<T>
    connect: (service: Service<T>, normalizeProps: NormalizeProps<PropTypes>) => any
    collection?: <T extends CollectionItem>(options: CollectionOptions<T>) => ListCollection<T>
  },
) {
  const underScore = name.replaceAll("-", "_")
  const api = `_${underScore}_api`

  return function (Alpine: Alpine) {
    Alpine.directive(name, (el, { expression, value }, { effect, evaluateLater, cleanup }) => {
      if (!value) {
        const evaluateProps = evaluateLater(expression)
        const propsRef = Alpine.reactive({ value: {} as T["props"] })
        evaluateProps((value: any) => (propsRef.value = value))
        const service = new AlpineMachine(component.machine, propsRef)
        const cleanupBinding = Alpine.bind(el, {
          "x-data"() {
            return {
              service, // dev only
              [api]: component.connect(service, normalizeProps),
              init() {
                queueMicrotask(() => {
                  effect(() => {
                    evaluateProps((value: any) => (propsRef.value = value))
                    this[api] = component.connect(service, normalizeProps)
                  })
                })
                service.init()
              },
              destroy() {
                service.destroy()
              },
            }
          },
        })
        cleanup(() => {
          cleanupBinding()
        })
      } else if (value === "collection") {
        const evaluateCollection = evaluateLater(expression)
        const cleanupBinding = Alpine.bind(el, {
          "x-data"() {
            return {
              get collection() {
                let options = {} as CollectionOptions<T>
                evaluateCollection((value: any) => (options = value))
                return component.collection?.(options)
              },
            }
          },
        })
        cleanup(() => {
          cleanupBinding()
        })
      } else {
        const getProps = `get${value
          .split("-")
          .map((v) => v.at(0)?.toUpperCase() + v.substring(1).toLowerCase())
          .join("")}Props`
        const evaluateProps = expression ? evaluateLater(expression) : null
        let cleanupBinding = () => {}
        effect(() => {
          cleanupBinding()
          let props = {}
          evaluateProps && evaluateProps((value: any) => (props = value))
          cleanupBinding = Alpine.bind(el, (Alpine.$data(el) as any)[api][getProps](props))
        })
        cleanup(() => {
          cleanupBinding()
        })
      }
    }).before("bind")

    Alpine.magic(
      name
        .split("-")
        .map((str, i) => (i === 0 ? str : str.at(0)?.toUpperCase() + str.substring(1).toLowerCase()))
        .join(""),
      (el) => (Alpine.$data(el) as any)[api],
    )

    // Dev only
    Alpine.magic("highlightState", (el) => {
      const { service } = Alpine.$data(el) as any
      return ({ omit, context }: { omit?: string[]; context?: Array<keyof T["context"]> }) =>
        highlightState(
          {
            state: service.state.get(),
            event: service.event.current(),
            previouseEvent: service.event.previous(),
            context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
          },
          omit,
        )
    })
  }
}
