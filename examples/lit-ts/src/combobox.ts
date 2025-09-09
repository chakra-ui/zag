import { spread } from "@open-wc/lit-helpers"
import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import style from "@zag-js/shared/src/css/combobox.css?inline"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { matchSorter } from "match-sorter"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "./lib"

interface Item {
  code: string
  label: string
}

@customElement("combobox-element")
export class Combobox extends Component<combobox.Api> {
  options: Item[] = comboboxData.slice()

  getCollection(items: Item[]) {
    return combobox.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    })
  }

  initMachine() {
    const self = this
    return new VanillaMachine(combobox.machine, {
      id: this.id,
      getRootNode: () => this.renderRoot,
      get collection() {
        return self.getCollection(self.options || comboboxData)
      },
      onOpenChange: () => {
        self.options = comboboxData
      },
      onInputValueChange: ({ inputValue }) => {
        const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
        self.options = filtered.length > 0 ? filtered : comboboxData
      },
    })
  }

  initApi() {
    return combobox.connect(this.machine.service, normalizeProps)
  }

  static styles = unsafeCSS(style)

  override render() {
    return html`
      <div ${spread(this.api.getRootProps())} class="combobox">
        <label ${spread(this.api.getLabelProps())} class="combobox-label">Combobox Label</label>
        <div ${spread(this.api.getControlProps())} class="combobox-control">
          <input ${spread(this.api.getInputProps())} class="combobox-input" />
          <button ${spread(this.api.getTriggerProps())} class="combobox-trigger">▼</button>
          <button ${spread(this.api.getClearTriggerProps())} class="combobox-clear-trigger">x</button>
        </div>
        ${this.options.length > 0 &&
        html`<div ${spread(this.api.getContentProps())} class="combobox-content">
          ${this.options.map(
            (item) =>
              html`<div class="combobox-item" key="${item.code}" ${spread(this.api.getItemProps({ item }))}>
                ${item.label}
              </div>`,
          )}
        </div>`}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "combobox-element": Combobox
  }
}
