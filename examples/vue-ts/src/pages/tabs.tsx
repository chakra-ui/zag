import { tabs } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { useControls } from "../hooks/use-controls"

const tabsData = [
  {
    id: "nils",
    label: "Nils Frahm",
    content: `
    Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining
            classical and electronic music and for an unconventional approach to the piano in which he mixes a grand
            piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
    `,
  },
  {
    id: "agnes",
    label: "Agnes Obel",
    content: `
    Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first album, Philharmonics, was released by
            PIAS Recordings on 4 October 2010 in Europe. Philharmonics was certified gold in June 2011 by the Belgian
            Entertainment Association (BEA) for sales of 10,000 Copies.
    `,
  },
  {
    id: "joke",
    label: "Joke",
    content: `
    Fear of complicated buildings: A complex complex complex.
    `,
  },
]

export default defineComponent({
  name: "Tabs",
  setup() {
    const { context, ui: PropertyControls } = useControls({
      manual: { type: "boolean", defaultValue: false, label: "manual?" },
      loop: { type: "boolean", defaultValue: true, label: "loop?" },
    })

    const [state, send] = useMachine(tabs.machine.withContext({ value: "nils" }), {
      context: {
        activationMode: context.value.manual ? "manual" : "automatic",
        loop: context.value.loop,
      },
    })

    const ref = useMount(send)
    const machineState = computed(() => tabs.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div style={{ width: "100%" }}>
          <PropertyControls />
          <div class="tabs">
            <div class="tabs__indicator" {...machineState.value.tabIndicatorProps} />
            <div ref={ref} {...machineState.value.tablistProps}>
              {tabsData.map((data) => (
                <button
                  {...machineState.value.getTabProps({ value: data.id })}
                  key={data.id}
                  data-testid={`${data.id}-tab`}
                >
                  {data.label}
                </button>
              ))}
            </div>
            {tabsData.map((data) => (
              <div
                {...machineState.value.getTabPanelProps({ value: data.id })}
                key={data.id}
                data-testid={`${data.id}-tab-panel`}
              >
                <p>{data.content}</p>
              </div>
            ))}
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
