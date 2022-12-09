import * as menu from "@zag-js/menu"
import { menuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, onMounted, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "NestedMenu",
  setup() {
    const [state, send, machine] = useMachine(menu.machine({ id: "menu-1" }))

    const root = computed(() => menu.connect(state.value, send, normalizeProps))

    const [subState, subSend, subMachine] = useMachine(menu.machine({ id: "menu-2" }))

    const sub = computed(() => menu.connect(subState.value, subSend, normalizeProps))

    const [sub2State, sub2Send, sub2Machine] = useMachine(menu.machine({ id: "menu-3" }))

    const sub2 = computed(() => menu.connect(sub2State.value, sub2Send, normalizeProps))

    onMounted(() => {
      root.value.setChild(subMachine)
      sub.value.setParent(machine)
    })

    onMounted(() => {
      sub.value.setChild(sub2Machine)
      sub2.value.setParent(subMachine)
    })

    const triggerItemProps = computed(() => root.value.getTriggerItemProps(sub.value))
    const triggerItem2Props = computed(() => sub.value.getTriggerItemProps(sub2.value))

    const [level1, level2, level3] = menuData

    return () => {
      return (
        <>
          <main>
            <div>
              <button data-testid="trigger" {...root.value.triggerProps}>
                Click me
              </button>

              <Teleport to="body">
                <div {...root.value.positionerProps}>
                  <ul data-testid="menu" {...root.value.contentProps}>
                    {level1.map((item) => {
                      const props = item.trigger ? triggerItemProps.value : root.value.getItemProps({ id: item.id })
                      return (
                        <li key={item.id} data-testid={item.id} {...(props as any)}>
                          {item.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Teleport>

              <Teleport to="body">
                <div {...sub.value.positionerProps}>
                  <ul data-testid="more-tools-submenu" {...sub.value.contentProps}>
                    {level2.map((item) => {
                      const props = item.trigger ? triggerItem2Props.value : sub.value.getItemProps({ id: item.id })
                      return (
                        <li key={item.id} data-testid={item.id} {...(props as any)}>
                          {item.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Teleport>

              <Teleport to="body">
                <div {...sub2.value.positionerProps}>
                  <ul data-testid="open-nested-submenu" {...sub2.value.contentProps}>
                    {level3.map((item) => (
                      <li key={item.id} data-testid={item.id} {...sub2.value.getItemProps({ id: item.id })}>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </Teleport>
            </div>
          </main>

          <Toolbar
            controls={null}
            visualizer={
              <>
                <StateVisualizer state={state} />
                <StateVisualizer state={subState} />
                <StateVisualizer state={sub2State} />
              </>
            }
          />
        </>
      )
    }
  },
})
