import { useMachine } from "@ui-machines/react"
import * as Tabs from "@ui-machines/tabs"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"

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

export default function Page() {
  const controls = useControls({
    manual: { type: "boolean", defaultValue: false, label: "manual?" },
    loop: { type: "boolean", defaultValue: true, label: "loop?" },
  })
  const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
    context: {
      activationMode: controls.context.manual ? "manual" : "automatic",
      loop: controls.context.loop,
    },
  })

  const ref = useMount<HTMLDivElement>(send)

  const { getTabProps, getTabPanelProps, tablistProps, tabIndicatorProps } = Tabs.connect(state, send)

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />
      <div className="tabs">
        <div className="tabs__indicator" {...tabIndicatorProps} />
        <div ref={ref} {...tablistProps}>
          {tabsData.map((data) => (
            <button {...getTabProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
              {data.label}
            </button>
          ))}
        </div>
        {tabsData.map((data) => (
          <div {...getTabPanelProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
            <p>{data.content}</p>
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
