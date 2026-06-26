import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Alpine } from "alpinejs"
import { AlpineMachine } from "./machine"
import { normalizeProps } from "./normalize-props"

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
        Alpine.magic(_x_snake_case + _modifier + "_service", () => machine.service)
        Alpine.bind(el, {
          "x-data"() {
            return {
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
        const evaluateCollection = evaluateLater(expression)
        Alpine.bind(el, {
          "x-data"() {
            return {
              collection: null,
            }
          },
          "x-effect"() {
            evaluateCollection((options) => {
              ;(this as any).collection = component.collection?.(options)
            })
          },
        })
      } else if (value === "grid-collection") {
        const evaluateCollection = evaluateLater(expression)
        Alpine.bind(el, {
          "x-data"() {
            return {
              collection: null,
            }
          },
          "x-effect"() {
            evaluateCollection((options) => {
              ;(this as any).collection = component.gridCollection?.(options)
            })
          },
        })
      } else {
        const getPartProps = `get${value
          .split("-")
          .map((v) => v.at(0)?.toUpperCase() + v.substring(1).toLowerCase())
          .join("")}Props`

        const evaluateProps = evaluateLater(expression || "{}")
        const propsRef = Alpine.reactive({ value: {} as Record<string, any> })
        effect(() =>
          evaluateProps((props) =>
            Object.assign(propsRef.value, (Alpine.$data(el) as any)[_x_snake_case + _modifier][getPartProps](props)),
          ),
        )

        Alpine.bind(
          el,
          Object.fromEntries(
            Object.keys(propsRef.value).map((key) =>
              key === "x-html"
                ? ["x-html", () => propsRef.value["x-html"]]
                : key.startsWith("on")
                  ? ["@" + key.substring(2), (...args: any[]) => propsRef.value[key]?.(...args)]
                  : [":" + key, () => propsRef.value[key]],
            ),
          ),
        )
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
