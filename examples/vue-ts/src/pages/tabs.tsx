import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { tabs } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Tabs",
  setup() {
    const [state, send] = useMachine(
      tabs.machine.withContext({
        activeTabId: "nils",
        activationMode: "manual",
      }),
    )

    const ref = useMount(send)

    const mp = computed(() => tabs.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div style={{ width: "100%" }}>
          <div className="tabs">
            <div className="tabs__indicator" {...mp.value.tabIndicatorProps} />
            <div ref={ref} {...mp.value.tablistProps}>
              <button {...mp.value.getTabProps({ uid: "nils" })}>Nils Frahm</button>
              <button {...mp.value.getTabProps({ uid: "agnes" })}>Agnes Obel</button>
              <button {...mp.value.getTabProps({ uid: "complex" })}>Joke</button>
            </div>
            <div {...mp.value.getTabPanelProps({ uid: "nils" })}>
              <p>
                Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining
                classical and electronic music and for an unconventional approach to the piano in which he mixes a grand
                piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
              </p>
            </div>
            <div {...mp.value.getTabPanelProps({ uid: "agnes" })}>
              <p>
                Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first album, Philharmonics, was released
                by PIAS Recordings on 4 October 2010 in Europe. Philharmonics was certified gold in June 2011 by the
                Belgian Entertainment Association (BEA) for sales of 10,000 Copies.
              </p>
            </div>
            <div {...mp.value.getTabPanelProps({ uid: "complex" })}>
              <p>Fear of complicated buildings:</p>
              <p>A complex complex complex.</p>
            </div>
          </div>

          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
