import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Alpine } from "alpinejs"
import { AlpineMachine } from "./machine"
import { normalizeProps } from "./normalize-props"

function useEvaluator<T, R>(evaluateLater: (callback: (value: T) => void) => void) {
  return (fn: (value: T) => R) => {
    let result
    evaluateLater((value) => (result = fn(value)))
    return result as R
  }
}

export function usePlugin<T extends MachineSchema>(
  name: string,
  component: {
    machine: Machine<T>
    connect: (service: Service<T>, normalizeProps: NormalizeProps<PropTypes>) => any
    collection?: (options: any) => any
    gridCollection?: (options: any) => any
  },
) {
  const _x_snake_case = "_x_" + name.replaceAll("-", "_")

  return function (Alpine: Alpine) {
    Alpine.directive(name, (el, { expression, value, modifiers }, { effect, evaluateLater }) => {
      const _modifier = modifiers.at(0) ? "_" + modifiers.at(0) : ""
      if (!value) {
        const evaluateProps = evaluateLater<Partial<T["props"]> | (() => Partial<T["props"]>)>(expression)
        const machine = new AlpineMachine(component.machine, useEvaluator(evaluateProps))
        Alpine.bind(el, {
          "x-data"() {
            return {
              [_x_snake_case + _modifier + "_service"]: machine.service, // dev only, for state visualization
              [_x_snake_case + _modifier]: component.connect(machine.service, normalizeProps),
              init() {
                queueMicrotask(() => {
                  effect(() => {
                    this[_x_snake_case + _modifier] = component.connect(machine.service, normalizeProps)
                  })
                })
                machine.init()
              },
              destroy() {
                machine.destroy()
              },
            }
          },
        })
      } else if (value === "collection") {
        const useCollection = useEvaluator(evaluateLater(expression))
        Alpine.bind(el, {
          "x-data"() {
            return {
              get collection() {
                return useCollection((options) => component.collection?.(options))
              },
            }
          },
        })
      } else if (value === "grid-collection") {
        const useCollection = useEvaluator(evaluateLater(expression))
        Alpine.bind(el, {
          "x-data"() {
            return {
              get collection() {
                return useCollection((options) => component.gridCollection?.(options))
              },
            }
          },
        })
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
