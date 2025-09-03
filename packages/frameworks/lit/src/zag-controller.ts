import type { Machine, MachineSchema } from "@zag-js/core"
import type { ReactiveController, ReactiveControllerHost } from "lit"
import { LitMachine } from "./machine"

export class ZagController<T extends MachineSchema> implements ReactiveController {
  private machine: LitMachine<T>
  public api: any // Will be set in constructor and updated on changes

  constructor(
    private host: ReactiveControllerHost,
    machineConfig: Machine<T>,
    props: Partial<T["props"]> = {},
  ) {
    this.machine = new LitMachine(machineConfig, props)
    host.addController(this)
  }

  hostConnected() {
    this.machine.subscribe(() => {
      // Update API when machine state changes
      this.updateApi()
      // Request Lit component update
      this.host.requestUpdate()
    })
    this.machine.start()
    this.updateApi()
    // Trigger initial update to sync with host element
    this.host.requestUpdate()
  }

  hostDisconnected() {
    this.machine.stop()
  }

  private updateApi() {
    // This will be implemented once we have the connect function
    // For now, just expose the service
    this.api = this.machine.service
  }

  // Expose machine methods for advanced usage
  get service() {
    return this.machine.service
  }

  send = (event: any) => {
    this.machine.send(event)
  }
}
