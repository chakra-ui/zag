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
    this.machine.subscribe(() => {
      this.host.requestUpdate()
    })
  }

  hostUpdated(): void {
    // Start the machine after the initial html has been rendered
    if (!this.machine.started) {
      this.machine.start()
    }
  }

  hostDisconnected() {
    this.machine.stop()
  }

  get service() {
    return this.machine.service
  }
}
