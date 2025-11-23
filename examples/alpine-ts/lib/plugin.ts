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
  const _x_snake_case = "_x_" + name.replaceAll("-", "_")

  return function (Alpine: Alpine) {
    Alpine.directive(name, (el, { expression, value, modifiers }, { cleanup, effect, evaluateLater }) => {
      const _modifier = modifiers.at(0) ? "_" + modifiers.at(0) : ""
      if (!value) {
        const evaluateProps = evaluateLater(expression) as any
        const service = useMachine(component.machine, evaluateProps)
        Alpine.bind(el, {
          "x-data"() {
            return {
              [_x_snake_case + _modifier + "_service"]: service, // dev only, for state visualization
              [_x_snake_case + _modifier]: component.connect(service, normalizeProps),
              init() {
                queueMicrotask(() => {
                  effect(() => {
                    this[_x_snake_case + _modifier] = component.connect(service, normalizeProps)
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
        const ref = Alpine.reactive({ ...(Alpine.$data(el) as any)[_x_snake_case + _modifier][getProps](props) })

        const binding: Record<string, () => any> = {}
        for (const prop in ref) {
          binding[prop] = (...args: any[]) => ref[prop]?.(...args)
        }
        Alpine.bind(el, binding)

        effect(() => {
          let props = {}
          evaluateProps && evaluateProps((value: any) => (props = value))
          const next = (Alpine.$data(el) as any)[_x_snake_case + _modifier][getProps](props)
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
      (el) => {
        return (modifier?: string) => (Alpine.$data(el) as any)[_x_snake_case + (modifier ? "_" + modifier : "")]
      },
    )
  }
}
