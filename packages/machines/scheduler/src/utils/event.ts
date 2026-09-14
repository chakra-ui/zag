import type { SchedulerEvent, SchedulerPayload, SchedulerResource } from "../scheduler.types"

export function findEvent<E extends SchedulerPayload>(
  events: SchedulerEvent<E>[] | undefined,
  id: string | undefined,
): SchedulerEvent<E> | undefined {
  if (id == null) return undefined
  return events?.find((event) => event.id === id)
}

export function findResource<E extends SchedulerPayload>(
  resources: SchedulerResource<E>[] | undefined,
  event: SchedulerEvent<E> | undefined,
): SchedulerResource<E> | undefined {
  if (!event?.resourceId) return undefined
  return resources?.find((resource) => resource.id === event.resourceId)
}
