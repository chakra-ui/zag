import type { Machine, MachineSchema } from "@zag-js/core"
import type { ReactiveController, ReactiveControllerHost } from "lit"
import { LitMachine } from "./machine"

export class MachineController<TSchema extends MachineSchema> implements ReactiveController {
  private machine: LitMachine<TSchema>

  constructor(
    private host: ReactiveControllerHost,
    machineConfig: Machine<TSchema>,
    getProps?: () => Partial<TSchema["props"]> & { getRootNode?: () => ShadowRoot | Document | Node | null },
  ) {
    this.machine = new LitMachine(machineConfig, getProps)

    // Register for lifecycle updates
    host.addController(this)
  }

  hostConnected() {
    // Start the machine when the host is connected
    this.machine.subscribe(() => {
      // Request Lit component update
      this.host.requestUpdate()
    })
    this.machine.start()
  }

  hostDisconnected() {
    this.machine.stop()
  }

  // Expose machine methods for advanced usage
  get service() {
    return this.machine.service
  }
}
