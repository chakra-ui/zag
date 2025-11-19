import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Alpine } from "alpinejs"
import { useMachine } from "./machine"
import { normalizeProps } from "./normalize-props"

export function usePlugin<T extends MachineSchema>(
  name: string,
  component: {
    machine: Machine<T>
    connect: (service: Service<T>, normalizeProps: NormalizeProps<PropTypes>) => any
    collection?: (options: any) => any
  },
) {
  const underscore = name.replaceAll("-", "_")
  const serviceName = `_x_${underscore}_service` as const
  const api = `_x_${underscore}_api` as const

  return function (Alpine: Alpine) {
    Alpine.directive(name, (el, { expression, value }, { cleanup, effect, evaluateLater }) => {
      if (!value) {
        const evaluateProps = evaluateLater(expression) as any
        const service = useMachine(component.machine, evaluateProps)
        Alpine.bind(el, {
          "x-data"() {
            return {
              [serviceName]: service, // dev only, for state visualization
              [api]: component.connect(service, normalizeProps),
              init() {
                queueMicrotask(() => {
                  effect(() => {
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
      } else if (value === "collection") {
        const evaluateCollection = evaluateLater(expression)
        const cleanupBinding = Alpine.bind(el, {
          "x-data"() {
            return {
              get collection() {
                let options: any = {}
                evaluateCollection((value) => (options = value))
                return component.collection?.(options)
              },
            }
          },
        })
        cleanup(() => cleanupBinding())
      } else {
        const getProps = `get${value
          .split("-")
          .map((v) => v.at(0)?.toUpperCase() + v.substring(1).toLowerCase())
          .join("")}Props`
        const evaluateProps = expression ? evaluateLater(expression) : null

        let props = {}
        evaluateProps && evaluateProps((value: any) => (props = value))
        const ref = Alpine.reactive({ ...(Alpine.$data(el) as any)[api][getProps](props) })

        const binding: Record<string, () => any> = {}
        for (const prop in ref) {
          binding[prop] = (...args: any[]) => ref[prop]?.(...args)
        }
        Alpine.bind(el, binding)

        effect(() => {
          let props = {}
          evaluateProps && evaluateProps((value: any) => (props = value))
          const next = (Alpine.$data(el) as any)[api][getProps](props)
          for (const prop in next) {
            if (prop.startsWith("@") || next[prop]() !== ref[prop]()) {
              ref[prop] = next[prop]
            }
          }
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
  }
}
