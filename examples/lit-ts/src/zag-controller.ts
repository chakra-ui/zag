import type { Machine, MachineSchema, Service } from "@zag-js/core"
import type { NormalizeProps } from "@zag-js/types"
import type { ReactiveController, ReactiveControllerHost } from "lit"
import { normalizeProps, VanillaMachine } from "./lib"
import { createId } from "./lib/create-id"

export class ZagController<Api, T extends MachineSchema> implements ReactiveController {
  host: ReactiveControllerHost

  private id = createId()
  private connect: (service: Service<any>, normalize: NormalizeProps<any>) => Api

  machine: VanillaMachine<any>
  api: Api

  constructor(
    host: ReactiveControllerHost,
    connect: (service: Service<T>, normalize: NormalizeProps<any>) => Api,
    machine: Machine<T>,
    userProps: Partial<T["props"]> = {},
  ) {
    // Store a reference to the host
    this.host = host
    // Register for lifecycle updates
    host.addController(this)

    this.connect = connect

    this.machine = new VanillaMachine(machine, { ...userProps, id: this.id })
    this.api = this.connect(this.machine.service, normalizeProps)
  }

  hostConnected() {
    // Start the machine when the host is connected
    this.machine.subscribe(() => {
      this.api = this.connect(this.machine.service, normalizeProps)
      this.host.requestUpdate()
    })
    this.machine.start()
  }
  hostDisconnected() {
    // Stop the machine when the host is disconnected
    this.machine.stop()
  }
}
