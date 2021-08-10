import { connectRatingMachine } from "./rating.connect"
import { ratingMachine } from "./rating.machine"

export const rating = {
  machine: ratingMachine,
  connect: connectRatingMachine,
}

export type { RatingMachineContext, RatingMachineState } from "./rating.machine"
