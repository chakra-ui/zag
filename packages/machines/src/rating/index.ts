import { ratingConnect } from "./rating.connect"
import { ratingMachine } from "./rating.machine"

export const rating = {
  machine: ratingMachine,
  connect: ratingConnect,
}

export type { RatingMachineContext, RatingMachineState } from "./rating.machine"
