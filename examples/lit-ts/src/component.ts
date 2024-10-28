import { Machine, StateFrom } from "@zag-js/core"
import { LitElement } from "lit"
import { state } from "lit/decorators.js"

interface ComponentInterface<Api, Service> {
  api: Api
  service: ReturnType<any>
  state: StateFrom<Service>
}

export abstract class Component<Context, Api, Service> extends LitElement implements ComponentInterface<Api, Service> {
  api: Api
  service: ReturnType<any>

  @state()
  state: StateFrom<Service>

  abstract initService(context: Context): Machine<any, any, any>
  abstract initApi(): Api

  constructor(context: Context) {
    super()
    this.service = this.initService(context)
    this.service._created()

    this.state = this.service.getState()
    this.api = this.initApi()

    this.service.subscribe((state: StateFrom<Service>) => {
      this.state = state
      this.api = this.initApi()
    })
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.service.start()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.service.stop()
  }
}
