import { type ControlRecord, deepGet, deepSet, getControlDefaults } from "@zag-js/shared"
import type { ReactiveController, ReactiveControllerHost } from "lit"

export class ControlsController<T extends ControlRecord> implements ReactiveController {
  private host: ReactiveControllerHost
  private state: any
  private config: T

  constructor(host: ReactiveControllerHost, config: T) {
    this.host = host
    this.config = config
    this.state = getControlDefaults(config)
    host.addController(this)
  }

  hostConnected() {
    // Nothing needed here for now
  }

  hostDisconnected() {
    // Nothing needed here for now
  }

  get context() {
    return this.state
  }

  setState(key: string, value: any) {
    const newState = structuredClone(this.state)
    deepSet(newState, key, value)
    this.state = newState
    this.host.requestUpdate()
  }

  getValue(key: string) {
    return deepGet(this.state, key)
  }

  getControlKeys() {
    return Object.keys(this.config)
  }

  getControlConfig(key: string) {
    return this.config[key] as any
  }
}
