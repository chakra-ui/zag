import { cx } from "styled-system/css"
import { Arrow, Tile, type TileProps } from "./bento"
import { dialogButton, menu, menuHighlight, menuItem } from "./bento.css"
import * as d from "./deep.css"
import { h2, section, wrap } from "./home.css"

const sharedMenus = ["Menu", "Select", "Combobox"]
const miniItems = ["One", "Two", "Three"]

function SharedStyles() {
  return (
    <div className={d.stylesScene}>
      <div className={d.miniMenus}>
        {sharedMenus.map((name) => (
          <div key={name} className={d.miniMenu}>
            <span className={d.miniLabel}>{name}</span>
            <div className={menu({ size: "mini" })}>
              <span
                className={menuHighlight({ mini: true, animation: "step" })}
              />
              {miniItems.map((item) => (
                <span key={item} className={menuItem({ mini: true })}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <code className={d.codeChip}>
        [data-highlighted] {"{ background: var(--mint) }"}
      </code>
    </div>
  )
}

function WiredMachines() {
  return (
    <div className={d.wireScene}>
      <div className={d.wireMenu}>
        <span className={menuHighlight({ selected: 2 })} />
        <span className={menuItem()}>Rename</span>
        <span className={menuItem()}>Duplicate</span>
        <span className={menuItem({ danger: true })}>Delete…</span>
      </div>
      <Arrow width={48} className={d.wire} />
      <div className={d.confirmDialog}>
        <p className={d.confirmTitle}>Delete “Roadmap”?</p>
        <div className={d.confirmActions}>
          <span className={dialogButton()}>Cancel</span>
          <span className={dialogButton({ danger: true })}>Delete</span>
        </div>
      </div>
    </div>
  )
}

function ControlledState() {
  return (
    <div className={d.controlScene}>
      <code className={d.codeCard}>
        api.setOpen(<span className={d.codeTrue}>true</span>)
        <span className={d.caret} />
      </code>
      <div className={d.shareStack}>
        <span className={dialogButton()}>Share</span>
        <div className={d.popover}>
          <p className={d.popoverTitle}>Invite people</p>
          <span className={d.popoverInput}>name@team.com</span>
        </div>
      </div>
    </div>
  )
}

function CustomMachine() {
  return (
    <div className={d.machineScene}>
      <div className={d.chart}>
        <span className={d.chartNode()}>idle</span>
        <span className={d.chartEdge} />
        <span className={d.chartNode()}>loading</span>
        <span className={d.chartEdge} />
        <span className={d.chartNode({ final: true })}>success</span>
        <span className={d.chartToken} />
      </div>
      <code className={d.codeChip}>
        createMachine({"{ initialState, states }"})
      </code>
    </div>
  )
}

const tiles: TileProps[] = [
  {
    title: "Write a style once",
    desc: "Menus, selects and comboboxes share item states, so one rule styles them all",
    art: <SharedStyles />,
  },
  {
    title: "Wire components together",
    desc: "Connect machines with callbacks. Here, a menu item opens a confirm dialog",
    art: <WiredMachines />,
  },
  {
    title: "Drive it from your code",
    desc: "Control the open state yourself, or call the same methods the keyboard uses",
    art: <ControlledState />,
  },
  {
    title: "Write your own machine",
    desc: "Build what we don't ship with @zag-js/core, the same tool behind every Zag component",
    art: <CustomMachine />,
  },
]

export function DeepSection() {
  return (
    <section className={cx(wrap, section)} aria-label="Go deeper">
      <h2 className={h2}>Simple to start. Deep when you need it</h2>
      <p className={d.lede}>
        Most apps only spread the props. When you need more control, every layer
        is open to you
      </p>
      <div className={d.grid}>
        {tiles.map((tile) => (
          <Tile key={tile.title} {...tile} />
        ))}
      </div>
    </section>
  )
}
