import type { Alpine, ElementWithXAttributes } from "alpinejs"
import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { ListCollection, CollectionItem, CollectionOptions } from "@zag-js/collection"
import { AlpineMachine, normalizeProps } from "./lib"

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
  const bindings = `_${underScore}_bindings`

  return function (Alpine: Alpine) {
    Alpine.directive(name, (el, { expression, value }, { evaluateLater, evaluate }) => {
      if (!value) {
        const service = new AlpineMachine(component.machine, evaluateLater(expression))
        Alpine.bind(el, {
          "x-data"() {
            return {
              [api]: component.connect(service, normalizeProps),
              [bindings]: [] as {
                el: ElementWithXAttributes
                getProps: string
                props: any
                cleanup: () => void
              }[],
              init() {
                queueMicrotask(() => {
                  Alpine.effect(() => {
                    this[api] = component.connect(service, normalizeProps)

                    for (const binding of this[bindings]) {
                      // 'spread props' by cleaning up and re-binding
                      binding.cleanup()
                      binding.cleanup = Alpine.bind(binding.el, this[api][binding.getProps](binding.props))
                    }
                  })
                })
                service.init()
              },
              destroy() {
                for (const binding of this[bindings]) {
                  binding.cleanup()
                }
                service.destroy()
              },
            }
          },
        })
      } else if (value === "collection") {
        Alpine.bind(el, {
          "x-data"() {
            return {
              get collection() {
                return component.collection?.(evaluate(expression) as any)
              },
            }
          },
        })
      } else {
        ;(Alpine.$data(el) as any)[bindings].push({
          el,
          getProps: `get${value
            .split("-")
            .map((v) => v.at(0)?.toUpperCase() + v.substring(1).toLowerCase())
            .join("")}Props`,
          get props() {
            return expression ? evaluate(expression) : {}
          },
          cleanup: () => {},
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
