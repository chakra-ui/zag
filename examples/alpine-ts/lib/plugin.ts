import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Alpine } from "alpinejs"
import { AlpineMachine } from "./machine"
import { normalizeProps } from "./normalize-props"

function useEvaluator<T>(evaluator: (callback: (value: T) => void) => void) {
  return <R>(fn: (value: T) => R) => {
    let result
    evaluator((value) => (result = fn(value)))
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
        const userPropsRef = Alpine.reactive({ value: {} as Partial<T["props"]> | (() => Partial<T["props"]>) })
        effect(() => {
          evaluateProps((props) => (userPropsRef.value = props))
        })
        const machine = new AlpineMachine(component.machine, userPropsRef)
        Alpine.bind(el, {
          "x-data"() {
            return {
              [_x_snake_case + _modifier + "_service"]: machine.service, // dev only, for state visualization
              [_x_snake_case + _modifier]: component.connect(machine.service, normalizeProps),
              init() {
                machine.init()
              },
              destroy() {
                machine.destroy()
              },
            }
          },
          "x-effect"() {
            ;(this as any)[_x_snake_case + _modifier] = component.connect(machine.service, normalizeProps)
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
        const getPartProps = `get${value
          .split("-")
          .map((v) => v.at(0)?.toUpperCase() + v.substring(1).toLowerCase())
          .join("")}Props`

        const usePartProps = useEvaluator(evaluateLater(expression || "{}"))
        const propsRef = Alpine.reactive(
          usePartProps((props) => (Alpine.$data(el) as any)[_x_snake_case + _modifier][getPartProps](props)),
        ) as Record<string, any>

        Alpine.bind(
          el,
          Object.keys(propsRef).reduce((acc: Record<string, any>, prop) => {
            const { key, value } =
              prop === "x-html"
                ? { key: "x-html", value: () => propsRef[prop] }
                : prop.startsWith("on")
                  ? { key: "@" + prop.substring(2), value: (...args: any[]) => propsRef[prop]?.(...args) }
                  : { key: ":" + prop, value: () => propsRef[prop] }
            acc[key] = value
            return acc
          }, {}),
        )
        effect(() => {
          Object.assign(
            propsRef,
            usePartProps((props) =>
              (Alpine.$data(el) as any)[_x_snake_case + _modifier][getPartProps](props),
            ) as Record<string, any>,
          )
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
