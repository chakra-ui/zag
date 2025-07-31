import { LitElement } from "lit"
import { VanillaMachine } from "./lib"
import { createId } from "./lib/create-id"

interface ComponentInterface<Api> {
  machine: VanillaMachine<any>
  api: Api
}

export abstract class Component<Api> extends LitElement implements ComponentInterface<Api> {
  id: string = createId()
  machine: VanillaMachine<any>
  api: Api

  constructor() {
    super()
    this.machine = this.initMachine()
    this.api = this.initApi()
  }

  abstract initMachine(): VanillaMachine<any>
  abstract initApi(): Api

  override connectedCallback(): void {
    super.connectedCallback()

    this.machine.subscribe((service) => {
      this.api = this.initApi()
      this.requestUpdate()
    })
    this.machine.start()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()

    this.machine.stop()
  }
}
