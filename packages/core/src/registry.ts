import type { Machine, MachineSchema, Service } from "./types"

/**
 * A running machine, as framework adapters report it. `service` is the latest
 * one the adapter built, so it always reads current state.
 */
export interface MachineRecord<T extends MachineSchema = any> {
  machine: Machine<T>
  service: Service<T>
}

type MachineListener = (record: MachineRecord, mounted: boolean) => void

// Kept on globalThis so two copies of core on one page share one set.
const key = Symbol.for("zag-js.machine-listeners")

function getListeners(): Set<MachineListener> {
  const store = globalThis as any
  store[key] ??= new Set<MachineListener>()
  return store[key]
}

/**
 * Hears every machine that mounts or unmounts from now on, like an agent bridge
 * or devtools. Returns a function that stops listening.
 */
export function subscribeMachines(listener: MachineListener): VoidFunction {
  const listeners = getListeners()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** For framework adapters: report that a machine mounted (`true`) or unmounted (`false`). */
export function reportMachine(record: MachineRecord, mounted: boolean) {
  const listeners = getListeners()
  if (!listeners.size) return
  listeners.forEach((listener) => listener(record, mounted))
}
