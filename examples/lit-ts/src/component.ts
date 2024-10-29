import { Machine, StateFrom, StateMachine } from "@zag-js/core"
import { LitElement } from "lit"
import { state } from "lit/decorators.js"

interface ComponentInterface<Api, Service> {
  api: Api
  service: Service
  state: StateFrom<Service>
}

export abstract class Component<
    Context extends Record<string, any>,
    Api,
    Service extends Machine<any, any, StateMachine.AnyEventObject>,
  >
  extends LitElement
  implements ComponentInterface<Api, Service>
{
  api: Api
  service: Service

  @state()
  state: StateFrom<Service>

  abstract initService(context: Context): Service
  abstract initApi(): Api

  constructor(context: Context) {
    super()
    this.service = this.initService(context)
    this.service._created()

    this.state = this.service.getState() as StateFrom<Service>
    this.api = this.initApi()

    this.service.subscribe((state) => {
      this.state = state as StateFrom<Service>
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
